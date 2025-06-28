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
  
  static async uploadAudio(audioBlob: Blob): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const fileName = `${user.id}-${Date.now()}.webm`;

      const { data, error } = await supabase
        .storage
        .from('audio-recordings')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          upsert: true
        });

      if (error) {
        console.error('Audio upload error:', error);
        return null;
      }

      const { data: publicUrlData } = supabase
        .storage
        .from('audio-recordings')
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;

    } catch (error) {
      console.error('Audio upload failed:', error);
      return null;
    }
  }

  static async saveNote(text: string, summary?: string, audioUrl?: string): Promise<{ data: Note | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

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

  static async getAllNotes(): Promise<{ data: Note[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching notes:', error);
      return { data: null, error };
    }
  }

  static async deleteNote(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error('Error deleting note:', error);
      return { error };
    }
  }

  static async updateNote(id: string, text: string, summary?: string): Promise<{ data: Note | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ text, summary })
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating note:', error);
      return { data: null, error };
    }
  }
}
