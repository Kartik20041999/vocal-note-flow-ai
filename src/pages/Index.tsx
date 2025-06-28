import React, { useState } from 'react';
import { Mic, MicOff, Settings, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { useSettings } from '@/hooks/useSettings';
import { TranscriptionService } from '@/services/transcriptionService';
import { AIService } from '@/services/aiService';
import { NotesService } from '@/services/notesService';
import { supabase } from '@/integrations/supabase/client';
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
        description: "Please set your API key in Settings.",
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

      const { data: { user } } = await supabase.auth.getUser();
      const uploadedAudioUrl = await NotesService.uploadAudio(audioBlob, user.id);

      if (!uploadedAudioUrl) {
        toast({
          title: "Upload Failed",
          description: "Could not upload audio to storage.",
          variant: "destructive",
        });
        return;
      }

      const { error: saveError } = await NotesService.saveNote(
        transcriptionResult.text,
        summary,
        uploadedAudioUrl
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
          description: "Your voice note has been saved!",
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Vocal Note Keeper AI
          </h1>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/notes')} variant="outline" size="sm" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">My Notes</span>
            </Button>
            <Button onClick={() => navigate('/settings')} variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>

        {/* Main Recording Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="text-center">
            <div className="mb-8">
              <Button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isTranscribing}
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full text-white font-semibold text-lg transition-all duration-300 ${
                  isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
                }`}
              >
                {isRecording ? <MicOff className="w-8 h-8 sm:w-12 sm:h-12" /> : <Mic className="w-8 h-8 sm:w-12 sm:h-12" />}
              </Button>
            </div>

            {/* Status */}
            <div className="mb-6">
              {isRecording && <p className="text-red-600 dark:text-red-400 text-lg font-medium animate-pulse">🔴 Recording in progress...</p>}
              {audioBlob && !isRecording && <p className="text-green-600 dark:text-green-400 text-lg font-medium">✅ Recording ready</p>}
              {!isRecording && !audioBlob && <p className="text-gray-600 dark:text-gray-400 text-lg">Tap the mic to start recording</p>}
            </div>

            {/* Action Buttons */}
            {audioBlob && !isRecording && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleTranscribeAndSave}
                  disabled={isTranscribing || isGeneratingSummary}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
                >
                  {isTranscribing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    'Transcribe & Save'
                  )}
                </Button>
                <Button onClick={clearRecording} variant="outline" className="px-6 py-3 rounded-lg font-medium">Clear Recording</Button>
              </div>
            )}

            {recordingError && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-300 text-sm">{recordingError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Transcription & Summary */}
        {(transcriptionText || summaryText || isGeneratingSummary) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4">
            {transcriptionText && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Transcription</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">{transcriptionText}</p>
                </div>
              </div>
            )}
            {(summaryText || isGeneratingSummary) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">AI Summary</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  {isGeneratingSummary ? (
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating summary...
                    </div>
                  ) : (
                    <p className="text-blue-700 dark:text-blue-300">{summaryText}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Using: {settings.transcriptionProvider.charAt(0).toUpperCase() + settings.transcriptionProvider.slice(1)} Transcription
            {!settings.apiKey && settings.transcriptionProvider !== 'huggingface' && (
              <span className="text-orange-500 ml-2">⚠️ API key required</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
