import { supabase } from "@/integrations/supabase/client";

export const AudioService = {
  async uploadAudio(user_id, file) {
    const path = `${user_id}-${Date.now()}.webm`;

    const { data, error } = await supabase
      .storage
      .from("audio-recordings")
      .upload(path, file);

    if (error) {
      console.error("Audio upload failed:", error);
      return { publicUrl: null, error };
    }

    const { publicUrl } = supabase
      .storage
      .from("audio-recordings")
      .getPublicUrl(path);

    return { publicUrl, error: null };
  },
};
