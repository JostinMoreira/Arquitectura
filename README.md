# 🎬 Recomenda - Sistema de Recomendaciones Inteligente

Una aplicación web moderna de recomendaciones personalizadas para películas, series, anime, libros, juegos y música, construida con React, TypeScript, Supabase y siguiendo el patrón de diseño Strategy.

## ✨ Características

- 🔐 **Autenticación completa** con Supabase (registro/login)
- 👤 **Perfil de usuario** con estadísticas y favoritos
- ❤️ **Sistema de favoritos** para guardar contenido preferido
- 📊 **Estadísticas personales** por categoría
- 🎨 **Interfaz moderna y animada** con Tailwind CSS y animaciones personalizadas
- 🎯 **Recomendaciones personalizadas** basadas en preferencias del usuario
- 📱 **Responsive design** que funciona en todos los dispositivos
- 🔍 **Búsqueda avanzada** en cada categoría
- 🎭 **6 categorías de contenido**: Películas, Series, Anime, Libros, Juegos, Música
- 🏗️ **Patrón Strategy** para gestión de servicios de recomendación
- ⚡ **APIs reales** integradas para obtener contenido actualizado

## 🛠️ Tecnologías Utilizadas

- **Frontend Framework**: React 18 con TypeScript
- **Styling**: Tailwind CSS con animaciones personalizadas
- **UI Components**: shadcn/ui
- **Autenticación y Base de Datos**: Supabase
- **Patrón de Diseño**: Strategy Pattern

## 📚 APIs Integradas (TODAS PÚBLICAS ✅)

### 1. **TMDB (The Movie Database)** - Películas y Series (Opcional)
- **URL**: https://www.themoviedb.org/
- **Registro**: Gratuito y opcional
- **Características**: Catálogo masivo con imágenes de alta calidad

### 2. **Jikan** - Anime ✅ (100% Pública)
- **URL**: https://jikan.moe/
- **Registro**: ❌ NO requiere API key
- **Características**: API de MyAnimeList, datos completos de anime

### 3. **Open Library** - Libros ✅ (100% Pública)
- **URL**: https://openlibrary.org/developers/api
- **Registro**: ❌ NO requiere API key
- **Características**: Millones de libros con portadas

### 4. **FreeToGame** - Juegos ✅ (100% Pública)
- **URL**: https://www.freetogame.com/api-doc
- **Registro**: ❌ NO requiere API key
- **Características**: Base de datos de juegos gratuitos

### 5. **iTunes Search** - Música ✅ (100% Pública)
- **URL**: https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/
- **Registro**: ❌ NO requiere API key
- **Características**: Álbumes y artistas de iTunes
3. Llena el formulario de aplicación
4. Recibe tu API key

## 🚀 Configuración del Proyecto

### 1. Instalar Dependencias

```bash
npm install @supabase/supabase-js lucide-react
```

### 2. Configurar Supabase

1. **Crear cuenta en Supabase:**
   - Ve a https://supabase.com/
   - Crea una cuenta gratuita
   - Crea un nuevo proyecto

2. **Configurar Base de Datos:**
   
   Ejecuta el SQL completo disponible en el archivo `supabase-queries.sql`:

```bash
# El archivo contiene:
# - Tabla user_preferences (preferencias del usuario)
# - Tabla user_favorites (favoritos del usuario)  
# - Tabla user_profiles (perfil público del usuario)
# - Tabla user_stats (estadísticas de uso)
# - Políticas RLS (Row Level Security)
# - Triggers automáticos
# - Funciones helper
```

   O ejecuta este SQL mínimo en el SQL Editor de Supabase:

```sql
-- Crear tabla de preferencias de usuario
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  favorite_genres TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Habilitar Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias preferencias
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propias preferencias
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias preferencias
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propias preferencias
CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

3. **Obtener credenciales:**
   - En tu dashboard de Supabase, ve a Settings > API
   - Copia la `Project URL` y `anon/public` key

### 3. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` y agrega tus API keys:

```env
# Supabase
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# TMDB (Películas y Series)
VITE_TMDB_API_KEY=tu_tmdb_api_key

# RAWG (Videojuegos)
VITE_RAWG_API_KEY=tu_rawg_api_key

# Google Books
VITE_GOOGLE_BOOKS_API_KEY=tu_google_books_api_key

# Last.fm (Música)
VITE_LASTFM_API_KEY=tu_lastfm_api_key

# Nota: Jikan (Anime) no requiere API key
```

### 4. Iniciar la Aplicación

```bash
npm run dev
```

## 🏗️ Arquitectura - Patrón Strategy

El proyecto utiliza el **Patrón Strategy** para gestionar diferentes fuentes de recomendaciones:

```
RecommendationStrategy (Interface)
├── MovieRecommendationStrategy
├── SeriesRecommendationStrategy
├── AnimeRecommendationStrategy
├── BookRecommendationStrategy
├── GameRecommendationStrategy
└── MusicRecommendationStrategy
```

**Ventajas:**
- ✅ Fácil de extender con nuevas categorías
- ✅ Cada estrategia encapsula su lógica de API
- ✅ Código mantenible y testeable
- ✅ Cambio de estrategia en tiempo de ejecución

**Uso:**
```typescript
// Crear estrategia específica
const strategy = RecommendationStrategyFactory.createStrategy('movies');

// Usar contexto
const context = new RecommendationContext(strategy);
const recommendations = await context.getRecommendations(['Acción', 'Sci-Fi']);
```

## 📁 Estructura del Proyecto

```
codigo nuevoV2/
├── lib/
│   ├── supabase.ts              # Configuración de Supabase
│   └── recommendationStrategy.ts # Patrón Strategy
├── components/
│   ├── LoginPage.tsx             # Autenticación
│   ├── PreferencesPage.tsx       # Selección de preferencias
│   ├── HomePage.tsx              # Página principal
│   ├── RecommendationsPage.tsx   # Recomendaciones
│   └── ui/                       # Componentes UI (shadcn/ui)
├── styles/
│   └── globals.css               # Estilos y animaciones
├── App.tsx                       # Componente principal
├── .env                          # Variables de entorno (NO commitear)
└── .env.example                  # Ejemplo de variables

```

## 🎨 Características de la Interfaz

### Animaciones Personalizadas
- **Gradient animado** en el login
- **Hover effects** en tarjetas de recomendaciones
- **Transiciones suaves** en navegación
- **Loading states** elegantes
- **Scale animations** en botones y cards

### Responsive Design
- Mobile-first approach
- Breakpoints optimizados
- Menú adaptativo
- Grids responsivas

## 🔒 Seguridadtodas las funciones
5. **Recomendaciones** → Ve contenido personalizado por categoría
6. **Búsqueda** → Busca contenido específico dentro de cada categoría
7. **Favoritos** → Guarda contenido con el botón de corazón
8. **Perfil** → Ve estadísticas y gestiona favoritos guardados
- ✅ Row Level Security (RLS) en base de datos
- ✅ Variables de entorno para API keys
- ✅ Validación de inputs
- ✅ Protección contra inyección SQL

## 📝 Flujo de Usuario

1. **Registro/Login** → Usuario se autentica con email/contraseña
2. **Selección de Categorías** → Elige entre 6 categorías
3. **Selección de Géneros** → Elige sus géneros favoritos
4. **Home** → Vista principal con acceso a recomendaciones
5. **Recomendaciones** → Ve contenido personalizado por categoría
6. **Búsqueda** → Busca contenido específico dentro de cada categoría

## 🚨 Troubleshooting

### Error: "No API Key"
**Solución**: Verifica que el archivo `.env` esté en la raíz del proyecto y que las variables tengan el prefijo `VITE_`.

### Error de CORS en APIs
**Solución**: Algunas APIs tienen restricciones de dominio. Verifica en su documentación.

### Rate Limiting en Jikan API
**Solución**: La API de Jikan tiene rate limits. El código incluye delays automáticos (1 segundo entre requests).

### Error de Supabase Auth
**Solución**: 
1. Verifica que las credenciales en `.env` sean correctas
2. Asegúrate de que el Email Auth esté habilitado en Supabase
3. Verifica las políticas RLS en la base de datos

## 🎯 Edición de perfil de usuario
- [ ] Listas personalizadas de contenido
- [ ] Compartir recomendaciones en redes sociales
- [ ] Sistema de calificaciones propio
- [ ] Recomendaciones basadas en IA
- [ ] Modo oscuro/claro toggle
- [ ] Notificaciones de nuevo contenido
- [ ] Importar/exportar favoritos
- [ ] Comentarios y reseñas
- [ ] Notificaciones de nuevo contenido
- [ ] Perfil de usuario avanzado

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si necesitas ayuda:
1. Revisa la documentación de las APIs
2. Verifica la configuración de Supabase
3. Asegúrate de tener todas las dependencias instaladas

---

**¡Disfruta descubriendo nuevo contenido con Recomenda! 🎬📚🎮🎵**
