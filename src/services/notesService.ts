import { supabase } from "@/integrations/supabase/client";

export const NotesService = {
  async createNote({ text, summary, audio_url, user_id }) {
    const { data, error } = await supabase
      .from("notes")
      .insert([{ text, summary, audio_url, user_id }])
      .select();

    return { data, error };
  },

  async fetchNotes(user_id) {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });

    return { data, error };
  },
};
