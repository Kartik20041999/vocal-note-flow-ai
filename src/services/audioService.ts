import { supabase } from '@/integrations/supabase/client';

export const uploadAudioToStorage = async (audioBlob: Blob, fileName: string): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase.storage
      .from('audio-recordings')
      .upload(`${user.id}-${Date.now()}.webm`, audioBlob);

    if (error) {
      console.error('Audio upload error:', error);
      return null;
    }

    const { publicUrl } = supabase.storage
      .from('audio-recordings')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (err) {
    console.error('Audio upload failed:', err);
    return null;
  }
};
