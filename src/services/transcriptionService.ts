export const TranscriptionService = {
  async transcribeAudio(audioBlob: Blob, settings: any) {
    if (!settings.transcriptionProvider) {
      return { text: "", error: "No transcription provider selected" };
    }

    if (!settings.apiKey && settings.transcriptionProvider !== "huggingface") {
      return { text: "", error: "API key required for selected provider" };
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob);

      let url = "";
      let headers: Record<string, string> = {};

      if (settings.transcriptionProvider === "huggingface") {
        url = "https://api-inference.huggingface.co/models/openai/whisper-large";
        if (settings.apiKey) {
          headers["Authorization"] = `Bearer ${settings.apiKey}`;
        }
      } else if (settings.transcriptionProvider === "openai") {
        url = "https://api.openai.com/v1/audio/transcriptions";
        headers["Authorization"] = `Bearer ${settings.apiKey}`;
        formData.append("model", "whisper-1");
      } else if (settings.transcriptionProvider === "assemblyai") {
        url = "https://api.assemblyai.com/v2/transcript";
        headers["Authorization"] = settings.apiKey;
      } else {
        return { text: "", error: "Invalid provider" };
      }

      if (settings.transcriptionProvider === "assemblyai") {
        // AssemblyAI needs pre-upload to their storage, skipping for simplicity
        return { text: "", error: "AssemblyAI flow requires additional upload logic (not implemented)" };
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { text: "", error: `Transcription failed: ${errorText}` };
      }

      const result = await response.json();
      const transcribedText =
        settings.transcriptionProvider === "huggingface"
          ? result.text
          : result.text || result.data?.text;

      return { text: transcribedText || "", error: null };
    } catch (err) {
      return { text: "", error: "Transcription request failed" };
    }
  },
};
