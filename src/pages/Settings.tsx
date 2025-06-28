
import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveSettings = () => {
    if (settings.transcriptionProvider !== 'huggingface' && !settings.apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key for the selected transcription provider.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  const getApiKeyPlaceholder = () => {
    switch (settings.transcriptionProvider) {
      case 'openai':
        return 'sk-...';
      case 'assemblyai':
        return 'Your AssemblyAI API key';
      case 'huggingface':
        return 'hf_... (optional)';
      default:
        return 'Enter your API key';
    }
  };

  const getProviderDescription = () => {
    switch (settings.transcriptionProvider) {
      case 'openai':
        return 'OpenAI Whisper - High accuracy, requires API key';
      case 'assemblyai':
        return 'AssemblyAI - Fast and accurate, requires API key';
      case 'huggingface':
        return 'Hugging Face - Free tier available, optional API key for better performance';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center mb-6 pt-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="mr-3 hover:bg-white/50 dark:hover:bg-gray-700/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        </div>

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* Transcription Provider Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Transcription Provider</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                  AI Provider
                </label>
                <Select 
                  value={settings.transcriptionProvider} 
                  onValueChange={(value: any) => updateSettings({ transcriptionProvider: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select transcription provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="huggingface">Hugging Face (Free Tier)</SelectItem>
                    <SelectItem value="openai">OpenAI Whisper</SelectItem>
                    <SelectItem value="assemblyai">AssemblyAI</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getProviderDescription()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                  API Key
                </label>
                <div className="relative">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={settings.apiKey}
                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                    placeholder={getApiKeyPlaceholder()}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Your API key is stored securely in your browser and never sent to our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Data Storage Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Data Storage</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Storage Provider
              </label>
              <Select 
                value={settings.dataStorage} 
                onValueChange={(value) => updateSettings({ dataStorage: value })}
              >
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

          {/* Dark Mode Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Dark Mode
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Switch to dark theme for better viewing in low light
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSettings({ darkMode: checked })}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t dark:border-gray-700">
            <Button
              onClick={handleSaveSettings}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Save Settings
            </Button>
          </div>
        </div>

        {/* API Key Help */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Getting API Keys</h4>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• <strong>OpenAI:</strong> Visit platform.openai.com/api-keys</p>
            <p>• <strong>AssemblyAI:</strong> Visit app.assemblyai.com/signup</p>
            <p>• <strong>Hugging Face:</strong> Visit huggingface.co/settings/tokens (optional)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
