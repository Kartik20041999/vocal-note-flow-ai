// src/services/audioService.ts
import { supabase } from "@/integrations/supabase/client";
import { SettingsData } from "@/hooks/useSettings";

const BUCKET = "audio-recordings";

export const AudioService = {
  async uploadAudio(userId: string, blob: Blob) {
    const filename = `${userId}-${Date.now()}.webm`;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, blob);
    if (error) return { publicUrl: null, error };

    const { publicUrl, error: urlErr } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);
    return { publicUrl: publicUrl || null, error: urlErr };
  },

  async transcribe(url: string, settings: SettingsData) {
    try {
      // Replace this stub with actual API calls based on settings.provider
      const text = await fetch("/api/transcribe", {
        method: "POST",
        body: JSON.stringify({ url, provider: settings.provider, key: settings.openaiKey })
      }).then(r=>r.json()).then(r=>r.text);
      return { text, error: null };
    } catch (e) {
      return { text: "", error: (e as Error).message };
    }
  }
};
