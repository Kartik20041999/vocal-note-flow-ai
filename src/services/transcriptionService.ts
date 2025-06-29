export const TranscriptionService = {
  async transcribeAudio(audioBlob: Blob, settings: any) {
    if (!settings.transcriptionProvider) return { text: "", error: "No provider selected" };

    try {
      // Dummy mock for now — implement real API call logic here
      const fakeText = "Transcribed text from audio...";
      return { text: fakeText, error: null };
    } catch (error) {
      return { text: "", error: "Transcription failed" };
    }
  }
};
