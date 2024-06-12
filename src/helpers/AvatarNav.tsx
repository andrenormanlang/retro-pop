// components/AvatarNav.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Image, Box, Spinner } from "@chakra-ui/react";
import { useAvatar } from '@/contexts/AvatarContext';

export default function AvatarNav({
  uid,
  size,
}: {
  uid: string | null
  size: number
}) {
  const supabase = createClient()
  const { avatarUrl, setAvatarUrl } = useAvatar();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function downloadImage(path: string) {
      try {
        setLoading(true)
        const { data, error } = await supabase.storage.from('avatars').download(path)
        if (error) {
          throw error
        }

        const url = URL.createObjectURL(data)
        setAvatarUrl(url)
      } catch (error) {
        console.log('Error downloading image: ', error)
      } finally {
        setLoading(false)
      }
    }

    if (avatarUrl) downloadImage(avatarUrl)
  }, [avatarUrl, supabase, setAvatarUrl])

  return (
    <Box textAlign="center">
      {avatarUrl ? (
        <Image
          width={size}
          height={size}
          src={avatarUrl}
          alt="Avatar"
          style={{ height: size, width: size, borderRadius: '30%' }}
        />
      ) : (
        <Box
          height={size}
          width={size}
          borderRadius="30%"
          bg="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {loading ? <Spinner /> : 'No image'}
        </Box>
      )}
    </Box>
  )
}
