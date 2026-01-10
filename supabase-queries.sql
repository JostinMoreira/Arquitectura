-- ============================================
-- QUERIES SQL PARA SUPABASE - RECOMENDA APP
-- ============================================

-- ============================================
-- 1. CREAR TABLA DE PREFERENCIAS DE USUARIO
-- ============================================

CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  favorite_genres TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- ============================================
-- 2. CREAR TABLA DE FAVORITOS/ME GUSTA
-- ============================================

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

-- Índices para mejorar rendimiento
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_content_type ON user_favorites(content_type);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- ============================================
-- 3. CREAR TABLA DE PERFIL DE USUARIO
-- ============================================

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

-- ============================================
-- 4. CREAR TABLA DE ESTADÍSTICAS DE USUARIO
-- ============================================

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

-- ============================================
-- 5. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. POLÍTICAS DE SEGURIDAD - USER_PREFERENCES
-- ============================================

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

-- ============================================
-- 7. POLÍTICAS DE SEGURIDAD - USER_FAVORITES
-- ============================================

-- Política: Los usuarios pueden ver sus propios favoritos
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propios favoritos
CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propios favoritos
CREATE POLICY "Users can update own favorites"
  ON user_favorites FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar sus propios favoritos
CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 8. POLÍTICAS DE SEGURIDAD - USER_PROFILES
-- ============================================

-- Política: Los usuarios pueden ver cualquier perfil (público)
CREATE POLICY "Anyone can view profiles"
  ON user_profiles FOR SELECT
  USING (true);

-- Política: Los usuarios pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden eliminar su propio perfil
CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. POLÍTICAS DE SEGURIDAD - USER_STATS
-- ============================================

-- Política: Los usuarios pueden ver sus propias estadísticas
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Los usuarios pueden insertar sus propias estadísticas
CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios pueden actualizar sus propias estadísticas
CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 10. FUNCIONES AUTOMÁTICAS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Función para actualizar estadísticas cuando se añade/elimina favorito
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_content_type VARCHAR(50);
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_user_id := NEW.user_id;
        v_content_type := NEW.content_type;
        
        -- Insertar o actualizar estadísticas
        INSERT INTO user_stats (user_id, total_favorites, last_activity)
        VALUES (v_user_id, 1, now())
        ON CONFLICT (user_id)
        DO UPDATE SET
            total_favorites = user_stats.total_favorites + 1,
            last_activity = now();
            
        -- Actualizar contador específico de categoría
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
        
        -- Actualizar estadísticas
        UPDATE user_stats
        SET
            total_favorites = GREATEST(total_favorites - 1, 0),
            last_activity = now()
        WHERE user_id = v_user_id;
        
        -- Actualizar contador específico de categoría
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

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear perfil
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
    
    -- Crear estadísticas
    INSERT INTO user_stats (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 11. TRIGGERS
-- ============================================

-- Trigger para updated_at en user_preferences
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at en user_profiles
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para updated_at en user_stats
CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar estadísticas al añadir/eliminar favoritos
CREATE TRIGGER update_stats_on_favorite
    AFTER INSERT OR DELETE ON user_favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Trigger para crear perfil automáticamente al registrarse
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- ============================================
-- 12. VISTAS ÚTILES
-- ============================================

-- Vista para obtener perfil completo del usuario
CREATE OR REPLACE VIEW user_complete_profile AS
SELECT
    up.user_id,
    up.display_name,
    up.avatar_url,
    up.bio,
    up.location,
    up.website,
    us.total_favorites,
    us.movies_count,
    us.series_count,
    us.anime_count,
    us.books_count,
    us.games_count,
    us.music_count,
    us.last_activity,
    au.email,
    au.created_at as account_created_at
FROM user_profiles up
LEFT JOIN user_stats us ON up.user_id = us.user_id
LEFT JOIN auth.users au ON up.user_id = au.id;

-- ============================================
-- 13. FUNCIONES HELPER PARA CONSULTAS
-- ============================================

-- Función para obtener favoritos por categoría
CREATE OR REPLACE FUNCTION get_favorites_by_category(
    p_user_id UUID,
    p_content_type VARCHAR(50)
)
RETURNS TABLE (
    id UUID,
    content_id VARCHAR(255),
    title VARCHAR(500),
    image_url TEXT,
    description TEXT,
    genre VARCHAR(100),
    rating DECIMAL(3,1),
    year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        uf.id,
        uf.content_id,
        uf.title,
        uf.image_url,
        uf.description,
        uf.genre,
        uf.rating,
        uf.year,
        uf.created_at
    FROM user_favorites uf
    WHERE uf.user_id = p_user_id
    AND uf.content_type = p_content_type
    ORDER BY uf.created_at DESC;
END;
$$ language 'plpgsql';

-- Función para verificar si un contenido es favorito
CREATE OR REPLACE FUNCTION is_favorite(
    p_user_id UUID,
    p_content_id VARCHAR(255),
    p_content_type VARCHAR(50)
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_favorites
        WHERE user_id = p_user_id
        AND content_id = p_content_id
        AND content_type = p_content_type
    );
END;
$$ language 'plpgsql';

-- ============================================
-- 14. DATOS DE EJEMPLO (OPCIONAL - SOLO PARA DESARROLLO)
-- ============================================

-- Insertar preferencias de ejemplo (comentado por defecto)
/*
INSERT INTO user_preferences (user_id, favorite_genres, categories)
VALUES (
    auth.uid(),
    ARRAY['Acción', 'Ciencia Ficción', 'Aventura'],
    ARRAY['movies', 'games', 'books']
);
*/

-- ============================================
-- 15. CONSULTAS ÚTILES PARA LA APP
-- ============================================

-- Obtener todos los favoritos de un usuario
-- SELECT * FROM user_favorites WHERE user_id = auth.uid() ORDER BY created_at DESC;

-- Obtener favoritos por categoría
-- SELECT * FROM user_favorites WHERE user_id = auth.uid() AND content_type = 'movies';

-- Obtener estadísticas del usuario
-- SELECT * FROM user_stats WHERE user_id = auth.uid();

-- Obtener perfil completo
-- SELECT * FROM user_complete_profile WHERE user_id = auth.uid();

-- Contar favoritos por categoría
-- SELECT content_type, COUNT(*) as count FROM user_favorites WHERE user_id = auth.uid() GROUP BY content_type;

-- Obtener últimos favoritos añadidos
-- SELECT * FROM user_favorites WHERE user_id = auth.uid() ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- 16. LIMPIEZA (SOLO SI NECESITAS RESETEAR)
-- ============================================

-- ADVERTENCIA: Esto eliminará TODAS las tablas y datos
/*
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_stats_on_favorite ON user_favorites;
DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;

DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS update_user_stats();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_favorites_by_category(UUID, VARCHAR);
DROP FUNCTION IF EXISTS is_favorite(UUID, VARCHAR, VARCHAR);

DROP VIEW IF EXISTS user_complete_profile;

DROP TABLE IF EXISTS user_stats CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
*/

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Verificar que todo se creó correctamente:
SELECT 
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_preferences', 'user_favorites', 'user_profiles', 'user_stats');
