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

  // Save a new note linked to the logged-in user
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
        .select('*')  // Make sure Supabase knows what to return
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error saving note:', error);
      return { data: null, error };
    }
  }

  // Fetch all notes for the logged-in user
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

  // Delete a note by its ID (optional: You can add user check in RLS)
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

  // Update an existing note
  static async updateNote(id: string, text: string, summary?: string): Promise<{ data: Note | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({ text, summary })
        .eq('id', id)
        .select('*')
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating note:', error);
      return { data: null, error };
    }
  }
}
