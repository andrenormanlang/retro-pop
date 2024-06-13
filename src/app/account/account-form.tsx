// src/components/AccountForm.tsx
'use client';
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import Avatar from "./avatar";
import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Spinner, Alert, AlertIcon, Center, useColorModeValue } from "@chakra-ui/react";
import { RootState } from '@/store/store';
import { setAvatarUrl } from '@/store/avatarSlice';

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const avatarUrl = useSelector((state: RootState) => state.avatar.url);
  const dispatch = useDispatch();
  const [is_admin, setIsAdmin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error, status } = await supabase
        .from("profiles")
        .select(`full_name, username, website, avatar_url, is_admin`)
        .eq("id", user?.id)
        .single();

      if (error && status !== 406) {
        console.log(error);
        throw error;
      }

      if (data) {
        setFullname(data.full_name);
        setUsername(data.username);
        setWebsite(data.website);
        dispatch(setAvatarUrl(data.avatar_url));
        setIsAdmin(data.is_admin);
      }
    } catch (error) {
      setError("Error loading user data!");
    } finally {
      setLoading(false);
    }
  }, [user, supabase, dispatch]);

  useEffect(() => {
    if (user) {
      getProfile();
    }
  }, [user, getProfile]);

  async function updateProfile({
    fullname,
    username,
    website,
    avatarUrl,
  }: {
    fullname: string | null;
    username: string | null;
    website: string | null;
    avatarUrl: string | null;
  }) {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.from("profiles").upsert({
        id: user?.id as string,
        full_name: fullname,
        username,
        website,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      alert("Profile updated!");
    } catch (error) {
      setError("Error updating the data!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Center minH="100vh" bg={useColorModeValue("gray.50", "gray.800")}>
      <Box
        p={8}
        maxWidth={{ base: "90%", md: "400px" }}
        width="full"
        bg={useColorModeValue("white", "gray.700")}
        boxShadow="md"
        borderRadius="md"
      >
        <Heading as="h1" size="lg" mb={6} textAlign="center">
          Account
        </Heading>
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
        {loading ? (
          <Center height="100%">
            <Spinner />
          </Center>
        ) : (
          <VStack spacing={4}>
            <FormControl id="email">
              <FormLabel>Email</FormLabel>
              <Input type="text" value={user?.email || ''} isDisabled />
            </FormControl>
            {user && (
              <Avatar
                uid={user.id}
                url={avatarUrl}
                size={150}
                onUpload={(url) => {
                  dispatch(setAvatarUrl(url));
                  updateProfile({ fullname, username, website, avatarUrl: url });
                }}
              />
            )}
            <FormControl id="fullName">
              <FormLabel>Full Name</FormLabel>
              <Input
                type="text"
                value={fullname || ''}
                onChange={(e) => setFullname(e.target.value)}
              />
            </FormControl>
            <FormControl id="username">
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
            <FormControl id="website">
              <FormLabel>Website</FormLabel>
              <Input
                type="url"
                value={website || ''}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </FormControl>
            <FormControl id="isAdmin">
              <FormLabel>Admin Status</FormLabel>
              <Input
                type="text"
                value={is_admin ? 'Admin' : 'User'}
                isDisabled
              />
            </FormControl>
            <Button
              colorScheme="teal"
              width="full"
              onClick={() => updateProfile({ fullname, username, website, avatarUrl })}
              isDisabled={loading}
            >
              {loading ? 'Loading ...' : 'Update'}
            </Button>
            <form action="/auth/signout" method="post">
              <Button colorScheme="red" width="full" type="submit">
                Sign out
              </Button>
            </form>
          </VStack>
        )}
      </Box>
    </Center>
  );
}



// WITH CONTEXT!
// 'use client';
// // components/AccountForm.tsx
// import { useCallback, useEffect, useState } from "react";
// import { createClient } from "@/utils/supabase/client";
// import { type User } from "@supabase/supabase-js";
// import Avatar from "./avatar";
// import { Box, Button, FormControl, FormLabel, Input, VStack, Heading, Spinner, Alert, AlertIcon, Center, useColorModeValue } from "@chakra-ui/react";
// import { useAvatar } from "@/contexts/AvatarContext";

// export default function AccountForm({ user }: { user: User | null }) {
//   const supabase = createClient();
//   const [loading, setLoading] = useState(true);
//   const [fullname, setFullname] = useState<string | null>(null);
//   const [username, setUsername] = useState<string | null>(null);
//   const [website, setWebsite] = useState<string | null>(null);
//   const { avatarUrl, setAvatarUrl } = useAvatar();
//   const [is_admin, setIsAdmin] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);

//   const getProfile = useCallback(async () => {
//     try {
//       setLoading(true);

//       const { data, error, status } = await supabase
//         .from("profiles")
//         .select(`full_name, username, website, avatar_url, is_admin`)
//         .eq("id", user?.id)
//         .single();

//       if (error && status !== 406) {
//         console.log(error);
//         throw error;
//       }

//       if (data) {
//         setFullname(data.full_name);
//         setUsername(data.username);
//         setWebsite(data.website);
//         setAvatarUrl(data.avatar_url);
//         setIsAdmin(data.is_admin);
//       }
//     } catch (error) {
//       setError("Error loading user data!");
//     } finally {
//       setLoading(false);
//     }
//   }, [user, setAvatarUrl, supabase]);

//   useEffect(() => {
//     getProfile();
//   }, [user, getProfile]);

//   async function updateProfile({
//     fullname,
//     username,
//     website,
//     avatarUrl,
//   }: {
//     fullname: string | null;
//     username: string | null;
//     website: string | null;
//     avatarUrl: string | null;
//   }) {
//     try {
//       setLoading(true);
//       setError(null);

//       const { error } = await supabase.from("profiles").upsert({
//         id: user?.id as string,
//         full_name: fullname,
//         username,
//         website,
//         avatar_url: avatarUrl,
//         updated_at: new Date().toISOString(),
//       });
//       if (error) throw error;
//       alert("Profile updated!");
//     } catch (error) {
//       setError("Error updating the data!");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <Center minH="100vh" bg={useColorModeValue("gray.50", "gray.800")}>
//       <Box
//         p={8}
//         maxWidth="400px"
//         width="full"
//         bg={useColorModeValue("white", "gray.700")}
//         boxShadow="md"
//         borderRadius="md"
//       >
//         <Heading as="h1" size="lg" mb={6} textAlign="center">
//           Account
//         </Heading>
//         {error && (
//           <Alert status="error" mb={4}>
//             <AlertIcon />
//             {error}
//           </Alert>
//         )}
//         {loading ? (
//           <Spinner />
//         ) : (
//           <VStack spacing={4}>
//             <FormControl id="email">
//               <FormLabel>Email</FormLabel>
//               <Input type="text" value={user?.email} isDisabled />
//             </FormControl>
//             <Avatar
//               uid={user?.id ?? null}
//               url={avatarUrl}
//               size={150}
//               onUpload={(url) => {
//                 setAvatarUrl(url);
//                 updateProfile({ fullname, username, website, avatarUrl: url });
//               }}
//             />
//             <FormControl id="fullName">
//               <FormLabel>Full Name</FormLabel>
//               <Input
//                 type="text"
//                 value={fullname || ''}
//                 onChange={(e) => setFullname(e.target.value)}
//               />
//             </FormControl>
//             <FormControl id="username">
//               <FormLabel>Username</FormLabel>
//               <Input
//                 type="text"
//                 value={username || ''}
//                 onChange={(e) => setUsername(e.target.value)}
//               />
//             </FormControl>
//             <FormControl id="website">
//               <FormLabel>Website</FormLabel>
//               <Input
//                 type="url"
//                 value={website || ''}
//                 onChange={(e) => setWebsite(e.target.value)}
//               />
//             </FormControl>
//             <FormControl id="isAdmin">
//               <FormLabel>Admin Status</FormLabel>
//               <Input
//                 type="text"
//                 value={is_admin ? 'Admin' : 'User'}
//                 isDisabled
//               />
//             </FormControl>
//             <Button
//               colorScheme="teal"
//               width="full"
//               onClick={() => updateProfile({ fullname, username, website, avatarUrl })}
//               isDisabled={loading}
//             >
//               {loading ? 'Loading ...' : 'Update'}
//             </Button>
//             <form action="/auth/signout" method="post">
//               <Button colorScheme="red" width="full" type="submit">
//                 Sign out
//               </Button>
//             </form>
//           </VStack>
//         )}
//       </Box>
//     </Center>
//   );
// }

