import { supabase } from './supabase'

export async function uploadWeddingImage({
  file,
  userId,
  pageKey,
  index,
}: {
  file: File
  userId: string
  pageKey: string
  index: number
}) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safePageKey = pageKey.replace(/[^a-z0-9-]/gi, '-').toLowerCase()
  const path = `${userId}/${safePageKey}/${Date.now()}-${index}.${extension}`

  const { error } = await supabase.storage.from('wedding-images').upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    throw error
  }

  const { data } = supabase.storage.from('wedding-images').getPublicUrl(path)
  return data.publicUrl
}
