// services/notesService.ts
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
  static async saveNote(
    text: string,
    summary: string = '',
    audioUrl?: string
  ): Promise<{ data: Note | null; error: any }> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const insertPayload = {
        text,
        summary,
        audio_url: audioUrl ?? '',
        user_id: user.id,
      };

      console.log("Saving note with:", insertPayload);

      const { data, error } = await supabase
        .from('notes')
        .insert(insertPayload)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error saving note:', error);
      return { data: null, error };
    }
  }
}
