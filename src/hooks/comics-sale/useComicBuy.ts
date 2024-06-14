import { useEffect, useState } from "react";
import { supabase } from '@/utils/supabase/client'; // Adjust path based on your project structure

export type ComicBuy = {
  id: string;
  user_id: string;
  created_at: string;
  title: string;
  image: string;
  release_date: string;
  pages: number;
  publisher: string;
  main_artist: string;
  main_writer: string;
  description: string;
  price: number;
  currency: string;
};

export const useComicBuy = () => {
  const [data, setData] = useState<ComicBuy[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.from("comics-sell").select('*');

        if (error) throw error;

        setData(data);
      } catch (error: any) {
        setError(error.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  console.log('data', data);

  return { data, loading, error };
};

