import { supabase } from "@/integrations/supabase/client";

export const NotesService = {
  async saveNote({ text, audioUrl, summary, userId }: any) {
    const { data, error } = await supabase.from("notes").insert([
      { text, audio_url: audioUrl, summary, user_id: userId }
    ]).select('*').single();
    return { data, error };
  },

  async getNotes(userId: string) {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  }
};
