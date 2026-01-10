import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, LogOut, Star, Film, Tv, Radio, Book, Gamepad2, Music, Loader2, Search, Heart } from 'lucide-react';
import { Input } from './ui/input';
// import { ImageWithFallback } from "./figma/ImageWithFallback"; // Comentado - se usa img directamente
import { supabase } from '../lib/supabase';
import { 
  RecommendationContext, 
  RecommendationStrategyFactory, 
  type Recommendation 
} from '../lib/recommendationStrategy';

interface RecommendationsPageProps {
  userId: string;
  userPreferences: {
    favoriteGenres: string[];
    categories: string[];
  };
  onNavigateToHome: () => void;
  onLogout: () => void;
}

type Category = 'movies' | 'series' | 'anime' | 'books' | 'games' | 'music';

const CATEGORY_CONFIG = {
  movies: { 
    name: 'Películas', 
    icon: Film, 
    gradient: 'from-purple-500 to-purple-600',
    bgImage: 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&q=80'
  },
  series: { 
    name: 'Series', 
    icon: Tv, 
    gradient: 'from-blue-500 to-blue-600',
    bgImage: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80'
  },
  anime: { 
    name: 'Anime', 
    icon: Radio, 
    gradient: 'from-pink-500 to-pink-600',
    bgImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80'
  },
  books: { 
    name: 'Libros', 
    icon: Book, 
    gradient: 'from-green-500 to-green-600',
    bgImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'
  },
  games: { 
    name: 'Juegos', 
    icon: Gamepad2, 
    gradient: 'from-red-500 to-red-600',
    bgImage: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80'
  },
  music: { 
    name: 'Música', 
    icon: Music, 
    gradient: 'from-yellow-500 to-yellow-600',
    bgImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80'
  },
};

export default function RecommendationsPage({
  userId,
  userPreferences,
  onNavigateToHome,
  onLogout,
}: RecommendationsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const enabledCategories = Object.keys(CATEGORY_CONFIG).filter(cat =>
    userPreferences.categories.includes(cat)
  ) as Category[];

  // Auto-scroll del carrusel
  useEffect(() => {
    if (selectedCategory || enabledCategories.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % enabledCategories.length;
        
        // Scroll suave al siguiente elemento
        if (carouselRef.current) {
          const cardWidth = carouselRef.current.scrollWidth / enabledCategories.length;
          carouselRef.current.scrollTo({
            left: cardWidth * nextIndex,
            behavior: 'smooth'
          });
        }
        
        return nextIndex;
      });
    }, 4000); // Cambiar cada 4 segundos

    return () => clearInterval(interval);
  }, [selectedCategory, enabledCategories.length]);

  useEffect(() => {
    if (selectedCategory) {
      fetchRecommendations(selectedCategory);
      loadUserFavorites();
    }
  }, [selectedCategory, userPreferences.favoriteGenres]);

  const loadUserFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('content_id, content_type')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        const favSet = new Set(data.map(f => `${f.content_id}-${f.content_type}`));
        setFavorites(favSet);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const fetchRecommendations = async (category: Category) => {
    setLoading(true);
    setSearchQuery('');
    try {
      const strategy = RecommendationStrategyFactory.createStrategy(category);
      const context = new RecommendationContext(strategy);
      const results = await context.getRecommendations(userPreferences.favoriteGenres, 12);
      setRecommendations(results);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (rec: Recommendation) => {
    const favoriteKey = `${rec.id}-${rec.category}`;
    const isFavorite = favorites.has(favoriteKey);

    try {
      if (isFavorite) {
        // Eliminar de favoritos
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('content_id', rec.id)
          .eq('content_type', rec.category);

        if (error) throw error;

        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(favoriteKey);
          return newSet;
        });
      } else {
        // Añadir a favoritos
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

        if (error) throw error;

        setFavorites(prev => new Set(prev).add(favoriteKey));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error al actualizar favoritos');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedCategory) return;
    
    setSearching(true);
    try {
      const strategy = RecommendationStrategyFactory.createStrategy(selectedCategory);
      const context = new RecommendationContext(strategy);
      const results = await context.searchByKeyword(searchQuery, 12);
      setRecommendations(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {!selectedCategory ? (
        // Vista de carrusel - Pantalla Completa
        <div className="flex-1 overflow-hidden bg-[#0a0a0a] relative">
          {/* Carrusel Horizontal de Pantalla Completa */}
          <div 
            ref={carouselRef}
            className="flex h-full overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
            onScroll={(e) => {
              const scrollLeft = e.currentTarget.scrollLeft;
              const cardWidth = e.currentTarget.scrollWidth / enabledCategories.length;
              const newIndex = Math.round(scrollLeft / cardWidth);
              setCurrentIndex(newIndex);
            }}
          >
            {enabledCategories.map((category, index) => {
              const config = CATEGORY_CONFIG[category];
              const Icon = config.icon;
              
              return (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className="flex-none w-full h-full snap-start group relative transform transition-all duration-500 hover:scale-[1.02]"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Imagen de fondo con transparencia */}
                  <div className="absolute inset-0">
                    <img
                      src={config.bgImage}
                      alt={config.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay con gradiente para legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
                    {/* Overlay con color de la categoría */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-40 group-hover:opacity-50 transition-opacity duration-300`} />
                  </div>
                  
                  {/* Contenido centrado */}
                  <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                    <div className="size-32 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                      <Icon className="size-16 text-white drop-shadow-lg" />
                    </div>
                    
                    <h3 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                      {config.name}
                    </h3>
                    
                    <p className="text-white/90 text-2xl mb-8 drop-shadow-lg">
                      Explora {config.name.toLowerCase()}
                    </p>

                    {/* Indicador hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="px-8 py-3 bg-white/30 backdrop-blur-md rounded-full text-white font-semibold text-lg shadow-xl">
                        Click para explorar →
                      </div>
                    </div>
                  </div>

                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Indicadores de posición */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
            {enabledCategories.map((category, index) => (
              <button
                key={category}
                onClick={() => {
                  setCurrentIndex(index);
                  if (carouselRef.current) {
                    const cardWidth = carouselRef.current.scrollWidth / enabledCategories.length;
                    carouselRef.current.scrollTo({
                      left: cardWidth * index,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index 
                    ? 'w-12 bg-white' 
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Ir a ${CATEGORY_CONFIG[category].name}`}
              />
            ))}
          </div>

          {/* Géneros preferidos overlay */}
          {userPreferences.favoriteGenres.length > 0 && (
            <div className="absolute top-8 left-8 right-8 z-10">
              <div className="bg-black/50 backdrop-blur-md rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Tus géneros favoritos</h3>
                <div className="flex flex-wrap gap-3">
                  {userPreferences.favoriteGenres.map((genre) => (
                    <Badge 
                      key={genre} 
                      className="px-4 py-2 text-base bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors backdrop-blur-sm"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Vista expandida con recomendaciones
        <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right duration-500">
          <div className="border-b border-white/10 bg-black/30 p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="size-4 mr-2" />
                Volver
              </Button>
              
              {(() => {
                const config = CATEGORY_CONFIG[selectedCategory];
                const Icon = config.icon;
                return (
                  <div className="flex items-center gap-3">
                    <div className={`size-10 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                      <Icon className="size-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{config.name}</h2>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#0a0a0a] p-6 space-y-6">
              {/* Search Bar */}
              <div className="max-w-2xl">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={`Buscar ${CATEGORY_CONFIG[selectedCategory].name.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 h-12 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || searching}
                    className="h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {searching ? <Loader2 className="size-4 animate-spin" /> : 'Buscar'}
                  </Button>
                </div>
              </div>

              {/* Recommendations Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center space-y-4">
                    <Loader2 className="size-12 animate-spin text-blue-500 mx-auto" />
                    <p className="text-gray-400">Cargando recomendaciones...</p>
                  </div>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center space-y-2">
                    <p className="text-lg text-white">No se encontraron recomendaciones</p>
                    <p className="text-sm text-gray-400">
                      Intenta con otra búsqueda o verifica tu configuración de API
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recommendations.map((rec, index) => {
                    const favoriteKey = `${rec.id}-${rec.category}`;
                    const isFavorite = favorites.has(favoriteKey);
                    
                    return (
                      <Card
                        key={`${rec.id}-${index}`}
                        className="overflow-hidden bg-[#1a1a1a] border-white/10 card-hover cursor-pointer group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="relative aspect-[2/3] overflow-hidden bg-black">
                          <img
                            src={rec.image}
                            alt={rec.title}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/300x450/1a1a1a/888?text=${encodeURIComponent(rec.title)}`;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          {/* Favorite Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(rec);
                            }}
                            className={`absolute top-3 right-3 size-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                              isFavorite 
                                ? 'bg-red-500/90 hover:bg-red-600' 
                                : 'bg-black/70 hover:bg-black/90'
                            } backdrop-blur-sm`}
                          >
                            <Heart 
                              className={`size-5 ${
                                isFavorite ? 'text-white fill-white' : 'text-white'
                              }`} 
                            />
                          </button>
                          
                          {/* Rating Badge */}
                          <div className="absolute top-16 right-3 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                            <Star className="size-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold text-white">
                              {rec.rating.toFixed(1)}
                            </span>
                          </div>

                          {/* Year Badge */}
                          <div className="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm rounded-lg px-2 py-1">
                            <span className="text-xs font-semibold text-white">
                              {rec.year}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                              {rec.title}
                            </h3>
                            <Badge variant="secondary" className="text-xs bg-[#2a2a2a] text-gray-300">
                              {rec.genre}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-400 line-clamp-2">
                            {rec.description}
                          </p>

                          {rec.additionalInfo && (
                            <div className="pt-2 text-xs text-gray-500">
                              {rec.additionalInfo.author && (
                                <p>Autor: {rec.additionalInfo.author}</p>
                              )}
                              {rec.additionalInfo.director && (
                                <p>Director: {rec.additionalInfo.director}</p>
                              )}
                              {rec.additionalInfo.artist && (
                                <p>Artista: {rec.additionalInfo.artist}</p>
                              )}
                              {rec.additionalInfo.platform && (
                                <p>Plataforma: {rec.additionalInfo.platform}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
