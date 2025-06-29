// pages/Settings.tsx
import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, LogOut, Download } from 'lucide-react';
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Switch, Input } from '@/components/ui';
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

  const handleSave = () => {
    if (settings.enableSummary && (!settings.openaiKey.trim())) {
      return toast({ title: 'Need OpenAI Key', variant: 'destructive' });
    }
    toast({ title: 'Settings Saved' });
  };

  const handleExport = (fmt: 'json' | 'txt') => {
    NotesService.getAllNotes().then(({ data, error }) => {
      if (error) return toast({ title: 'Export failed', variant: 'destructive' });
      const content = fmt==='json' ? JSON.stringify(data) :
        data.map(n=>`---\n${n.created_at}\n${n.text}`).join('\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `notes.${fmt}`;
      a.click();
      toast({ title: 'Exported' });
    });
  };

  return (
    <div><Button onClick={()=>nav('/')}>Back</Button>
      <h1>Settings</h1>

      <div>
        <label>Provider</label>
        <Select value={settings.provider} onValueChange={v=>updateSettings({ provider: v })}>
          <SelectTrigger><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="hf">HuggingFace</SelectItem>
            <SelectItem value="asm">AssemblyAI</SelectItem>
            <SelectItem value="openai">OpenAI Whisper</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label>Enable Summary (OpenAI only)</label>
        <Switch
          checked={settings.enableSummary}
          onCheckedChange={c=>updateSettings({ enableSummary: c })}
        />
      </div>

      {settings.provider === 'openai' || settings.enableSummary ? (
        <div>
          <label>OpenAI Key {showKey ? '(visible)' : ''}</label>
          <Input
            type={showKey ? 'text' : 'password'}
            value={settings.openaiKey}
            placeholder="sk..."
            onChange={e=>updateSettings({ openaiKey: e.target.value })}
          />
          <Button onClick={()=>setShowKey(s=>!s)}>{showKey ? <EyeOff/> : <Eye/>}</Button>
        </div>
      ) : null}

      <Button onClick={handleSave}>Save Settings</Button>
      <Button variant="outline" onClick={()=>handleExport('json')}><Download/>JSON</Button>
      <Button variant="outline" onClick={()=>handleExport('txt')}><Download/>TXT</Button>
      <Button variant="destructive" onClick={()=>AuthService.signOut().then(()=>nav('/'))}><LogOut/>Logout</Button>
    </div>
  );
}
