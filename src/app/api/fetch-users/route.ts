import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  is_admin: boolean;
}

type AuthUserData = {
  users: User[];
}

export async function GET(request: NextRequest) {
  try {
    // First check if we can connect to the database
    const { error: healthError } = await supabaseAdmin.from("profiles").select("count").single();
    if (healthError) {
      console.error("Database connection error:", healthError);
      throw new Error("Failed to connect to the database");
    }

    // Fetch user profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, username, full_name, avatar_url, updated_at, is_admin")
      .returns<Profile[]>();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      throw new Error(`Failed to fetch profiles: ${profileError.message}`);
    }

    if (!profiles) {
      throw new Error("No profiles found");
    }

    // Fetch auth data
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error("Auth data fetch error:", authError);
      throw new Error(`Failed to fetch auth data: ${authError.message}`);
    }

    if (!authData?.users) {
      throw new Error("No auth users found");
    }

    // Merge profile and auth data
    const mergedData = profiles.map((profile) => {
      const authUser = (authData as AuthUserData).users.find((user) => user.id === profile.id);
      
      return {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        email: authUser?.email || null,
        avatar_url: profile.avatar_url,
        created: profile.updated_at || authUser?.created_at || null,
        last_sign_in: authUser?.last_sign_in_at || null,
        is_admin: profile.is_admin || false
      };
    });

    return new NextResponse(JSON.stringify(mergedData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("API error:", error);
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred" 
      }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
