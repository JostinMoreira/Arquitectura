import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Book, Film, Gamepad2, Tv, Radio, Music, Check } from 'lucide-react';

interface PreferencesPageProps {
  onSave: (preferences: { favoriteGenres: string[], categories: string[] }) => void;
  userName: string;
}

const CATEGORIES = [
  { id: 'movies', name: 'Películas', icon: Film, color: 'from-purple-500 to-purple-600' },
  { id: 'series', name: 'Series', icon: Tv, color: 'from-blue-500 to-blue-600' },
  { id: 'anime', name: 'Anime', icon: Radio, color: 'from-pink-500 to-pink-600' },
  { id: 'books', name: 'Libros', icon: Book, color: 'from-green-500 to-green-600' },
  { id: 'games', name: 'Juegos', icon: Gamepad2, color: 'from-red-500 to-red-600' },
  { id: 'music', name: 'Música', icon: Music, color: 'from-yellow-500 to-yellow-600' },
];

const GENRES = [
  'Acción',
  'Aventura',
  'Ciencia Ficción',
  'Fantasía',
  'Terror',
  'Romance',
  'Drama',
  'Comedia',
  'Thriller',
  'Misterio',
  'Historia',
  'Documentales',
];

export default function PreferencesPage({ onSave, userName }: PreferencesPageProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [step, setStep] = useState<1 | 2>(1);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleContinue = () => {
    if (step === 1 && selectedCategories.length > 0) {
      setStep(2);
    }
  };

  const handleFinish = () => {
    if (selectedGenres.length > 0) {
      onSave({
        categories: selectedCategories,
        favoriteGenres: selectedGenres,
      });
    }
  };

  return (
    <div className="size-full flex flex-col bg-background">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-3xl space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl text-foreground">
              {step === 1 ? `¡Hola, ${userName}!` : '¿Qué te gusta?'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {step === 1
                ? 'Selecciona las categorías que más te interesan'
                : 'Elige tus géneros favoritos'}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-muted'}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-muted'}`} />
          </div>

          {/* Step 1: Categories */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`relative p-8 rounded-2xl border-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg scale-105'
                          : 'border-border hover:border-blue-300 bg-card hover-lift'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 size-6 rounded-full bg-blue-500 flex items-center justify-center animate-scale-in">
                          <Check className="size-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center gap-4">
                        <div className={`size-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                          <Icon className="size-8 text-white" />
                        </div>
                        <span className="text-xl font-semibold text-foreground">{category.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleContinue}
                  disabled={selectedCategories.length === 0}
                  size="lg"
                  className="px-12 h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Genres */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3 justify-center">
                {GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  
                  return (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                          : 'border-border bg-card text-foreground hover:border-blue-300 hover:scale-105'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <Button
                  onClick={() => setStep(1)}
                  variant="outline"
                  size="lg"
                  className="px-8 h-14 border-border text-foreground hover:bg-accent"
                >
                  Atrás
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={selectedGenres.length === 0}
                  size="lg"
                  className="px-12 h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Finalizar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}