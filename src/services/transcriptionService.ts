export const TranscriptionService = {
  async transcribeAudio({
    audioBlob,
    provider,
    apiKey
  }: {
    audioBlob: Blob;
    provider: string;
    apiKey: string;
  }) {
    if (!provider) return { transcription: "", error: "No provider selected." };

    try {
      const audioArrayBuffer = await audioBlob.arrayBuffer();
      const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

      switch (provider) {
        case "openai":
          if (!apiKey) return { transcription: "", error: "OpenAI API key required." };
          return await this.transcribeWithOpenAI(audioBase64, apiKey);

        case "assemblyai":
          if (!apiKey) return { transcription: "", error: "AssemblyAI API key required." };
          return await this.transcribeWithAssemblyAI(audioBase64, apiKey);

        case "huggingface":
          return await this.transcribeWithHuggingFace(audioBase64, apiKey);

        default:
          return { transcription: "", error: "Invalid provider selected." };
      }
    } catch (error) {
      return { transcription: "", error: "Transcription failed." };
    }
  },

  async transcribeWithOpenAI(audioBase64: string, apiKey: string) {
    try {
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        body: this.createFormData(audioBase64, "whisper-1")
      });

      const result = await response.json();
      if (result.text) {
        return { transcription: result.text, error: null };
      } else {
        return { transcription: "", error: "OpenAI transcription failed." };
      }
    } catch {
      return { transcription: "", error: "OpenAI transcription error." };
    }
  },

  async transcribeWithAssemblyAI(audioBase64: string, apiKey: string) {
    try {
      const response = await fetch("https://api.assemblyai.com/v2/transcript", {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          audio_data: audioBase64,
          audio_format: "mp3"
        })
      });

      const result = await response.json();
      if (result.text) {
        return { transcription: result.text, error: null };
      } else {
        return { transcription: "", error: "AssemblyAI transcription failed." };
      }
    } catch {
      return { transcription: "", error: "AssemblyAI transcription error." };
    }
  },

  async transcribeWithHuggingFace(audioBase64: string, apiKey: string) {
    try {
      const response = await fetch("https://api-inference.huggingface.co/models/openai/whisper-large", {
        method: "POST",
        headers: {
          Authorization: apiKey ? `Bearer ${apiKey}` : undefined
        },
        body: this.base64ToBlob(audioBase64)
      });

      const result = await response.json();
      if (result.text) {
        return { transcription: result.text, error: null };
      } else {
        return { transcription: "", error: "Hugging Face transcription failed." };
      }
    } catch {
      return { transcription: "", error: "Hugging Face transcription error." };
    }
  },

  createFormData(audioBase64: string, model: string) {
    const formData = new FormData();
    const audioBlob = this.base64ToBlob(audioBase64);
    formData.append("file", audioBlob, "audio.mp3");
    formData.append("model", model);
    return formData;
  },

  base64ToBlob(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: "audio/mp3" });
  },

  async generateSummary({
    text,
    apiKey
  }: {
    text: string;
    apiKey: string;
  }) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "Summarize this transcription into a short summary:" },
            { role: "user", content: text }
          ],
          max_tokens: 100
        })
      });

      const result = await response.json();
      if (result.choices?.[0]?.message?.content) {
        return { summary: result.choices[0].message.content, error: null };
      } else {
        return { summary: "", error: "Summary generation failed." };
      }
    } catch {
      return { summary: "", error: "Summary generation error." };
    }
  }
};
