import { supabase } from "@/integrations/supabase/client";

export const NotesService = {
  async createNote(noteData: { text: string, summary: string, audio_url: string, user_id: string }) {
    const { data, error } = await supabase.from("notes").insert([noteData]).select();
    return { data, error };
  },

  async getAllNotes() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [], error: "Not authenticated" };
    const { data, error } = await supabase.from("notes").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    return { data, error };
  }
};
