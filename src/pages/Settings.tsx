import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LogOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { AuthService } from '@/services/authService';
import { NotesService } from '@/services/notesService';

export default function Settings() {
  const nav = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);

  const save = () => {
    if (settings.summary && !settings.apiKey.trim()) {
      toast({ title: "API key required for summary", variant: "destructive" });
      return;
    }
    updateSettings(settings);
    toast({ title: "Settings saved" });
  };

  const exportAll = async (fmt: 'json'|'txt') => {
    const { data, error } = await NotesService.getAllNotes();
    if (error || !data) return toast({ title: "Export failed", variant: "destructive" });

    const content = fmt === 'json'
      ? JSON.stringify(data, null, 2)
      : data.map(n => `---\n${n.created_at}\n${n.text}\n`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `notes.${fmt}`;
    a.click(); URL.revokeObjectURL(url);
    toast({ title: "Exported" });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Button onClick={() => nav('/')} variant="ghost"><ArrowLeft /> Back</Button>
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Provider */}
      <div className="mt-4">
        <Select value={settings.transcriptionProvider} onValueChange={v => updateSettings({ ...settings, transcriptionProvider: v })}>
          <SelectTrigger><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="huggingface">Hugging Face</SelectItem>
            <SelectItem value="openai">OpenAI Whisper</SelectItem>
            <SelectItem value="assemblyai">AssemblyAI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Toggle */}
      <div className="mt-4 flex items-center justify-between">
        <label>Enable AI Summary (OpenAI only)</label>
        <Switch checked={settings.summary} onCheckedChange={v => updateSettings({...settings, summary: v})} />
      </div>

      {/* API key input */}
      {settings.transcriptionProvider !== 'huggingface' && (
        <Input
          type={showKey ? 'text' : 'password'}
          placeholder="Enter API key"
          value={settings.apiKey}
          onChange={e => updateSettings({ ...settings, apiKey: e.target.value })}
        />
      )}
      <Button small onClick={() => setShowKey(!showKey)}>
        {showKey ? <EyeOff/> : <Eye/>}
      </Button>

      <Button className="mt-4" onClick={save}>Save Settings</Button>
      <Button variant="outline" onClick={() => exportAll('json')}><Download/> Export JSON</Button>
      <Button variant="outline" onClick={() => exportAll('txt')}>Export TXT</Button>
      <Button variant="destructive" onClick={() => { AuthService.signOut(); nav('/'); }}><LogOut/> Logout</Button>
    </div>
  );
}
