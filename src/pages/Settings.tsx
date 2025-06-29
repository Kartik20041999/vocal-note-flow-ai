import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/authService';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    if ((settings.transcriptionProvider === 'openai' || settings.transcriptionProvider === 'assemblyai') && !settings.apiKey.trim()) {
      toast({ title: "API Key Required", description: "Please enter your API key for the selected provider.", variant: "destructive" });
      return;
    }

    toast({ title: "Settings Saved", description: "Your settings have been saved." });
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    navigate('/');
    toast({ title: "Logged Out", description: "You have been logged out." });
  };

  return (
    <div className="min-h-screen p-4 max-w-xl mx-auto">
      <div className="flex items-center mb-6">
        <Button onClick={() => navigate('/')} variant="ghost" size="sm" className="mr-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Transcription Provider</h2>
          <Select
            value={settings.transcriptionProvider}
            onValueChange={(value) => updateSettings({ transcriptionProvider: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="huggingface">HuggingFace (Free, optional key)</SelectItem>
              <SelectItem value="openai">OpenAI Whisper (API key required)</SelectItem>
              <SelectItem value="assemblyai">AssemblyAI (API key required)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(settings.transcriptionProvider === 'openai' || settings.transcriptionProvider === 'assemblyai' || settings.transcriptionProvider === 'huggingface') && (
          <div>
            <label className="block mb-1 font-medium">API Key {settings.transcriptionProvider === 'huggingface' && "(optional)"}</label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                placeholder="Enter your API key"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {settings.transcriptionProvider === 'openai' && (
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Generate AI Summary</label>
              <p className="text-sm text-gray-500">Summarize transcriptions using OpenAI</p>
            </div>
            <Switch
              checked={settings.generateSummary}
              onCheckedChange={(checked) => updateSettings({ generateSummary: checked })}
            />
          </div>
        )}

        <Button className="w-full" onClick={handleSave}>
          Save Settings
        </Button>

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Settings;
