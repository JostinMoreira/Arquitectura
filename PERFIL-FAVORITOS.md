# 👤 Sistema de Perfil y Favoritos - Guía Completa

## 📋 Tabla de Contenidos
1. [Características del Sistema](#características-del-sistema)
2. [Configuración de Base de Datos](#configuración-de-base-de-datos)
3. [Uso del Sistema](#uso-del-sistema)
4. [Estructura de Datos](#estructura-de-datos)
5. [APIs y Endpoints](#apis-y-endpoints)

## ✨ Características del Sistema

### 1. **Perfil de Usuario**
- ✅ Nombre de usuario personalizable
- ✅ Avatar (iniciales por defecto)
- ✅ Biografía y descripción personal
- ✅ Ubicación y sitio web
- ✅ Estadísticas en tiempo real

### 2. **Sistema de Favoritos**
- ✅ Guardar contenido de cualquier categoría
- ✅ Organización por tipo de contenido
- ✅ Vista filtrada por categoría
- ✅ Contador de favoritos por tipo
- ✅ Eliminación rápida de favoritos

### 3. **Estadísticas**
- ✅ Total de favoritos guardados
- ✅ Contador por cada categoría (películas, series, anime, libros, juegos, música)
- ✅ Fecha de última actividad
- ✅ Actualización automática mediante triggers

## 🗄️ Configuración de Base de Datos

### Opción 1: SQL Completo (Recomendado)

Ejecuta el archivo completo `supabase-queries.sql` que incluye:

```bash
# En el SQL Editor de Supabase, ejecuta:
# 1. Ve a SQL Editor
# 2. Abre supabase-queries.sql
# 3. Copia y pega todo el contenido
# 4. Ejecuta (Run)
```

### Opción 2: SQL Paso a Paso

#### Paso 1: Crear Tablas

```sql
-- Tabla de Favoritos
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id VARCHAR(255) NOT NULL,
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('movies', 'series', 'anime', 'books', 'games', 'music')),
  title VARCHAR(500) NOT NULL,
  image_url TEXT,
  description TEXT,
  genre VARCHAR(100),
  rating DECIMAL(3,1),
  year INTEGER,
  additional_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, content_id, content_type)
);

-- Tabla de Perfiles
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  website VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Tabla de Estadísticas
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  total_favorites INTEGER DEFAULT 0,
  movies_count INTEGER DEFAULT 0,
  series_count INTEGER DEFAULT 0,
  anime_count INTEGER DEFAULT 0,
  books_count INTEGER DEFAULT 0,
  games_count INTEGER DEFAULT 0,
  music_count INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);
```

#### Paso 2: Habilitar Row Level Security

```sql
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
```

#### Paso 3: Crear Políticas

```sql
-- Políticas para user_favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para user_profiles
CREATE POLICY "Anyone can view profiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para user_stats
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);
```

#### Paso 4: Crear Triggers Automáticos

```sql
-- Función para actualizar estadísticas
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_content_type VARCHAR(50);
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_user_id := NEW.user_id;
        v_content_type := NEW.content_type;
        
        INSERT INTO user_stats (user_id, total_favorites, last_activity)
        VALUES (v_user_id, 1, now())
        ON CONFLICT (user_id)
        DO UPDATE SET
            total_favorites = user_stats.total_favorites + 1,
            last_activity = now();
            
        EXECUTE format('
            UPDATE user_stats
            SET %I = %I + 1
            WHERE user_id = $1
        ', v_content_type || '_count', v_content_type || '_count')
        USING v_user_id;
        
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        v_user_id := OLD.user_id;
        v_content_type := OLD.content_type;
        
        UPDATE user_stats
        SET
            total_favorites = GREATEST(total_favorites - 1, 0),
            last_activity = now()
        WHERE user_id = v_user_id;
        
        EXECUTE format('
            UPDATE user_stats
            SET %I = GREATEST(%I - 1, 0)
            WHERE user_id = $1
        ', v_content_type || '_count', v_content_type || '_count')
        USING v_user_id;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para actualizar estadísticas
CREATE TRIGGER update_stats_on_favorite
    AFTER INSERT OR DELETE ON user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();
```

## 🎮 Uso del Sistema

### 1. Añadir a Favoritos

En la página de recomendaciones, cada tarjeta tiene un botón de corazón:

```tsx
// Click en el corazón vacío → Añade a favoritos
// Click en el corazón lleno → Elimina de favoritos
```

**Comportamiento:**
- El corazón se llena de rojo cuando es favorito
- Se actualiza la base de datos automáticamente
- Las estadísticas se actualizan en tiempo real
- Aparece inmediatamente en el perfil

### 2. Ver Perfil

Navega a tu perfil desde el botón "Perfil" en el header:

**Información mostrada:**
- Avatar con iniciales
- Nombre de usuario
- Email
- Estadísticas generales
- Última actividad
- Contador por categoría

### 3. Gestionar Favoritos en Perfil

**Filtros disponibles:**
- Todos
- Películas
- Series
- Anime
- Libros
- Juegos
- Música

**Acciones:**
- Click en categoría → Filtra solo esa categoría
- Click en corazón rojo → Elimina el favorito
- Ordenados por fecha añadida (más recientes primero)

## 📊 Estructura de Datos

### Tabla: user_favorites

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único del favorito |
| `user_id` | UUID | ID del usuario (FK) |
| `content_id` | VARCHAR | ID del contenido en la API externa |
| `content_type` | VARCHAR | Tipo: movies, series, anime, books, games, music |
| `title` | VARCHAR | Título del contenido |
| `image_url` | TEXT | URL de la imagen/poster |
| `description` | TEXT | Descripción del contenido |
| `genre` | VARCHAR | Género |
| `rating` | DECIMAL | Calificación (0-5) |
| `year` | INTEGER | Año de lanzamiento |
| `additional_info` | JSONB | Información extra (director, autor, etc) |
| `created_at` | TIMESTAMP | Fecha añadido |

### Tabla: user_profiles

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único del perfil |
| `user_id` | UUID | ID del usuario (FK) |
| `display_name` | VARCHAR | Nombre público |
| `avatar_url` | TEXT | URL del avatar |
| `bio` | TEXT | Biografía |
| `location` | VARCHAR | Ubicación |
| `website` | VARCHAR | Sitio web |
| `created_at` | TIMESTAMP | Fecha creación |
| `updated_at` | TIMESTAMP | Última actualización |

### Tabla: user_stats

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único |
| `user_id` | UUID | ID del usuario (FK) |
| `total_favorites` | INTEGER | Total de favoritos |
| `movies_count` | INTEGER | Contador de películas |
| `series_count` | INTEGER | Contador de series |
| `anime_count` | INTEGER | Contador de anime |
| `books_count` | INTEGER | Contador de libros |
| `games_count` | INTEGER | Contador de juegos |
| `music_count` | INTEGER | Contador de música |
| `last_activity` | TIMESTAMP | Última actividad |

## 🔌 APIs y Endpoints

### Añadir Favorito

```typescript
const { error } = await supabase
  .from('user_favorites')
  .insert({
    user_id: userId,
    content_id: rec.id,
    content_type: rec.category,
    title: rec.title,
    image_url: rec.image,
    description: rec.description,
    genre: rec.genre,
    rating: rec.rating,
    year: rec.year,
    additional_info: rec.additionalInfo || {},
  });
```

### Eliminar Favorito

```typescript
const { error } = await supabase
  .from('user_favorites')
  .delete()
  .eq('user_id', userId)
  .eq('content_id', contentId)
  .eq('content_type', contentType);
```

### Obtener Favoritos

```typescript
// Todos los favoritos
const { data } = await supabase
  .from('user_favorites')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// Por categoría
const { data } = await supabase
  .from('user_favorites')
  .select('*')
  .eq('user_id', userId)
  .eq('content_type', 'movies')
  .order('created_at', { ascending: false });
```

### Obtener Estadísticas

```typescript
const { data } = await supabase
  .from('user_stats')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Obtener Perfil

```typescript
const { data } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();
```

## 🔒 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

- ✅ Los usuarios solo pueden ver sus propios datos
- ✅ Los usuarios solo pueden modificar sus propios datos
- ✅ Los perfiles son públicos (solo lectura)
- ✅ Las estadísticas son privadas

### Validaciones

- ✅ No se permiten duplicados (mismo contenido + usuario)
- ✅ content_type debe ser uno de los 6 tipos válidos
- ✅ user_id debe corresponder a un usuario autenticado
- ✅ Cascada de eliminación (si se elimina el usuario, se eliminan sus datos)

## 🎨 Personalización

### Editar Perfil (Próximamente)

```typescript
const { error } = await supabase
  .from('user_profiles')
  .update({
    display_name: 'Nuevo Nombre',
    bio: 'Mi biografía actualizada',
    location: 'Ciudad, País',
  })
  .eq('user_id', userId);
```

## 📈 Consultas Útiles

### Top 10 Favoritos Más Recientes

```sql
SELECT * FROM user_favorites 
WHERE user_id = 'uuid-del-usuario'
ORDER BY created_at DESC 
LIMIT 10;
```

### Contar Favoritos por Género

```sql
SELECT genre, COUNT(*) as count
FROM user_favorites 
WHERE user_id = 'uuid-del-usuario'
GROUP BY genre
ORDER BY count DESC;
```

### Estadísticas Globales del Usuario

```sql
SELECT * FROM user_complete_profile 
WHERE user_id = 'uuid-del-usuario';
```

## 🚨 Troubleshooting

### Error: "duplicate key value"
**Problema**: Intentas añadir el mismo contenido dos veces  
**Solución**: Ya está en favoritos, refrescar el estado del UI

### Error: "new row violates row-level security policy"
**Problema**: Intentas acceder a datos de otro usuario  
**Solución**: Verifica que estés usando el userId correcto

### Las estadísticas no se actualizan
**Problema**: El trigger no está funcionando  
**Solución**: Verifica que el trigger esté creado:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'update_stats_on_favorite';
```

## 🎯 Mejoras Futuras

- [ ] Edición completa de perfil
- [ ] Upload de avatar personalizado
- [ ] Listas personalizadas (watchlist, completado, etc)
- [ ] Compartir perfil con otros usuarios
- [ ] Exportar favoritos a JSON/CSV
- [ ] Importar favoritos desde otras plataformas

---

**¡Sistema de Perfil y Favoritos Completamente Funcional! ❤️**
