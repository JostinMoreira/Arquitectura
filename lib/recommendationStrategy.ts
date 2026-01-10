// ============================================
// Patrón Strategy - Sistema de Recomendaciones
// ============================================

export interface Recommendation {
  id: string;
  title: string;
  category: 'movies' | 'series' | 'anime' | 'books' | 'games' | 'music';
  genre: string;
  description: string;
  rating: number;
  year: number;
  image: string;
  additionalInfo?: {
    director?: string;
    author?: string;
    artist?: string;
    platform?: string;
    duration?: string;
    episodes?: number;
  };
}

// Interfaz Strategy
export interface RecommendationStrategy {
  fetchRecommendations(genres: string[], limit?: number): Promise<Recommendation[]>;
  searchByKeyword(keyword: string, limit?: number): Promise<Recommendation[]>;
  getDetails(id: string): Promise<Recommendation | null>;
}

// ============================================
// Estrategia para Películas (Datos de ejemplo)
// ============================================
export class MovieRecommendationStrategy implements RecommendationStrategy {
  private moviesData = [
    { id: '1', title: 'Oppenheimer', genre: 'Drama', year: 2023, image: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', description: 'La historia del científico J. Robert Oppenheimer' },
    { id: '2', title: 'Barbie', genre: 'Comedia', year: 2023, image: 'https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg', description: 'Barbie vive en Barbieland' },
    { id: '3', title: 'Dune: Part Two', genre: 'Ciencia Ficción', year: 2024, image: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', description: 'Paul Atreides se une con Chani' },
    { id: '4', title: 'The Batman', genre: 'Acción', year: 2022, image: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg', description: 'Batman investiga la corrupción' },
    { id: '5', title: 'Spider-Man: No Way Home', genre: 'Acción', year: 2021, image: 'https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg', description: 'Peter Parker busca ayuda del Dr. Strange' },
  ];

  async fetchRecommendations(_genres: string[], limit: number = 10): Promise<Recommendation[]> {
    return this.moviesData.slice(0, limit).map(movie => ({
      ...movie,
      category: 'movies' as const,
      rating: 4.5,
      additionalInfo: { director: 'Director destacado' },
    }));
  }

  async searchByKeyword(keyword: string, limit: number = 10): Promise<Recommendation[]> {
    const filtered = this.moviesData.filter(movie => 
      movie.title.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, limit);
    
    return filtered.map(movie => ({
      ...movie,
      category: 'movies' as const,
      rating: 4.5,
      additionalInfo: { director: 'Director destacado' },
    }));
  }

  async getDetails(id: string): Promise<Recommendation | null> {
    const movie = this.moviesData.find(m => m.id === id);
    if (!movie) return null;
    
    return {
      ...movie,
      category: 'movies',
      rating: 4.5,
      additionalInfo: { director: 'Director destacado' },
    };
  }
}

// ============================================
// Estrategia para Series (Datos de ejemplo)
// ============================================
export class SeriesRecommendationStrategy implements RecommendationStrategy {
  private seriesData = [
    { id: '1', title: 'The Last of Us', genre: 'Drama', year: 2023, image: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg', description: 'Sobrevivientes en un mundo post-apocalíptico' },
    { id: '2', title: 'The Mandalorian', genre: 'Ciencia Ficción', year: 2019, image: 'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg', description: 'Un cazarrecompensas en Star Wars' },
    { id: '3', title: 'Stranger Things', genre: 'Ciencia Ficción', year: 2016, image: 'https://image.tmdb.org/t/p/w500/x2LSRK2Cm7MZhjluni1msVJ3wDF.jpg', description: 'Misterios en Hawkins, Indiana' },
    { id: '4', title: 'Wednesday', genre: 'Comedia', year: 2022, image: 'https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg', description: 'Wednesday Addams en Nevermore Academy' },
    { id: '5', title: 'Breaking Bad', genre: 'Drama', year: 2008, image: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg', description: 'Un profesor de química se vuelve narcotraficante' },
  ];

  async fetchRecommendations(_genres: string[], limit: number = 10): Promise<Recommendation[]> {
    return this.seriesData.slice(0, limit).map(series => ({
      ...series,
      category: 'series' as const,
      rating: 4.6,
      additionalInfo: { episodes: 8 },
    }));
  }

  async searchByKeyword(keyword: string, limit: number = 10): Promise<Recommendation[]> {
    const filtered = this.seriesData.filter(series => 
      series.title.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, limit);
    
    return filtered.map(series => ({
      ...series,
      category: 'series' as const,
      rating: 4.6,
      additionalInfo: { episodes: 8 },
    }));
  }

  async getDetails(id: string): Promise<Recommendation | null> {
    const series = this.seriesData.find(s => s.id === id);
    if (!series) return null;
    
    return {
      ...series,
      category: 'series',
      rating: 4.6,
      additionalInfo: { episodes: 8 },
    };
  }
}

// ============================================
// Estrategia para Anime (Jikan API - MyAnimeList)
// ============================================
export class AnimeRecommendationStrategy implements RecommendationStrategy {
  private baseUrl = 'https://api.jikan.moe/v4';

  async fetchRecommendations(_genres: string[], limit: number = 10): Promise<Recommendation[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(`${this.baseUrl}/top/anime?limit=${limit}`);
      const data = await response.json();
      
      return data.data.map((anime: any) => ({
        id: anime.mal_id.toString(),
        title: anime.title,
        category: 'anime' as const,
        genre: anime.genres?.[0]?.name || 'Anime',
        description: anime.synopsis || 'Sin descripción disponible',
        rating: anime.score / 2 || 4.0,
        year: anime.year || 2024,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
        additionalInfo: {
          episodes: anime.episodes,
        },
      }));
    } catch (error) {
      console.error('Error fetching anime:', error);
      return [];
    }
  }

  async searchByKeyword(keyword: string, limit: number = 10): Promise<Recommendation[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(`${this.baseUrl}/anime?q=${encodeURIComponent(keyword)}&limit=${limit}`);
      const data = await response.json();
      
      return data.data.map((anime: any) => ({
        id: anime.mal_id.toString(),
        title: anime.title,
        category: 'anime' as const,
        genre: anime.genres?.[0]?.name || 'Anime',
        description: anime.synopsis || 'Sin descripción',
        rating: anime.score / 2 || 4.0,
        year: anime.year || 2024,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
      }));
    } catch (error) {
      console.error('Error searching anime:', error);
      return [];
    }
  }

  async getDetails(id: string): Promise<Recommendation | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(`${this.baseUrl}/anime/${id}`);
      const data = await response.json();
      const anime = data.data;
      
      return {
        id: anime.mal_id.toString(),
        title: anime.title,
        category: 'anime',
        genre: anime.genres?.[0]?.name || 'Anime',
        description: anime.synopsis || 'Sin descripción',
        rating: anime.score / 2 || 4.0,
        year: anime.year || 2024,
        image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
        additionalInfo: {
          episodes: anime.episodes,
        },
      };
    } catch (error) {
      console.error('Error fetching anime details:', error);
      return null;
    }
  }
}

// ============================================
// Estrategia para Libros (Open Library API)
// ============================================
export class BookRecommendationStrategy implements RecommendationStrategy {
  private baseUrl = 'https://openlibrary.org';

  async fetchRecommendations(_genres: string[], limit: number = 10): Promise<Recommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/subjects/fiction.json?limit=${limit}`);
      const data = await response.json();
      
      return data.works.map((book: any) => ({
        id: book.key,
        title: book.title,
        category: 'books' as const,
        genre: 'Ficción',
        description: book.description || 'Sin descripción disponible',
        rating: 4.0,
        year: book.first_publish_year || 2024,
        image: book.cover_id
          ? `https://covers.openlibrary.org/b/id/${book.cover_id}-L.jpg`
          : `https://via.placeholder.com/300x450/4a5568/eee?text=${encodeURIComponent(book.title)}`,
        additionalInfo: {
          author: book.authors?.[0]?.name || 'Autor desconocido',
        },
      }));
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  }

  async searchByKeyword(keyword: string, limit: number = 10): Promise<Recommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search.json?q=${encodeURIComponent(keyword)}&limit=${limit}`);
      const data = await response.json();
      
      return data.docs.slice(0, limit).map((book: any) => ({
        id: book.key,
        title: book.title,
        category: 'books' as const,
        genre: 'Varios',
        description: 'Sin descripción',
        rating: 4.0,
        year: book.first_publish_year || 2024,
        image: book.cover_i
          ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
          : `https://via.placeholder.com/300x450/4a5568/eee?text=${encodeURIComponent(book.title)}`,
        additionalInfo: {
          author: book.author_name?.[0] || 'Autor desconocido',
        },
      }));
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  }

  async getDetails(id: string): Promise<Recommendation | null> {
    try {
      const response = await fetch(`${this.baseUrl}${id}.json`);
      const book = await response.json();
      
      return {
        id: book.key,
        title: book.title,
        category: 'books',
        genre: book.subjects?.[0] || 'Varios',
        description: book.description?.value || book.description || 'Sin descripción',
        rating: 4.0,
        year: book.first_publish_year || 2024,
        image: book.covers?.[0]
          ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
          : `https://via.placeholder.com/300x450/4a5568/eee?text=${encodeURIComponent(book.title)}`,
        additionalInfo: {
          author: book.authors?.[0]?.name || 'Autor desconocido',
        },
      };
    } catch (error) {
      console.error('Error fetching book details:', error);
      return null;
    }
  }
}

// ============================================
// Estrategia para Juegos (Datos de ejemplo por CORS)
// ============================================
export class GameRecommendationStrategy implements RecommendationStrategy {
  private gamesData = [
    { id: '1', title: 'Fortnite', genre: 'Battle Royale', year: 2017, image: 'https://cdn2.unrealengine.com/fortnite-og-share-1200x630-d9bd251f1900.jpg', description: 'Battle Royale gratuito con 100 jugadores' },
    { id: '2', title: 'League of Legends', genre: 'MOBA', year: 2009, image: 'https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt370fa5db9c727e51/5db05fa8347d1c6baa57be25/RiotX_ChampionList_lol.jpg', description: 'MOBA competitivo 5v5' },
    { id: '3', title: 'Valorant', genre: 'Shooter', year: 2020, image: 'https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/b0cf8a70ec27dc9d3e53c4f16c66b1e9c97ee57b-3840x2160.jpg', description: 'Shooter táctico 5v5' },
    { id: '4', title: 'Apex Legends', genre: 'Battle Royale', year: 2019, image: 'https://cdn1.epicgames.com/offer/1853c37eaf194ee0b3f04410cdf7d26e/EGS_ApexLegends_RespawnEntertainment_S1_2560x1440-6c54e024c2f7a1f67bb3bd2b4e44bf46', description: 'Battle Royale con héroes únicos' },
    { id: '5', title: 'Overwatch 2', genre: 'Shooter', year: 2022, image: 'https://images5.alphacoders.com/124/1246442.jpg', description: 'Shooter de héroes 5v5' },
    { id: '6', title: 'Rocket League', genre: 'Deportes', year: 2015, image: 'https://cdn2.unrealengine.com/rocketleague-share-1200x630-4e8b8639b21d.jpg', description: 'Fútbol con coches acrobáticos' },
    { id: '7', title: 'CS:GO', genre: 'Shooter', year: 2012, image: 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', description: 'Shooter táctico competitivo' },
    { id: '8', title: 'Warzone', genre: 'Battle Royale', year: 2020, image: 'https://www.callofduty.com/content/dam/atvi/callofduty/cod-touchui/blog/hero/mwii/MWII-REVEAL-TOUT.jpg', description: 'Battle Royale de Call of Duty' },
  ];

  async fetchRecommendations(_genres: string[], limit: number = 10): Promise<Recommendation[]> {
    return this.gamesData.slice(0, limit).map(game => ({
      ...game,
      category: 'games' as const,
      rating: 4.5,
      additionalInfo: { platform: 'PC / Consolas' },
    }));
  }

  async searchByKeyword(keyword: string, limit: number = 10): Promise<Recommendation[]> {
    const filtered = this.gamesData.filter(game => 
      game.title.toLowerCase().includes(keyword.toLowerCase())
    ).slice(0, limit);
    
    return filtered.map(game => ({
      ...game,
      category: 'games' as const,
      rating: 4.5,
      additionalInfo: { platform: 'PC / Consolas' },
    }));
  }

  async getDetails(id: string): Promise<Recommendation | null> {
    const game = this.gamesData.find(g => g.id === id);
    if (!game) return null;
    
    return {
      ...game,
      category: 'games',
      rating: 4.5,
      additionalInfo: { platform: 'PC / Consolas' },
    };
  }
}

// ============================================
// Estrategia para Música (iTunes Search API)
// ============================================
export class MusicRecommendationStrategy implements RecommendationStrategy {
  private baseUrl = 'https://itunes.apple.com/search';

  async fetchRecommendations(_genres: string[], limit: number = 10): Promise<Recommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}?term=pop&entity=album&limit=${limit}`);
      const data = await response.json();
      
      return data.results.map((album: any) => ({
        id: album.collectionId.toString(),
        title: album.collectionName,
        category: 'music' as const,
        genre: album.primaryGenreName || 'Música',
        description: `Álbum de ${album.artistName}`,
        rating: 4.0,
        year: new Date(album.releaseDate).getFullYear(),
        image: album.artworkUrl100.replace('100x100', '600x600'),
        additionalInfo: {
          artist: album.artistName,
        },
      }));
    } catch (error) {
      console.error('Error fetching music:', error);
      return [];
    }
  }

  async searchByKeyword(keyword: string, limit: number = 10): Promise<Recommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}?term=${encodeURIComponent(keyword)}&entity=album&limit=${limit}`);
      const data = await response.json();
      
      return data.results.map((album: any) => ({
        id: album.collectionId.toString(),
        title: album.collectionName,
        category: 'music' as const,
        genre: album.primaryGenreName || 'Música',
        description: `Álbum de ${album.artistName}`,
        rating: 4.0,
        year: new Date(album.releaseDate).getFullYear(),
        image: album.artworkUrl100.replace('100x100', '600x600'),
        additionalInfo: {
          artist: album.artistName,
        },
      }));
    } catch (error) {
      console.error('Error searching music:', error);
      return [];
    }
  }

  async getDetails(id: string): Promise<Recommendation | null> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${id}&entity=album`);
      const data = await response.json();
      
      if (data.results.length === 0) return null;
      
      const album = data.results[0];
      return {
        id: album.collectionId.toString(),
        title: album.collectionName,
        category: 'music',
        genre: album.primaryGenreName || 'Música',
        description: `Álbum de ${album.artistName}`,
        rating: 4.0,
        year: new Date(album.releaseDate).getFullYear(),
        image: album.artworkUrl100.replace('100x100', '600x600'),
        additionalInfo: {
          artist: album.artistName,
        },
      };
    } catch (error) {
      console.error('Error fetching music details:', error);
      return null;
    }
  }
}

// ============================================
// Contexto que usa el patrón Strategy
// ============================================
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

// ============================================
// Factory para crear estrategias
// ============================================
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
