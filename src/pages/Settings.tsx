import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LogOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { NotesService } from '@/services/notesService';
import { AuthService } from '@/services/authService';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveSettings = () => {
    if (settings.summaryEnabled && !settings.openAiKey.trim()) {
      toast({
        title: "OpenAI Key Required",
        description: "Summary feature requires your OpenAI API key.",
        variant: "destructive",
      });
      return;
    }

    if (!settings.apiKey.trim() && settings.transcriptionProvider !== 'huggingface') {
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

  const handleLogout = async () => {
    await AuthService.signOut();
    navigate('/');
    toast({
      title: "Logged Out",
      description: "You have been logged out.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto p-4">
        
        <div className="flex items-center mb-6 pt-4">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="mr-3">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Transcription Provider</h3>
            <Select value={settings.transcriptionProvider} onValueChange={(value) => updateSettings({ transcriptionProvider: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select transcription provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="huggingface">Hugging Face (Free Tier)</SelectItem>
                <SelectItem value="openai">OpenAI Whisper</SelectItem>
                <SelectItem value="assemblyai">AssemblyAI</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs mt-2">
              {settings.transcriptionProvider === 'huggingface' ? 'Hugging Face - Free, optional API key' :
              settings.transcriptionProvider === 'openai' ? 'OpenAI Whisper - High accuracy, requires API key' :
              'AssemblyAI - Fast & accurate, requires API key'}
            </p>

            {(settings.transcriptionProvider !== 'huggingface') && (
              <div className="mt-4">
                <label className="text-sm font-medium">API Key</label>
                <div className="relative mt-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={settings.apiKey}
                    onChange={(e) => updateSettings({ apiKey: e.target.value })}
                    placeholder="Enter your API key"
                    className="pr-10"
                  />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">AI Summary (OpenAI Only)</h3>
            <div className="flex items-center justify-between">
              <p>Enable AI-generated summaries for your notes (requires OpenAI API key)</p>
              <Switch checked={settings.summaryEnabled} onCheckedChange={(checked) => updateSettings({ summaryEnabled: checked })} />
            </div>
            {settings.summaryEnabled && (
              <div className="mt-3">
                <label className="text-sm font-medium">OpenAI API Key</label>
                <Input
                  type="text"
                  value={settings.openAiKey}
                  onChange={(e) => updateSettings({ openAiKey: e.target.value })}
                  placeholder="sk-..."
                />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Appearance</h3>
            <div className="flex items-center justify-between">
              <p>Dark Mode</p>
              <Switch checked={settings.darkMode} onCheckedChange={(checked) => updateSettings({ darkMode: checked })} />
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <Button onClick={handleSaveSettings} className="w-full">Save Settings</Button>
            <Button variant="destructive" className="w-full" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
