import { supabase } from '@/integrations/supabase/client';

export class AudioService {
  static async uploadAudio(userId: string, audioBlob: Blob): Promise<{ publicUrl: string | null; error: any }> {
    try {
      const fileName = `${userId}-${Date.now()}.webm`;

      const { data, error } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
        });

      if (error) {
        console.error('Audio upload error:', error);
        return { publicUrl: null, error };
      }

      const { data: publicUrlData } = supabase.storage
        .from('audio-recordings')
        .getPublicUrl(fileName);

      return { publicUrl: publicUrlData.publicUrl, error: null };
    } catch (error) {
      console.error('Unexpected audio upload error:', error);
      return { publicUrl: null, error };
    }
  }
}
