// src/app/store/login/action.ts
import { createClient } from '@/utils/supabase/client';
import { AuthError } from '@supabase/supabase-js';

type AuthResponse = { error?: { message: string } | null };

export async function login(formData: FormData): Promise<AuthResponse> {
  const supabase = createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  return { error };
}

export async function signup(formData: FormData): Promise<AuthResponse> {
  const supabase = createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  return { error };
}
