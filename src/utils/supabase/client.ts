// src/utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
  );

export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
