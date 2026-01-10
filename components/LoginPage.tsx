import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Film, Book, Gamepad2, Sparkles, Music, Tv, Radio } from 'lucide-react';
// import { ImageWithFallback } from './figma/ImageWithFallback'; // Comentado
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onLogin: (userId: string, email: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Registrarse
        if (password.length < 6) {
          setError('La contraseña debe tener al menos 6 caracteres');
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: undefined,
            data: {
              display_name: name,
            },
          },
        });

        if (signUpError) {
          console.error('SignUp error:', signUpError);
          throw signUpError;
        }

        // Registro exitoso - cambiar a modo login
        setError('¡Registro exitoso! Ahora inicia sesión');
        setIsSignUp(false);
        setPassword('');
        setLoading(false);
        return;
      } else {
        // Iniciar sesión
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          onLogin(data.user.id, email);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ha ocurrido un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="size-full flex animate-in fade-in duration-700">
      {/* Left side - Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2 animate-in slide-in-from-top duration-500">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 animate-pulse">
              <Sparkles className="size-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Recomenda</h1>
            <p className="text-muted-foreground">
              Descubre películas, series, anime, libros, juegos y música personalizados
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom duration-500">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-foreground">
                  Nombre
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-input-background border-border text-foreground transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  required={isSignUp}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-input-background border-border text-foreground transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-input-background border-border text-foreground transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-in slide-in-from-top duration-300">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
              disabled={loading}
            >
              {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
                className="text-sm text-blue-500 hover:text-blue-600 transition-colors duration-200"
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </form>

          <div className="pt-8 border-t border-border animate-in fade-in duration-700 delay-300">
            <p className="text-sm text-center text-muted-foreground mb-4">
              Explora contenido de:
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Film, label: 'Películas', color: 'from-purple-500 to-purple-600' },
                { icon: Tv, label: 'Series', color: 'from-blue-500 to-blue-600' },
                { icon: Radio, label: 'Anime', color: 'from-pink-500 to-pink-600' },
                { icon: Book, label: 'Libros', color: 'from-green-500 to-green-600' },
                { icon: Gamepad2, label: 'Juegos', color: 'from-red-500 to-red-600' },
                { icon: Music, label: 'Música', color: 'from-yellow-500 to-yellow-600' },
              ].map((item, index) => (
                <div 
                  key={item.label}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`size-14 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                    <item.icon className="size-6 text-white" />
                  </div>
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Background image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 animate-gradient-xy" />
        <img
          src="https://images.unsplash.com/photo-1619164669943-536b56d813a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnRhaW5tZW50JTIwYm9va3MlMjBtb3ZpZXN8ZW58MXx8fHwxNzY4MDE1NzkzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Entertainment background"
          className="absolute inset-0 size-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
          <div className="max-w-lg space-y-6 animate-in slide-in-from-right duration-700">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Encuentra tu próxima aventura
            </h2>
            <p className="text-xl text-white/90">
              Recomendaciones personalizadas de películas, series, anime, libros, juegos y música basadas en tus gustos
            </p>
            <div className="flex gap-3 pt-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="size-3 rounded-full bg-white/50 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}