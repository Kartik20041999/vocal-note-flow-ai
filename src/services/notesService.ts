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
  static async saveNote(text: string, summary?: string): Promise<{ data: Note | null; error: any }> {
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

      if (!user) {
        throw new Error("User not authenticated");
      }

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
