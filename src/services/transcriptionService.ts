export const TranscriptionService = {
  async transcribeAudio(audioBlob: Blob, settings: any) {
    if (!settings.transcriptionProvider) {
      return { text: "", error: "No transcription provider selected." };
    }

    try {
      const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });

      if (settings.transcriptionProvider === "huggingface") {
        const formData = new FormData();
        formData.append("file", audioFile);

        const response = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large-v3", {
          method: "POST",
          headers: settings.apiKey ? { Authorization: `Bearer ${settings.apiKey}` } : {},
          body: formData,
        });

        if (!response.ok) throw new Error("HuggingFace transcription failed");

        const result = await response.json();
        return { text: result.text || "", error: null };
      }

      if (settings.transcriptionProvider === "openai") {
        const formData = new FormData();
        formData.append("file", audioFile);
        formData.append("model", "whisper-1");

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: { Authorization: `Bearer ${settings.apiKey}` },
          body: formData,
        });

        if (!response.ok) throw new Error("OpenAI transcription failed");

        const result = await response.json();
        return { text: result.text || "", error: null };
      }

      if (settings.transcriptionProvider === "assemblyai") {
        const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
          method: "POST",
          headers: { authorization: settings.apiKey },
          body: audioBlob,
        });

        const { upload_url } = await uploadResponse.json();

        const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
          method: "POST",
          headers: {
            authorization: settings.apiKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({ audio_url: upload_url }),
        });

        const { id } = await transcriptResponse.json();

        // Poll for completion
        let completedText = "";
        for (let i = 0; i < 10; i++) {
          await new Promise(res => setTimeout(res, 3000));
          const polling = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
            headers: { authorization: settings.apiKey },
          });
          const result = await polling.json();
          if (result.status === "completed") {
            completedText = result.text;
            break;
          } else if (result.status === "failed") {
            throw new Error("AssemblyAI transcription failed");
          }
        }

        return { text: completedText, error: null };
      }

      return { text: "", error: "Unsupported transcription provider." };

    } catch (error: any) {
      return { text: "", error: error.message || "Transcription failed." };
    }
  },
};
