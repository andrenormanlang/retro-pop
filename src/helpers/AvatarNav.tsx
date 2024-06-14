import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createClient } from '@/utils/supabase/client';
import { Image, Box, Spinner, useColorModeValue, Text } from "@chakra-ui/react";
import { RootState } from '@/store/store';
import { setAvatarUrl } from '@/store/avatarSlice';

export default function AvatarNav({
  uid,
  size,
}: {
  uid: string | null
  size: number
}) {
  const supabase = createClient();
  const avatarUrl = useSelector((state: RootState) => state.avatar.url);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const borderColor = useColorModeValue("gray.300", "gray.600");

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        setLoading(true);
        const { data, error } = await supabase.storage.from('avatars').download(path);
        if (error) {
          throw error;
        }

        const url = URL.createObjectURL(data);
        dispatch(setAvatarUrl(url));
      } catch (error) {
        console.log('Error downloading image: ', error);
      } finally {
        setLoading(false);
      }
    }

    if (avatarUrl) downloadImage(avatarUrl);
  }, [avatarUrl, supabase, dispatch]);

  return (
    <Box textAlign="center" borderRadius="full" borderWidth={1} borderColor={borderColor}>
      {avatarUrl ? (
        <Image
          width={size}
          height={size}
          src={avatarUrl}
          alt="X"
          style={{ height: size, width: size, borderRadius: '100%' }}
        />
      ) : (
        <Box
          height={size}
          width={size}
          borderRadius="50%"
          bg="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {loading ? <Spinner /> : <Text fontSize="11px" color="red.500">Add Image</Text>}
        </Box>
      )}
    </Box>
  );
}




// WITh CONTEXT!
// components/AvatarNav.tsx
// import { useEffect, useState } from 'react'
// import { createClient } from '@/utils/supabase/client'
// import { Image, Box, Spinner } from "@chakra-ui/react";
// import { useAvatar } from '@/contexts/AvatarContext';

// export default function AvatarNav({
//   uid,
//   size,
// }: {
//   uid: string | null
//   size: number
// }) {
//   const supabase = createClient()
//   const { avatarUrl, setAvatarUrl } = useAvatar();
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     async function downloadImage(path: string) {
//       try {
//         setLoading(true)
//         const { data, error } = await supabase.storage.from('avatars').download(path)
//         if (error) {
//           throw error
//         }

//         const url = URL.createObjectURL(data)
//         setAvatarUrl(url)
//       } catch (error) {
//         console.log('Error downloading image: ', error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     if (avatarUrl) downloadImage(avatarUrl)
//   }, [avatarUrl, supabase, setAvatarUrl])

//   return (
//     <Box textAlign="center">
//       {avatarUrl ? (
//         <Image
//           width={size}
//           height={size}
//           src={avatarUrl}
//           alt="Avatar"
//           style={{ height: size, width: size, borderRadius: '30%' }}
//         />
//       ) : (
//         <Box
//           height={size}
//           width={size}
//           borderRadius="30%"
//           bg="gray.200"
//           display="flex"
//           alignItems="center"
//           justifyContent="center"
//         >
//           {loading ? <Spinner /> : 'No image'}
//         </Box>
//       )}
//     </Box>
//   )
// }


