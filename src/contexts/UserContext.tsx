'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@/types/forum/forum.type';


interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
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
	const supabase = createClient();

	useEffect(() => {
	  const fetchUser = async () => {
		const { data: { user: sessionUser } } = await supabase.auth.getUser();
		if (sessionUser) {
		  const { data: profile, error } = await supabase
			.from('profiles')
			.select('username, avatar_url')
			.eq('id', sessionUser.id)
			.single();

		  if (error) {
			console.error('Error fetching user profile:', error);
		  } else {
			setUser({
			  id: sessionUser.id,
			  email: sessionUser.email ?? null,
			  avatar_url: profile.avatar_url,
			  username: profile.username,
			});
		  }
		}
	  };

	  fetchUser();
	}, [supabase]);

	return (
	  <UserContext.Provider value={{ user, setUser }}>
		{children}
	  </UserContext.Provider>
	);
  };
