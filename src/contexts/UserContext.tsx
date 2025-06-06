'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@/types/forum/forum.type';
import { useRouter } from 'next/navigation';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const {
          data: { user: sessionUser },
        } = await supabase.auth.getUser();

        if (sessionUser) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, avatar_url, is_admin')
            .eq('id', sessionUser.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
          } else {
            setUser({
              id: sessionUser.id,
              email: sessionUser.email ?? null,
              avatar_url: profile.avatar_url,
              username: profile.username,
              is_admin: profile.is_admin,
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth check:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          fetchUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    fetchUser();

    // Cleanup subscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};
