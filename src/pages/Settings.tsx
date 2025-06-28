
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const [dataStorage, setDataStorage] = useState('supabase');
  const [transcriptionProvider, setTranscriptionProvider] = useState('huggingface');
  const [darkMode, setDarkMode] = useState(false);

  const handleSaveSettings = () => {
    // TODO: Save settings to Supabase or localStorage
    console.log('Saving settings:', {
      dataStorage,
      transcriptionProvider,
      darkMode
    });
    
    // Show success feedback
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center mb-6 pt-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="mr-3 hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Data Storage Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Storage</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                Storage Provider
              </label>
              <Select value={dataStorage} onValueChange={setDataStorage}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select storage provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supabase">Supabase Database</SelectItem>
                  <SelectItem value="vector" disabled>Vector DB (coming soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transcription Provider Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Transcription Provider</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">
                AI Provider
              </label>
              <Select value={transcriptionProvider} onValueChange={setTranscriptionProvider}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select transcription provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="huggingface">Hugging Face (Free Tokens)</SelectItem>
                  <SelectItem value="other" disabled>Other (coming soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dark Mode Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Dark Mode
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Switch to dark theme for better viewing in low light
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleSaveSettings}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Save Settings
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">Ready for Supabase Integration</h4>
          <p className="text-sm text-blue-700">
            This app is designed to work seamlessly with Supabase for authentication, 
            data storage, and backend APIs. Connect your Supabase project to enable 
            full functionality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
