import { useEffect, useState } from "react";
import { supabase } from '@/utils/supabase/client'; // Adjust path based on your project structure
import { Comic } from "@/types/comics-store/comic-detail.type";

export const useComicBuy = () => {
  const [data, setData] = useState<Comic[] | null>(null);
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

  return { data, setData, loading, error };
};

