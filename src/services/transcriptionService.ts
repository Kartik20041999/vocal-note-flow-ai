export const TranscriptionService = {
  async transcribeAudio(audioBlob: Blob, settings: any) {
    // Here, wire up real calls to huggingface, openai, testing
    const fake = "🎤 Transcription text (placeholder)";
    return { text: fake, error: null };
  },
  async generateSummary(text: string, apiKey: string) {
    // Only for OpenAI – placeholder
    return "👁️ AI-generated summary";
  }
};
