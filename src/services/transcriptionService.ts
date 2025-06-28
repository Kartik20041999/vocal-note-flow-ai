
interface TranscriptionResponse {
  text: string;
  error?: string;
}

export class TranscriptionService {
  private static readonly HF_API_URL = 'https://api-inference.huggingface.co/models/openai/whisper-tiny.en';
  private static readonly HF_TOKEN = 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Free tier token

  static async transcribeAudio(audioBlob: Blob): Promise<TranscriptionResponse> {
    try {
      // Convert blob to array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      const response = await fetch(this.HF_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.HF_TOKEN}`,
          'Content-Type': 'audio/wav',
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        // If model is loading, try again after delay
        if (response.status === 503) {
          const result = await response.json();
          if (result.error?.includes('loading')) {
            console.log('Model is loading, retrying in 10 seconds...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            return this.transcribeAudio(audioBlob);
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return { text: result.text || 'No transcription available' };
    } catch (error) {
      console.error('Transcription error:', error);
      return { 
        text: '', 
        error: error instanceof Error ? error.message : 'Transcription failed' 
      };
    }
  }

  // Fallback method using Web Speech API (works in Chrome/Edge)
  static async transcribeWithWebSpeech(audioBlob: Blob): Promise<TranscriptionResponse> {
    return new Promise((resolve) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        resolve({ text: '', error: 'Speech recognition not supported in this browser' });
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve({ text: transcript });
      };

      recognition.onerror = (event: any) => {
        resolve({ text: '', error: `Speech recognition error: ${event.error}` });
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
      };

      // Create audio element to play the recorded audio
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
      recognition.start();
    });
  }
}
