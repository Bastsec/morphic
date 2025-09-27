import { createClient } from '@/lib/supabase/client'
import { isSupabaseBrowserConfigured } from '@/lib/supabase/config'
import { useEffect, useState } from 'react'

export const useCurrentUserImage = () => {
  const [image, setImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserImage = async () => {
      if (!isSupabaseBrowserConfigured()) {
        setImage(null)
        return
      }
      const { data, error } = await createClient().auth.getSession()
      if (error) {
        console.error(error)
      }

      setImage(data.session?.user.user_metadata.avatar_url ?? null)
    }
    fetchUserImage()
  }, [])

  return image
}
