import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { 
  ArrowLeft, 
  LogOut, 
  Heart, 
  Film, 
  Tv, 
  Radio, 
  Book, 
  Gamepad2, 
  Music,
  Calendar,
  User,
  Edit2
} from 'lucide-react';
// import { ImageWithFallback } from './figma/ImageWithFallback'; // Comentado
import { supabase } from '../lib/supabase';
import type { Recommendation } from '../lib/recommendationStrategy';

interface UserProfilePageProps {
  userId: string;
  userEmail: string;
  onNavigateToHome: () => void;
  onLogout: () => void;
}

interface UserProfile {
  display_name: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
}

interface UserStats {
  total_favorites: number;
  movies_count: number;
  series_count: number;
  anime_count: number;
  books_count: number;
  games_count: number;
  music_count: number;
  last_activity: string;
}

interface Favorite extends Recommendation {
  favorite_id: string;
  created_at: string;
}

const CATEGORY_CONFIG = {
  movies: { name: 'Películas', icon: Film, color: 'text-purple-500' },
  series: { name: 'Series', icon: Tv, color: 'text-blue-500' },
  anime: { name: 'Anime', icon: Radio, color: 'text-pink-500' },
  books: { name: 'Libros', icon: Book, color: 'text-green-500' },
  games: { name: 'Juegos', icon: Gamepad2, color: 'text-red-500' },
  music: { name: 'Música', icon: Music, color: 'text-yellow-500' },
};

export default function UserProfilePage({
  userId,
  userEmail,
  onNavigateToHome,
  onLogout,
}: UserProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Cargar perfil
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Cargar estadísticas
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsData) {
        setStats(statsData);
      }

      // Cargar favoritos
      await loadFavorites();
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async (category?: string) => {
    try {
      let query = supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('content_type', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const formattedFavorites: Favorite[] = data.map((fav: any) => ({
          favorite_id: fav.id,
          id: fav.content_id,
          title: fav.title,
          category: fav.content_type as any,
          genre: fav.genre || 'N/A',
          description: fav.description || '',
          rating: fav.rating || 0,
          year: fav.year || new Date().getFullYear(),
          image: fav.image_url || '',
          additionalInfo: fav.additional_info || {},
          created_at: fav.created_at,
        }));
        
        setFavorites(formattedFavorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    loadFavorites(category === 'all' ? undefined : category);
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter((f: Favorite) => f.favorite_id !== favoriteId));
      
      // Recargar estadísticas
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col bg-background animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToHome}
            className="text-foreground hover:bg-accent transition-all duration-200"
          >
            <ArrowLeft className="size-4 mr-2" />
            Inicio
          </Button>

          <h2 className="text-xl font-bold text-foreground">Mi Perfil</h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-foreground hover:bg-accent transition-all duration-200"
          >
            <LogOut className="size-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Profile Header */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-border">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="size-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                {profile?.display_name?.[0]?.toUpperCase() || userEmail[0].toUpperCase()}
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">
                    {profile?.display_name || userEmail.split('@')[0]}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="size-4" />
                  </Button>
                </div>
                
                <p className="text-muted-foreground flex items-center gap-2">
                  <User className="size-4" />
                  {userEmail}
                </p>

                {profile?.bio && (
                  <p className="text-foreground pt-2">{profile.bio}</p>
                )}

                <div className="flex gap-4 pt-2 text-sm text-muted-foreground">
                  {profile?.location && (
                    <span>📍 {profile.location}</span>
                  )}
                  {stats?.last_activity && (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      Última actividad: {new Date(stats.last_activity).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 hover-lift cursor-pointer bg-card border-border">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Heart className="size-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-foreground">{stats?.total_favorites || 0}</p>
                </div>
              </div>
            </Card>

            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const count = stats?.[`${key}_count` as keyof UserStats] || 0;
              
              return (
                <Card 
                  key={key}
                  className="p-6 hover-lift cursor-pointer bg-card border-border"
                  onClick={() => handleCategoryFilter(key)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center`}>
                      <Icon className={`size-6 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{config.name}</p>
                      <p className="text-2xl font-bold text-foreground">{count as number}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Favorites Section */}
          <Card className="p-6 bg-card border-border">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Heart className="size-6 text-red-500 fill-red-500" />
                  Mis Favoritos
                </h2>
                
                <div className="flex gap-2">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleCategoryFilter('all')}
                    className={selectedCategory === 'all' ? 'bg-blue-500 text-white' : ''}
                  >
                    Todos
                  </Button>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryFilter(key)}
                      className={selectedCategory === key ? 'bg-blue-500 text-white' : ''}
                    >
                      {config.name}
                    </Button>
                  ))}
                </div>
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-20">
                  <Heart className="size-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No tienes favoritos aún
                  </h3>
                  <p className="text-muted-foreground">
                    Explora contenido y guarda tus favoritos con el botón de corazón
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favorites.map((fav: Favorite) => (
                    <Card
                      key={fav.favorite_id}
                      className="overflow-hidden bg-card border-border card-hover group relative"
                    >
                      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
                        <img
                          src={fav.image}
                          alt={fav.title}
                          className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://via.placeholder.com/300x450/1a1a1a/888?text=${encodeURIComponent(fav.title)}`;
                          }}
                        />
                        
                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveFavorite(fav.favorite_id)}
                          className="absolute top-3 right-3 size-10 bg-red-500/90 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                        >
                          <Heart className="size-5 text-white fill-white" />
                        </button>

                        {/* Year badge */}
                        <div className="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm rounded-lg px-2 py-1">
                          <span className="text-xs font-semibold text-white">
                            {fav.year}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold text-foreground line-clamp-1">
                          {fav.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {fav.genre}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Añadido {new Date(fav.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
