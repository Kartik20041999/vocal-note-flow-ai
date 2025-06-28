
import React, { useState } from 'react';
import { Mic, MicOff, Save, List, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const navigate = useNavigate();

  const handleStartStopRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setHasRecording(true);
    } else {
      // Start recording
      setIsRecording(true);
      setHasRecording(false);
    }
  };

  const handleSaveNote = () => {
    // TODO: Connect to Supabase to save note
    console.log('Saving note...');
    setHasRecording(false);
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

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={handleSaveNote}
            disabled={!hasRecording}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors duration-200"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Note
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

        {/* Status */}
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
