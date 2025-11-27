import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useSupabase } from './SupabaseContext';


interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase, isMock } = useSupabase();

  useEffect(() => {
    // Start with loading true, especially if supabase client is being initialized
    setLoading(true);

    if (isMock) {
      setLoading(false);
      return;
    }

    if (!supabase) {
      // Still waiting for supabase client from context
      return;
    }
    
    // Check for active session on initial load
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const rawRole = session.user.user_metadata?.role as string;
          const userRole = rawRole ? rawRole.toUpperCase() as UserRole : undefined;
          
          if (userRole && Object.values(UserRole).includes(userRole)) {
              setUser({
                  id: session.user.id,
                  name: session.user.user_metadata?.name || session.user.email,
                  email: session.user.email!,
                  role: userRole,
              });
          }
        }
        setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        if (session?.user) {
            const rawRole = session.user.user_metadata?.role as string;
            const userRole = rawRole ? rawRole.toUpperCase() as UserRole : undefined;

            if (userRole && Object.values(UserRole).includes(userRole)) {
                setUser({
                    id: session.user.id,
                    name: session.user.user_metadata?.name || session.user.email,
                    email: session.user.email!,
                    role: userRole,
                });
            } else {
              // User logged in but has no role. This is an invalid state for this app.
              setUser(null);
            }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, isMock]);
  
  const login = async (email, password) => {
    setLoading(true);

    if (isMock || !supabase) {
        // Mock login for demo purposes when Supabase is not configured
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email.toLowerCase() === 'driver@bustracker.pro' && password === 'password') {
                    setUser({ id: 'mock-driver-01', name: 'Demo Driver', email: 'driver@bustracker.pro', role: UserRole.DRIVER });
                    resolve(true);
                } else if (email.toLowerCase() === 'admin@bustracker.pro' && password === 'password') {
                    setUser({ id: 'mock-admin-01', name: 'Demo Admin', email: 'admin@bustracker.pro', role: UserRole.ADMIN });
                    resolve(true);
                } else {
                    reject(new Error('Invalid email or password. Use driver@bustracker.pro or admin@bustracker.pro with password "password".'));
                }
                setLoading(false);
            }, 1000); // Simulate network delay
        });
    }
    
    // Real Supabase login
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) throw error;
  };

  const logout = async () => {
    setLoading(true);

    if (isMock || !supabase) {
      // Mock logout
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setUser(null);
          setLoading(false);
          resolve();
        }, 500);
      });
    }

    // Real Supabase logout
    await supabase.auth.signOut();
    setUser(null); // onAuthStateChange will also handle this, but this provides instant feedback
    setLoading(false);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};