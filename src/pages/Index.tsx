
import React, { useState } from 'react';
import { Mic, MicOff, Save, List, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { TranscriptionService } from '@/services/transcriptionService';
import { NotesService } from '@/services/notesService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError
  } = useVoiceRecording();

  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartStopRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      clearRecording();
      setTranscriptionText('');
      await startRecording();
    }
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      toast({
        title: "No audio to transcribe",
        description: "Please record some audio first.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    try {
      // First try Hugging Face API
      let result = await TranscriptionService.transcribeAudio(audioBlob);
      
      // If HF fails, try Web Speech API as fallback
      if (result.error) {
        console.log('Hugging Face failed, trying Web Speech API...');
        result = await TranscriptionService.transcribeWithWebSpeech(audioBlob);
      }

      if (result.error) {
        toast({
          title: "Transcription failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        setTranscriptionText(result.text);
        toast({
          title: "Transcription complete",
          description: "Your audio has been transcribed successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Transcription error",
        description: "An unexpected error occurred during transcription.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveNote = async () => {
    if (!transcriptionText.trim()) {
      toast({
        title: "No text to save",
        description: "Please transcribe your recording first.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await NotesService.saveNote(transcriptionText);
      
      if (error) {
        toast({
          title: "Failed to save note",
          description: "There was an error saving your note. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Note saved successfully",
          description: "Your note has been saved to your collection.",
        });
        setTranscriptionText('');
        clearRecording();
      }
    } catch (error) {
      toast({
        title: "Save error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Vocal Note Keeper AI
          </h1>
          <p className="text-gray-600">Capture your thoughts with voice</p>
        </div>

        {/* Recording Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleStartStopRecording}
            disabled={isTranscribing || isSaving}
            className={`w-32 h-32 rounded-full text-white font-semibold text-lg shadow-lg transition-all duration-300 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
            }`}
          >
            <div className="flex flex-col items-center space-y-2">
              {isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
              <span className="text-sm">
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </span>
            </div>
          </Button>
        </div>

        {/* Transcription Display */}
        {transcriptionText && (
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Transcription:</h3>
            <p className="text-gray-800 leading-relaxed">{transcriptionText}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {audioBlob && !transcriptionText && (
            <Button
              onClick={handleTranscribe}
              disabled={isTranscribing}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Transcribing...
                </>
              ) : (
                'Transcribe Audio'
              )}
            </Button>
          )}

          <Button
            onClick={handleSaveNote}
            disabled={!transcriptionText || isSaving}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Note
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/notes')}
              variant="outline"
              className="py-3 rounded-lg font-medium border-2 border-blue-200 hover:bg-blue-50 transition-colors duration-200"
            >
              <List className="w-5 h-5 mr-2" />
              View Notes
            </Button>

            <Button
              onClick={() => navigate('/settings')}
              variant="outline"
              className="py-3 rounded-lg font-medium border-2 border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              <Settings className="w-5 h-5 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Status Messages */}
        {recordingError && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">{recordingError}</span>
            </div>
          </div>
        )}

        {isRecording && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Recording in progress...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
