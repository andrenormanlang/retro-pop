import { useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/store/userSlice';

const useAuth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        const { user } = session;

        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, avatar_url, is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message);
          return;
        }

        dispatch(setUser({
          id: user.id,
          email: user.email,
          avatarUrl: data.avatar_url,
          isAdmin: data.is_admin,
        }));
      } else {
        dispatch(clearUser());
      }
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      fetchUser();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
};

export default useAuth;

