
interface TranscriptionResponse {
  text: string;
  error?: string;
}

export type TranscriptionProvider = 'huggingface' | 'openai' | 'assemblyai';

export class TranscriptionService {
  static async transcribeAudio(
    audioBlob: Blob, 
    provider: TranscriptionProvider, 
    apiKey: string
  ): Promise<TranscriptionResponse> {
    if (!apiKey) {
      return { text: '', error: 'API key is required for transcription' };
    }

    try {
      switch (provider) {
        case 'huggingface':
          return await this.transcribeWithHuggingFace(audioBlob, apiKey);
        case 'openai':
          return await this.transcribeWithOpenAI(audioBlob, apiKey);
        case 'assemblyai':
          return await this.transcribeWithAssemblyAI(audioBlob, apiKey);
        default:
          return { text: '', error: 'Unsupported transcription provider' };
      }
    } catch (error) {
      console.error('Transcription error:', error);
      return { 
        text: '', 
        error: error instanceof Error ? error.message : 'Transcription failed' 
      };
    }
  }

  private static async transcribeWithHuggingFace(audioBlob: Blob, apiKey: string): Promise<TranscriptionResponse> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    
    const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-large-v3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'audio/wav',
      },
      body: arrayBuffer,
    });

    if (!response.ok) {
      if (response.status === 503) {
        const result = await response.json();
        if (result.error?.includes('loading')) {
          console.log('Model is loading, retrying in 10 seconds...');
          await new Promise(resolve => setTimeout(resolve, 10000));
          return this.transcribeWithHuggingFace(audioBlob, apiKey);
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { text: result.text || 'No transcription available' };
  }

  private static async transcribeWithOpenAI(audioBlob: Blob, apiKey: string): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    return { text: result.text || 'No transcription available' };
  }

  private static async transcribeWithAssemblyAI(audioBlob: Blob, apiKey: string): Promise<TranscriptionResponse> {
    // First upload the audio file
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
      },
      body: audioBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`AssemblyAI upload error: ${uploadResponse.status}`);
    }

    const { upload_url } = await uploadResponse.json();

    // Then request transcription
    const transcriptionResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
      }),
    });

    if (!transcriptionResponse.ok) {
      throw new Error(`AssemblyAI transcription error: ${transcriptionResponse.status}`);
    }

    const transcription = await transcriptionResponse.json();
    
    // Poll for completion
    return await this.pollAssemblyAITranscription(transcription.id, apiKey);
  }

  private static async pollAssemblyAITranscription(transcriptionId: string, apiKey: string): Promise<TranscriptionResponse> {
    const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptionId}`, {
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!pollResponse.ok) {
      throw new Error(`AssemblyAI poll error: ${pollResponse.status}`);
    }

    const result = await pollResponse.json();

    if (result.status === 'completed') {
      return { text: result.text || 'No transcription available' };
    } else if (result.status === 'error') {
      throw new Error('AssemblyAI transcription failed');
    } else {
      // Still processing, wait and try again
      await new Promise(resolve => setTimeout(resolve, 3000));
      return this.pollAssemblyAITranscription(transcriptionId, apiKey);
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

      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
      recognition.start();
    });
  }
}
