// src/pages/Index.tsx
import React, { useState, useEffect } from "react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useSettings } from "@/hooks/useSettings";
import { TranscriptionService } from "@/services/transcriptionService";
import { AIService } from "@/services/aiService";
import { NotesService } from "@/services/notesService";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Note {
  id: string;
  text: string;
  summary?: string;
  audio_url?: string;
  created_at: string;
}

export default function Index() {
  const { settings } = useSettings();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [transcribing, setTranscribing] = useState(false);
  const [recording, setRecording] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");

  const { isRecording, audioBlob, startRecording, stopRecording } = useVoiceRecording();

  useEffect(() => {
    NotesService.fetchNotes().then(r => {
      if (r.data) setNotes(r.data);
    });
  }, []);

  const processAndSave = async () => {
    if (!audioBlob) return;
    setTranscribing(true);

    const provider = settings.transcriptionProvider;
    const key = settings.apiKey;

    const transcript = await TranscriptionService.transcribeAudio(audioBlob, provider, key);
    if (transcript.error) {
      toast({ title: "Transcription failed", description: transcript.error, variant: "destructive" });
      setTranscribing(false);
      return;
    }

    const summary = settings.enableSummary && provider === "openai"
      ? await AIService.generateSummary(transcript.text, key)
      : "";

    const audioUrl = URL.createObjectURL(audioBlob);
    await NotesService.createNote({ text: transcript.text, summary, audio_url: audioUrl });
    const { data } = await NotesService.fetchNotes();
    setNotes(data!);

    toast({ title: "Saved!" });
    setTranscribing(false);
    setRecording(null);
    setAudioUrl("");
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Record and Save Note</h1>
      {!isRecording ? (
        <Button onClick={startRecording} className="w-full py-6"><Mic size={24} /> Start</Button>
      ) : (
        <Button onClick={() => { stopRecording(); setRecording(audioBlob!); setAudioUrl(URL.createObjectURL(audioBlob!)); }} variant="destructive" className="w-full py-6">
          <Square size={24} /> Stop
        </Button>
      )}

      {recording && (
        <div className="mt-4 bg-gray-100 p-4 space-y-2">
          <audio controls src={audioUrl} className="w-full" />
          <Button onClick={processAndSave} disabled={transcribing} className="w-full">
            {transcribing ? <><Loader2 className="animate-spin" /> Saving...</> : "Save Note"}
          </Button>
        </div>
      )}

      <hr className="my-6" />
      <h2 className="text-xl font-semibold mb-2">Saved Notes</h2>

      {notes.length === 0 && <p>No notes yet.</p>}
      {notes.map(n => (
        <div key={n.id} className="mb-4 p-3 bg-white rounded shadow">
          <audio controls src={n.audio_url} className="w-full mb-2" />
          <p className="italic text-sm text-gray-600">{new Date(n.created_at).toLocaleString()}</p>
          <p className="mt-1">{n.text}</p>
          {n.summary && <p className="mt-2 text-blue-600">Summary: {n.summary}</p>}
        </div>
      ))}
    </div>
);
}
