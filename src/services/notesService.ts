import { supabase } from '@/lib/supabaseClient'; // adjust path if needed

export class NotesService {
  static async saveNote(text: string, summary?: string, audioUrl?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('notes')
      .insert({ text, summary, audio_url: audioUrl, user_id: user.id })
      .select()
      .single();
    return { data, error };
  }

  static async getAllNotes() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return { data, error };
  }
}
