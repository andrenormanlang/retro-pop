'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";
import { useRouter } from 'next/router';
import { useToast, Spinner, Button } from "@chakra-ui/react";

export default function User() {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  useEffect(() => {
	const fetchSession = async () => {
	  try {
		const { data, error } = await supabase.auth.getSession();
		if (error) throw error;
		if (data.session && data.session.user) {
		  setUserEmail(data.session.user.email || null);
		} else {
		  router.push('/auth/login');
		}
	  } catch (error) {
		console.error('Failed to fetch session:', error);
		router.push('/auth/login');
	  }
	};

	fetchSession();
  }, [supabase, router]);

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully.",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
      router.push('/auth/login');
    } catch (error) {
      const errorMsg = (error as { message?: string }).message || "Unexpected error.";
      toast({
        title: "Failed to sign out.",
        description: errorMsg,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return userEmail ? (
    <div className="flex items-center gap-4">
      Hey, {userEmail}!
      <Button onClick={signOut} isLoading={loading} loadingText="Logging Out">
        Logout
      </Button>
    </div>
  ) : (
    <Spinner />
  );
}
