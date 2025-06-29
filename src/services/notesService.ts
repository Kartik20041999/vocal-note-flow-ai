import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  text: string;
  summary: string | null;
  audio_url: string | null;
  user_id: string;
  created_at: string;
}

export interface CreateNoteData {
  text: string;
  summary: string;
  audio_url: string;
  user_id: string;
}

export const NotesService = {
  async createNote(noteData: CreateNoteData) {
    const { data, error } = await supabase
      .from("notes")
      .insert([noteData])
      .select();

    return { data, error };
  },

  async fetchNotes(user_id: string) {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    return { data, error };
  },

  async getAllNotes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: { message: "You must be logged in to fetch notes." } };
    }
    return this.fetchNotes(user.id);
  },

  async deleteNote(id: string) {
    const { data, error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);

    return { data, error };
  },
};
