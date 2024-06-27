import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase/client';
import { Comic } from '@/types/comics-store/comic-detail.type';

const fetchComics = async (): Promise<Comic[]> => {
  const { data, error } = await supabase
    .from('comics-sell')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return data as Comic[];
};

export const useComics = () => {
  return useQuery({
    queryKey: ['comics'],
	queryFn: fetchComics,
  });
};
