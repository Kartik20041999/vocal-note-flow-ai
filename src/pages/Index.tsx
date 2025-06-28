import React, { useState } from 'react';
import { Mic, MicOff, Settings, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useSettings } from '@/hooks/useSettings';
import { TranscriptionService } from '@/services/transcriptionService';
import { AIService } from '@/services/aiService';
import { NotesService } from '@/services/notesService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [summaryText, setSummaryText] = useState('');

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError
  } = useVoiceRecording();

  const handleStartRecording = async () => {
    setTranscriptionText('');
    setSummaryText('');
    clearRecording();
    await startRecording();
    toast({
      title: "Recording Started",
      description: "Speak your note now...",
    });
  };

  const handleStopRecording = () => {
    stopRecording();
    toast({
      title: "Recording Stopped",
      description: "Processing your recording...",
    });
  };

  const handleTranscribeAndSave = async () => {
    if (!audioBlob) {
      toast({
        title: "No Recording",
        description: "Please record audio first.",
        variant: "destructive",
      });
      return;
    }

    if (settings.transcriptionProvider !== 'huggingface' && !settings.apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please set your API key in Settings to use this transcription provider.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);

    try {
      const transcriptionResult = await TranscriptionService.transcribeAudio(
        audioBlob,
        settings.transcriptionProvider,
        settings.apiKey
      );

      if (transcriptionResult.error) {
        toast({
          title: "Transcription Failed",
          description: transcriptionResult.error,
          variant: "destructive",
        });
        return;
      }

      setTranscriptionText(transcriptionResult.text);

      let summary = '';
      if (settings.transcriptionProvider === 'openai' && settings.apiKey && transcriptionResult.text) {
        setIsGeneratingSummary(true);
        try {
          summary = await AIService.generateSummary(transcriptionResult.text, 'openai', settings.apiKey);
          setSummaryText(summary);
        } catch (error) {
          console.error('Summary generation failed:', error);
        }
        setIsGeneratingSummary(false);
      }

      const audioUrl = URL.createObjectURL(audioBlob);

      const { error: saveError } = await NotesService.saveNote(
        transcriptionResult.text,
        summary,
        audioUrl
      );

      if (saveError) {
        toast({
          title: "Save Failed",
          description: "Failed to save note to database.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Note Saved",
          description: "Your voice note has been saved successfully!",
        });
        clearRecording();
        setTranscriptionText('');
        setSummaryText('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8 pt-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Vocal Note Keeper AI</h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/notes')} variant="outline" size="sm">
              <FileText className="w-4 h-4" /> My Notes
            </Button>
            <Button onClick={() => navigate('/settings')} variant="outline" size="sm">
              <Settings className="w-4 h-4" /> Settings
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 text-center">
          <div className="mb-8">
            <Button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isTranscribing}
              className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full text-white text-lg ${
                isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8 sm:w-12 sm:h-12" /> : <Mic className="w-8 h-8 sm:w-12 sm:h-12" />}
            </Button>
          </div>

          {audioBlob && !isRecording && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleTranscribeAndSave} disabled={isTranscribing || isGeneratingSummary} className="bg-green-500 hover:bg-green-600 text-white">
                {isTranscribing ? <><Loader2 className="w-4 h-4 animate-spin" /> Transcribing...</> : 'Transcribe & Save'}
              </Button>
              <Button onClick={clearRecording} variant="outline">Clear Recording</Button>
            </div>
          )}

          {recordingError && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {recordingError}
            </div>
          )}
        </div>

        {(transcriptionText || summaryText || isGeneratingSummary) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            {transcriptionText && (
              <div>
                <h3 className="font-semibold">Transcription</h3>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">{transcriptionText}</div>
              </div>
            )}
            {(summaryText || isGeneratingSummary) && (
              <div>
                <h3 className="font-semibold">AI Summary</h3>
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
                  {isGeneratingSummary ? 'Generating summary...' : summaryText}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
