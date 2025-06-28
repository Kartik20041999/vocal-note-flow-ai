import { supabase } from '@/integrations/supabase/client';

export interface Note {
  id: string;
  text: string;
  summary?: string;
  created_at: string;
  audio_url?: string;
  user_id?: string;
}

export class NotesService {
  static async uploadAudio(audioBlob: Blob, userId: string): Promise<string | null> {
    const fileName = `${userId}-${Date.now()}.webm`;

    const { data, error } = await supabase
      .storage
      .from('audio-recordings')
      .upload(fileName, audioBlob, {
        contentType: 'audio/webm',
      });

    if (error) {
      console.error('Audio upload failed:', error);
      return null;
    }

    const { data: urlData } = supabase
      .storage
      .from('audio-recordings')
      .getPublicUrl(fileName);

    return urlData.publicUrl || null;
  }

  static async saveNote(text: string, summary?: string, audioUrl?: string): Promise<{ data: Note | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([
          {
            text,
            summary,
            audio_url: audioUrl,
            user_id: user.id,
          }
        ])
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error saving note:', error);
      return { data: null, error };
    }
  }
}

