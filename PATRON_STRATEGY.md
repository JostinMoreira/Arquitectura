# Patrón Strategy - Sistema de Recomendaciones

## 📋 Descripción General

Este proyecto implementa el **Patrón de Diseño Strategy** (Estrategia) para proporcionar diferentes algoritmos de búsqueda y recomendación de contenido multimedia (películas, series, anime, libros, juegos y música).

## 🎯 ¿Qué es el Patrón Strategy?

El patrón Strategy es un patrón de diseño de comportamiento que permite definir una familia de algoritmos, encapsular cada uno de ellos y hacerlos intercambiables. Este patrón permite que el algoritmo varíe independientemente de los clientes que lo utilizan.

### Ventajas del Patrón Strategy:
- ✅ **Extensibilidad**: Fácil agregar nuevas estrategias sin modificar código existente
- ✅ **Separación de responsabilidades**: Cada estrategia está aislada en su propia clase
- ✅ **Intercambiabilidad**: Se puede cambiar de estrategia en tiempo de ejecución
- ✅ **Principio Open/Closed**: Abierto para extensión, cerrado para modificación
- ✅ **Eliminación de condicionales complejos**: Reemplaza múltiples if/else o switch

---

## 🏗️ Arquitectura de la Implementación

```
┌─────────────────────────────────────────────────────────────┐
│                   RecommendationContext                      │
│  (Cliente que usa las estrategias)                          │
│  - Mantiene referencia a una estrategia                     │
│  - Delega operaciones a la estrategia actual                │
└─────────────────────────────────────────────────────────────┘
                             │
                             │ usa
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              RecommendationStrategy (Interface)              │
│  + fetchRecommendations(genres, limit)                      │
│  + searchByKeyword(keyword, limit)                          │
│  + getDetails(id)                                           │
└─────────────────────────────────────────────────────────────┘
                             △
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            │                │                │
┌───────────┴───────┐  ┌────┴─────────┐  ┌──┴──────────────┐
│ MovieStrategy     │  │ SeriesStrategy│  │ AnimeStrategy   │
│ (TMDB estático)   │  │ (TMDB estático│  │ (Jikan API)     │
├───────────────────┤  ├───────────────┤  ├─────────────────┤
│ - moviesData[]    │  │ - seriesData[]│  │ - baseUrl       │
│ + fetch...()      │  │ + fetch...()  │  │ + fetch...()    │
│ + search...()     │  │ + search...() │  │ + search...()   │
│ + getDetails()    │  │ + getDetails()│  │ + getDetails()  │
└───────────────────┘  └───────────────┘  └─────────────────┘

┌───────────────────┐  ┌───────────────┐  ┌─────────────────┐
│ BookStrategy      │  │ GameStrategy  │  │ MusicStrategy   │
│ (Open Library)    │  │ (Estático)    │  │ (iTunes API)    │
├───────────────────┤  ├───────────────┤  ├─────────────────┤
│ - baseUrl         │  │ - gamesData[] │  │ - baseUrl       │
│ + fetch...()      │  │ + fetch...()  │  │ + fetch...()    │
│ + search...()     │  │ + search...() │  │ + search...()   │
│ + getDetails()    │  │ + getDetails()│  │ + getDetails()  │
└───────────────────┘  └───────────────┘  └─────────────────┘

                             △
                             │
                             │ crea
                             │
┌─────────────────────────────────────────────────────────────┐
│        RecommendationStrategyFactory (Factory Method)        │
│  + createStrategy(category): RecommendationStrategy         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Código

### 1. **Interfaz Strategy** (`RecommendationStrategy`)

Define el contrato que todas las estrategias concretas deben implementar:

```typescript
export interface RecommendationStrategy {
  fetchRecommendations(genres: string[], limit?: number): Promise<Recommendation[]>;
  searchByKeyword(keyword: string, limit?: number): Promise<Recommendation[]>;
  getDetails(id: string): Promise<Recommendation | null>;
}
```

**Ubicación**: `lib/recommendationStrategy.ts` (líneas 23-27)

### 2. **Estrategias Concretas**

Cada estrategia implementa la interfaz de forma diferente:

#### a) `MovieRecommendationStrategy`
- **Propósito**: Gestionar recomendaciones de películas
- **Fuente de datos**: Array estático de películas (Oppenheimer, Barbie, Dune, etc.)
- **Ubicación**: `lib/recommendationStrategy.ts` (líneas 33-77)
- **Características**:
  - Datos locales por problemas de CORS con TMDB API
  - Búsqueda por título usando filtrado de array
  - Rating fijo de 4.5

```typescript
export class MovieRecommendationStrategy implements RecommendationStrategy {
  private moviesData = [
    { id: '1', title: 'Oppenheimer', genre: 'Drama', year: 2023, ... },
    // ...más películas
  ];

  async fetchRecommendations(_genres: string[], limit: number = 10): Promise<Recommendation[]> {
    return this.moviesData.slice(0, limit).map(movie => ({
      ...movie,
      category: 'movies' as const,
      rating: 4.5,
      additionalInfo: { director: 'Director destacado' },
    }));
  }
  // ...más métodos
}
```

#### b) `SeriesRecommendationStrategy`
- **Propósito**: Gestionar recomendaciones de series TV
- **Fuente de datos**: Array estático (The Last of Us, Mandalorian, etc.)
- **Ubicación**: `lib/recommendationStrategy.ts` (líneas 83-127)

#### c) `AnimeRecommendationStrategy`
- **Propósito**: Gestionar recomendaciones de anime
- **Fuente de datos**: **Jikan API** (MyAnimeList público)
- **Ubicación**: `lib/recommendationStrategy.ts` (líneas 133-205)
- **Características**:
  - API REST real con rate limiting (1 segundo entre requests)
  - Conversión de rating de escala 10 a escala 5
  - Manejo de errores con try/catch

```typescript
export class AnimeRecommendationStrategy implements RecommendationStrategy {
  private baseUrl = 'https://api.jikan.moe/v4';

  async fetchRecommendations(_genres: string[], limit: number = 10): Promise<Recommendation[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
      
      const response = await fetch(`${this.baseUrl}/top/anime?limit=${limit}`);
      const data = await response.json();
      
      return data.data.map((anime: any) => ({
        id: anime.mal_id.toString(),
        title: anime.title,
        category: 'anime' as const,
        rating: anime.score / 2 || 4.0, // Conversión de escala
        // ...más campos
      }));
    } catch (error) {
      console.error('Error fetching anime:', error);
      return [];
    }
  }
}
```

#### d) `BookRecommendationStrategy`
- **Propósito**: Gestionar recomendaciones de libros
- **Fuente de datos**: **Open Library API**
- **Ubicación**: `lib/recommendationStrategy.ts` (líneas 211-283)
- **Características**:
  - API pública sin autenticación
  - Búsqueda por subject y keywords
  - Generación de imágenes de portada dinámicas

#### e) `GameRecommendationStrategy`
- **Propósito**: Gestionar recomendaciones de juegos
- **Fuente de datos**: Array estático (Fortnite, LoL, Valorant, etc.)
- **Ubicación**: `lib/recommendationStrategy.ts` (líneas 289-333)
- **Razón de datos estáticos**: Problemas de CORS con FreeToGame API

#### f) `MusicRecommendationStrategy`
- **Propósito**: Gestionar recomendaciones de música
- **Fuente de datos**: **iTunes Search API**
- **Ubicación**: `lib/recommendationStrategy.ts` (líneas 339-413)
- **Características**:
  - Búsqueda de álbumes
  - Conversión de imágenes a alta resolución (600x600)

### 3. **Contexto** (`RecommendationContext`)

Clase que mantiene una referencia a una estrategia y delega las operaciones:

```typescript
export class RecommendationContext {
  private strategy: RecommendationStrategy;

  constructor(strategy: RecommendationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: RecommendationStrategy) {
    this.strategy = strategy;
  }

  async getRecommendations(genres: string[], limit?: number): Promise<Recommendation[]> {
    return this.strategy.fetchRecommendations(genres, limit);
  }

  async searchByKeyword(keyword: string, limit?: number): Promise<Recommendation[]> {
    return this.strategy.searchByKeyword(keyword, limit);
  }

  async getDetails(id: string): Promise<Recommendation | null> {
    return this.strategy.getDetails(id);
  }
}
```

**Ubicación**: `lib/recommendationStrategy.ts` (líneas 419-439)

**Responsabilidades**:
- Mantener referencia a la estrategia actual
- Permitir cambio de estrategia en tiempo de ejecución
- Delegar llamadas a la estrategia activa

### 4. **Factory** (`RecommendationStrategyFactory`)

Patrón Factory Method para crear instancias de estrategias:

```typescript
export class RecommendationStrategyFactory {
  static createStrategy(category: string): RecommendationStrategy {
    switch (category) {
      case 'movies':
        return new MovieRecommendationStrategy();
      case 'series':
        return new SeriesRecommendationStrategy();
      case 'anime':
        return new AnimeRecommendationStrategy();
      case 'books':
        return new BookRecommendationStrategy();
      case 'games':
        return new GameRecommendationStrategy();
      case 'music':
        return new MusicRecommendationStrategy();
      default:
        throw new Error(`Unknown category: ${category}`);
    }
  }
}
```

**Ubicación**: `lib/recommendationStrategy.ts` (líneas 445-467)

**Ventajas del Factory**:
- Centraliza la creación de estrategias
- Oculta la lógica de instanciación al cliente
- Facilita el testing (se puede mockear fácilmente)

---

## 🔄 Flujo de Ejecución

### Escenario: Usuario selecciona categoría "Anime"

```
1. Usuario hace clic en "Anime" en la UI
   │
   ├─> RecommendationsPage.tsx: handleCategorySelect('anime')
   │
2. Se llama a fetchRecommendations('anime')
   │
   ├─> Factory: createStrategy('anime')
   │   └─> return new AnimeRecommendationStrategy()
   │
3. Se crea el contexto con la estrategia
   │
   ├─> const context = new RecommendationContext(strategy)
   │
4. Se obtienen recomendaciones
   │
   ├─> context.getRecommendations(userPreferences.favoriteGenres, 12)
   │   │
   │   └─> strategy.fetchRecommendations(genres, 12)
   │       │
   │       └─> [AnimeRecommendationStrategy ejecuta]
   │           1. await setTimeout(1000) // Rate limiting
   │           2. fetch('https://api.jikan.moe/v4/top/anime?limit=12')
   │           3. Mapea respuesta a formato Recommendation
   │           4. return recommendations[]
   │
5. UI actualiza con recomendaciones de anime
```

### Escenario: Usuario busca "Naruto"

```
1. Usuario escribe "Naruto" y presiona Enter
   │
   ├─> RecommendationsPage.tsx: handleSearch()
   │
2. La estrategia ya está cargada (AnimeRecommendationStrategy)
   │
   ├─> context.searchByKeyword('Naruto', 12)
   │   │
   │   └─> strategy.searchByKeyword('Naruto', 12)
   │       │
   │       └─> [AnimeRecommendationStrategy ejecuta]
   │           1. await setTimeout(1000)
   │           2. fetch('https://api.jikan.moe/v4/anime?q=Naruto&limit=12')
   │           3. Filtra y mapea resultados
   │           4. return recommendations[]
   │
3. UI muestra resultados de búsqueda
```

---

## 💻 Uso en el Código

### En el componente React (`RecommendationsPage.tsx`):

```typescript
const fetchRecommendations = async (category: Category) => {
  setLoading(true);
  setSearchQuery('');
  try {
    // 1. Factory crea la estrategia apropiada
    const strategy = RecommendationStrategyFactory.createStrategy(category);
    
    // 2. Contexto usa la estrategia
    const context = new RecommendationContext(strategy);
    
    // 3. Obtiene recomendaciones usando la estrategia
    const results = await context.getRecommendations(userPreferences.favoriteGenres, 12);
    
    setRecommendations(results);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    setRecommendations([]);
  } finally {
    setLoading(false);
  }
};
```

**Líneas**: `components/RecommendationsPage.tsx` (líneas 78-92)

---

## 🎨 Modelo de Datos

### Interfaz `Recommendation`

Estructura común que todas las estrategias deben retornar:

```typescript
export interface Recommendation {
  id: string;                    // Identificador único
  title: string;                 // Título del contenido
  category: 'movies' | 'series' | 'anime' | 'books' | 'games' | 'music';
  genre: string;                 // Género (Drama, Acción, etc.)
  description: string;           // Descripción/sinopsis
  rating: number;                // Calificación (0-5)
  year: number;                  // Año de lanzamiento
  image: string;                 // URL de la imagen
  additionalInfo?: {             // Información adicional opcional
    director?: string;
    author?: string;
    artist?: string;
    platform?: string;
    duration?: string;
    episodes?: number;
  };
}
```

**Ubicación**: `lib/recommendationStrategy.ts` (líneas 5-21)

---

## 🚀 Extensibilidad: Agregar Nueva Estrategia

Si quisieras agregar una nueva categoría, por ejemplo **Podcasts**, seguirías estos pasos:

### Paso 1: Crear la Estrategia Concreta

```typescript
export class PodcastRecommendationStrategy implements RecommendationStrategy {
  private baseUrl = 'https://api.podcastindex.org';
  
  async fetchRecommendations(_genres: string[], limit: number = 10): Promise<Recommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/1.0/podcasts/trending?max=${limit}`);
      const data = await response.json();
      
      return data.feeds.map((podcast: any) => ({
        id: podcast.id.toString(),
        title: podcast.title,
        category: 'podcasts' as const,
        genre: podcast.categories?.[0] || 'General',
        description: podcast.description,
        rating: 4.0,
        year: new Date(podcast.newestItemPubdate * 1000).getFullYear(),
        image: podcast.artwork,
        additionalInfo: {
          author: podcast.author,
        },
      }));
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      return [];
    }
  }

  async searchByKeyword(keyword: string, limit: number = 10): Promise<Recommendation[]> {
    // Implementación de búsqueda
  }

  async getDetails(id: string): Promise<Recommendation | null> {
    // Implementación de detalles
  }
}
```

### Paso 2: Actualizar el Factory

```typescript
export class RecommendationStrategyFactory {
  static createStrategy(category: string): RecommendationStrategy {
    switch (category) {
      case 'movies':
        return new MovieRecommendationStrategy();
      // ...otras estrategias
      case 'podcasts':  // ← NUEVO
        return new PodcastRecommendationStrategy();
      default:
        throw new Error(`Unknown category: ${category}`);
    }
  }
}
```

### Paso 3: Actualizar el Type en el Frontend

```typescript
type Category = 'movies' | 'series' | 'anime' | 'books' | 'games' | 'music' | 'podcasts';

const CATEGORY_CONFIG = {
  // ...categorías existentes
  podcasts: { 
    name: 'Podcasts', 
    icon: Mic, 
    gradient: 'from-orange-500 to-orange-600' 
  },
};
```

**¡Y listo!** No necesitas modificar ninguna lógica existente, solo agregar código nuevo.

---

## 🧪 Testing con el Patrón Strategy

La arquitectura facilita el testing mediante mocks:

```typescript
// Mock de estrategia para testing
class MockMovieStrategy implements RecommendationStrategy {
  async fetchRecommendations(): Promise<Recommendation[]> {
    return [
      {
        id: 'test-1',
        title: 'Test Movie',
        category: 'movies',
        genre: 'Test',
        description: 'Test description',
        rating: 5.0,
        year: 2024,
        image: 'test.jpg',
      }
    ];
  }

  async searchByKeyword(): Promise<Recommendation[]> {
    return [];
  }

  async getDetails(): Promise<Recommendation | null> {
    return null;
  }
}

// En el test
describe('RecommendationContext', () => {
  it('should use the provided strategy', async () => {
    const mockStrategy = new MockMovieStrategy();
    const context = new RecommendationContext(mockStrategy);
    
    const results = await context.getRecommendations(['Drama'], 10);
    
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Test Movie');
  });
});
```

---

## 📊 Comparación: Con y Sin Patrón Strategy

### ❌ **Sin Patrón Strategy** (código acoplado):

```typescript
async function getRecommendations(category: string, genres: string[]) {
  if (category === 'movies') {
    // Lógica para películas
    const response = await fetch('...');
    // Procesamiento específico de películas
  } else if (category === 'series') {
    // Lógica para series
    const response = await fetch('...');
    // Procesamiento específico de series
  } else if (category === 'anime') {
    // Lógica para anime
    await setTimeout(1000); // Rate limiting
    const response = await fetch('...');
    // Procesamiento específico de anime
  }
  // ... más condicionales
}
```

**Problemas**:
- Función gigante con múltiples responsabilidades
- Difícil de testear
- Agregar categoría requiere modificar función existente
- Viola principio Open/Closed

### ✅ **Con Patrón Strategy** (código desacoplado):

```typescript
const strategy = RecommendationStrategyFactory.createStrategy(category);
const context = new RecommendationContext(strategy);
const results = await context.getRecommendations(genres, 12);
```

**Ventajas**:
- Código limpio y mantenible
- Fácil de testear (se puede mockear cada estrategia)
- Agregar categoría no modifica código existente
- Cumple principio Open/Closed

---

## 🎓 Principios SOLID Aplicados

### 1. **Single Responsibility Principle (SRP)**
Cada estrategia tiene una sola responsabilidad: gestionar un tipo de contenido.

### 2. **Open/Closed Principle (OCP)**
El sistema está abierto para extensión (agregar estrategias) pero cerrado para modificación (no tocamos código existente).

### 3. **Liskov Substitution Principle (LSP)**
Cualquier estrategia puede reemplazar a otra sin romper el código cliente.

### 4. **Interface Segregation Principle (ISP)**
La interfaz `RecommendationStrategy` es específica y no obliga a implementar métodos innecesarios.

### 5. **Dependency Inversion Principle (DIP)**
El contexto depende de la abstracción (`RecommendationStrategy`), no de implementaciones concretas.

---

## 📈 Métricas del Proyecto

- **Líneas de código**: ~470 líneas en `recommendationStrategy.ts`
- **Estrategias implementadas**: 6 (Movies, Series, Anime, Books, Games, Music)
- **APIs integradas**: 3 públicas (Jikan, Open Library, iTunes)
- **Métodos por estrategia**: 3 (fetchRecommendations, searchByKeyword, getDetails)
- **Tipo de datos retornado**: `Recommendation` (interfaz común)

---

## 🔗 Referencias

- **Libro**: "Design Patterns: Elements of Reusable Object-Oriented Software" - Gang of Four
- **Patrón Strategy**: https://refactoring.guru/design-patterns/strategy
- **Principios SOLID**: https://en.wikipedia.org/wiki/SOLID

---

## 👨‍💻 Autor

**Proyecto de Arquitectura de Software**  
Universidad: [Tu Universidad]  
Fecha: Enero 2026

---

## 📝 Notas Adicionales

### Decisiones de Diseño

1. **Uso de datos estáticos para Movies/Series/Games**:
   - Razón: Problemas de CORS y autenticación con APIs externas
   - Alternativa futura: Implementar backend proxy para llamadas API

2. **Rate limiting en Anime**:
   - Jikan API tiene límite de 60 requests/minuto
   - Implementado delay de 1 segundo entre llamadas

3. **Factory Method**:
   - Centraliza creación de estrategias
   - Facilita cambios futuros (ej: inyección de dependencias, configuración)

### Mejoras Futuras

- [ ] Implementar caché para reducir llamadas API
- [ ] Agregar retry logic para APIs inestables
- [ ] Implementar estrategia de fallback (si una API falla, usar datos locales)
- [ ] Agregar más fuentes de datos por categoría
- [ ] Implementar sistema de puntuación personalizada basado en preferencias
