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

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Sign up the user and send confirmation email
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: '/welcome', //
    },
  });

  if (!error && data.user) {
    // Insert a profile with is_admin set to FALSE
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: data.user.id });

    if (profileError) {
      return { error: profileError };
    }
  }

  return { error };
}
