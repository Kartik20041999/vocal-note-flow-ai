import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/authService';

const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveSettings = () => {
    if (settings.enableSummary && (!settings.apiKey.trim() || settings.transcriptionProvider !== "openai")) {
      toast({
        title: "OpenAI API Key Required",
        description: "To enable summaries, please enter a valid OpenAI API key.",
        variant: "destructive",
      });
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
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-4 flex items-center">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold ml-2">Settings</h1>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-medium">Transcription Provider</label>
          <Select value={settings.transcriptionProvider} onValueChange={(value) => updateSettings({ transcriptionProvider: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="huggingface">Hugging Face (Free Tier)</SelectItem>
              <SelectItem value="openai">OpenAI Whisper</SelectItem>
              <SelectItem value="assemblyai">AssemblyAI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="font-medium">API Key</label>
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
              placeholder="Enter API key"
            />
            <Button type="button" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowApiKey(!showApiKey)}>
              {showApiKey ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">AI Summary (OpenAI Only)</p>
            <p className="text-sm text-gray-500">Enable AI summaries for your notes</p>
          </div>
          <Switch
            checked={settings.enableSummary}
            onCheckedChange={(checked) => updateSettings({ enableSummary: checked })}
          />
        </div>

        <Button className="w-full" onClick={handleSaveSettings}>Save Settings</Button>
        <Button className="w-full" variant="destructive" onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
};

export default Settings;
