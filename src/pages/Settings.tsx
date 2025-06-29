// src/pages/Settings.tsx
import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Download, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { AuthService } from "@/services/authService";
import { NotesService } from "@/services/notesService";

export default function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings, updateSettings } = useSettings();
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (settings.enableSummary && settings.transcriptionProvider === "openai" && !settings.apiKey.trim()) {
      return toast({ title: "Error", description: "OpenAI key required for summary", variant: "destructive" });
    }
    toast({ title: "Settings saved" });
  };

  const handleExport = async (format: "json" | "txt") => {
    const { data, error } = await NotesService.fetchNotes();

    if (error) return toast({ title: "Export failed", variant: "destructive" });

    let content = format === "json"
      ? JSON.stringify(data, null, 2)
      : data.map(n => `-- ${n.created_at}\n${n.text}\n`).join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = format === "json" ? "notes.json" : "notes.txt";
    link.click();

    toast({ title: "Exported", description: `Saved as ${format.toUpperCase()}` });
  };

  const handleLogout = async () => {
    await AuthService.signOut();
    toast({ title: "Logged out" });
    navigate("/");
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <Button variant="ghost" onClick={() => navigate("/")}>
        <ArrowLeft /> Back
      </Button>
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <section className="mb-4">
        <label className="block mb-1">Transcription Provider</label>
        <Select value={settings.transcriptionProvider} onValueChange={(v) => updateSettings({ transcriptionProvider: v })}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="huggingface">Hugging Face (free)</SelectItem>
            <SelectItem value="openai">OpenAI Whisper</SelectItem>
            <SelectItem value="assemblyai">AssemblyAI</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section className="mb-4">
        <label className="flex items-center justify-between">
          Enable AI Summary (OpenAI only)
          <Switch checked={settings.enableSummary} onCheckedChange={(on) => updateSettings({ enableSummary: on })} />
        </label>
      </section>

      {settings.enableSummary && settings.transcriptionProvider === "openai" && (
        <section className="mb-4">
          <label>OpenAI API Key</label>
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
              placeholder="sk-..."
            />
            <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setShowKey(!showKey)}>
              {showKey ? <EyeOff /> : <Eye />}
            </Button>
          </div>
        </section>
      )}

      <div className="space-y-2">
        <Button onClick={handleSave} className="w-full">Save Settings</Button>
        <Button variant="outline" onClick={() => handleExport("json")}>Export JSON</Button>
        <Button variant="outline" onClick={() => handleExport("txt")}>Export TXT</Button>
        <Button variant="destructive" onClick={handleLogout}> <LogOut /> Logout </Button>
      </div>
    </div>
  );
}
