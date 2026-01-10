# 🎯 Guía Rápida de Inicio

## Paso 1: Instalar Dependencias

```bash
npm install
```

## Paso 2: Configurar Supabase

1. Ve a https://supabase.com/ y crea una cuenta
2. Crea un nuevo proyecto
3. En el SQL Editor, ejecuta:

```sql
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  favorite_genres TEXT[] NOT NULL DEFAULT '{}',
  categories TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences FOR DELETE
  USING (auth.uid() = user_id);
```

## Paso 3: Obtener API Keys

### TMDB (Películas y Series)
1. https://www.themoviedb.org/
2. Crea cuenta → Settings → API → Request API Key

### RAWG (Videojuegos)
1. https://rawg.io/apidocs
2. Regístrate y obtén tu key

### Google Books API
1. https://console.cloud.google.com/
2. Crea proyecto → Habilita Books API → Credenciales

### Last.fm (Música)
1. https://www.last.fm/api/account/create
2. Llena formulario → Obtén API key

## Paso 4: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_TMDB_API_KEY=tu_tmdb_key
VITE_RAWG_API_KEY=tu_rawg_key
VITE_GOOGLE_BOOKS_API_KEY=tu_books_key
VITE_LASTFM_API_KEY=tu_lastfm_key
```

## Paso 5: Iniciar la Aplicación

```bash
npm run dev
```

Abre http://localhost:5173 en tu navegador.

## 🎉 ¡Listo!

Ahora puedes:
1. Registrarte o iniciar sesión
2. Seleccionar tus categorías favoritas
3. Elegir tus géneros preferidos
4. Ver recomendaciones personalizadas
5. Buscar contenido específico

## 📝 Notas Importantes

- **Jikan API (Anime)** no requiere API key
- Todas las APIs gratuitas tienen rate limits
- Asegúrate de habilitar Email Auth en Supabase
- No subas el archivo `.env` a Git

## ❓ Problemas Comunes

**"Cannot find module '@supabase/supabase-js'"**
→ Ejecuta `npm install`

**"Invalid API key"**
→ Verifica que copiaste correctamente las keys en `.env`

**"CORS error"**
→ Normal en desarrollo, funciona en producción

**"Rate limit exceeded"**
→ Espera unos segundos, las APIs gratuitas tienen límites
