import { supabase } from "@/integrations/supabase/client";

export const NotesService = {
  async saveNote(noteData: { text: string; summary?: string; audio_url?: string; user_id: string }) {
    const { data, error } = await supabase.from("notes").insert([noteData]).select("*");
    if (error) throw error;
    return data;
  },

  async getNotes(userId: string) {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
