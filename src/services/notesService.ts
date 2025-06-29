// src/services/notesService.ts
import { supabase } from "@/integrations/supabase/client";

export interface Note {
  id: string;
  text: string;
  summary: string | null;
  audio_url: string | null;
  user_id: string;
  created_at: string;
}

export const NotesService = {
  createNote(data: Pick<Note, "text" | "summary" | "audio_url" | "user_id">) {
    return supabase
      .from<Note>("notes")
      .insert([data])
      .select()
      .single();
  },

  fetchNotes(user_id: string) {
    return supabase
      .from<Note>("notes")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
  },

  getAllNotes() {
    return supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return { data: null, error: { message: "Not signed in" } };
      return this.fetchNotes(user.id);
    });
  },
};
