import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import PreferencesPage from './components/PreferencesPage';
import RecommendationsPage from './components/RecommendationsPage';
import UserProfilePage from './components/UserProfilePage';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

type Page = 'login' | 'home' | 'preferences' | 'recommendations' | 'profile';

interface UserPreferences {
  favoriteGenres: string[];
  categories: string[];
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        loadUserPreferences(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setUserPreferences(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await loadUserPreferences(session.user.id);
        setCurrentPage('home');
      } else {
        setCurrentPage('login');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setUserPreferences({
          favoriteGenres: data.favorite_genres,
          categories: data.categories,
        });
        setCurrentPage('home');
      } else {
        setCurrentPage('preferences');
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setCurrentPage('preferences');
    }
  };

  const handleLogin = async (userId: string, email: string) => {
    setUser({ id: userId, email } as User);
    setIsAuthenticated(true);
    await loadUserPreferences(userId);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUser(null);
      setUserPreferences(null);
      setCurrentPage('login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handlePreferencesSave = async (preferences: UserPreferences) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          favorite_genres: preferences.favoriteGenres,
          categories: preferences.categories,
        })
        .select()
        .single();

      if (error) throw error;

      setUserPreferences(preferences);
      setCurrentPage('home');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error al guardar preferencias. Por favor intenta de nuevo.');
    }
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="size-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full">
      {currentPage === 'login' && (
        <LoginPage onLogin={handleLogin} />
      )}
      
      {currentPage === 'preferences' && user && (
        <PreferencesPage onSave={handlePreferencesSave} userName={user.email || 'Usuario'} />
      )}
      
      {currentPage === 'home' && isAuthenticated && userPreferences && user && (
        <HomePage 
          userName={user.email || 'Usuario'}
          onNavigateToRecommendations={() => navigateTo('recommendations')}
          onNavigateToPreferences={() => navigateTo('preferences')}
          onNavigateToProfile={() => navigateTo('profile')}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'recommendations' && isAuthenticated && userPreferences && user && (
        <RecommendationsPage
          userId={user.id}
          userPreferences={userPreferences}
          onNavigateToHome={() => navigateTo('home')}
          onLogout={handleLogout}
        />
      )}
      
      {currentPage === 'profile' && isAuthenticated && user && (
        <UserProfilePage
          userId={user.id}
          userEmail={user.email || ''}
          onNavigateToHome={() => navigateTo('home')}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
