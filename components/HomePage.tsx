import { Button } from './ui/button';
import { Card } from './ui/card';
import { Book, Film, Gamepad2, Sparkles, Settings, LogOut, User } from 'lucide-react';

interface HomePageProps {
  userName: string;
  onNavigateToRecommendations: () => void;
  onNavigateToPreferences: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export default function HomePage({
  userName,
  onNavigateToRecommendations,
  onNavigateToPreferences,
  onNavigateToProfile,
  onLogout,
}: HomePageProps) {
  return (
    <div className="size-full flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="size-5 text-white" />
            </div>
            <h2 className="text-2xl text-foreground">Recomenda</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToProfile}
              className="text-foreground hover:bg-accent"
            >
              <User className="size-4 mr-2" />
              Perfil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToPreferences}
              className="text-foreground hover:bg-accent"
            >
              <Settings className="size-4 mr-2" />
              Preferencias
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-foreground hover:bg-accent"
            >
              <LogOut className="size-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Welcome section */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl text-foreground">
              ¡Bienvenido, {userName}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              Estamos listos para ayudarte a descubrir contenido increíble
            </p>
          </div>

          {/* Main action card */}
          <Card className="p-12 bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white shadow-2xl">
            <div className="text-center space-y-6">
              <div className="inline-flex size-20 rounded-2xl bg-white/20 backdrop-blur items-center justify-center">
                <Sparkles className="size-10 text-white" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-3xl text-white">
                  Obtén recomendaciones personalizadas
                </h2>
                <p className="text-lg text-white/90 max-w-2xl mx-auto">
                  Descubre libros, películas y juegos seleccionados especialmente para ti basados en tus preferencias
                </p>
              </div>

              <Button
                size="lg"
                onClick={onNavigateToRecommendations}
                className="bg-white text-blue-600 hover:bg-white/90 h-14 px-8 text-lg shadow-xl"
              >
                Ver recomendaciones
              </Button>
            </div>
          </Card>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow bg-card border-border">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Book className="size-7 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Libros</p>
                  <p className="text-2xl text-foreground">120+</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow bg-card border-border">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Film className="size-7 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Películas</p>
                  <p className="text-2xl text-foreground">350+</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow bg-card border-border">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <Gamepad2 className="size-7 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Juegos</p>
                  <p className="text-2xl text-foreground">200+</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Info section */}
          <Card className="p-8 bg-card border-border">
            <div className="space-y-4">
              <h3 className="text-xl text-foreground">¿Cómo funciona?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="size-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-foreground">Selecciona una categoría</h4>
                  <p className="text-sm text-muted-foreground">
                    Elige entre libros, películas o juegos
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="size-10 rounded-full bg-purple-500 text-white flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-foreground">Obtén recomendaciones</h4>
                  <p className="text-sm text-muted-foreground">
                    Basadas en tus géneros favoritos
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="size-10 rounded-full bg-pink-500 text-white flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-foreground">Descubre y disfruta</h4>
                  <p className="text-sm text-muted-foreground">
                    Encuentra tu próxima aventura
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}