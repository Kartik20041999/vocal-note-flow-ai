import { useEffect, useState } from "react";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { NotesService } from "@/services/notesService";
import { TranscriptionService } from "@/services/transcriptionService";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square } from "lucide-react";

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const { toast } = useToast();
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording, error: recErr } = useVoiceRecording();

  useEffect(() => {
    supabase.auth.getUser().then(r => {
      setUser(r.data.user);
      if (r.data.user) NotesService.getAllNotes().then(res => res.data && setNotes(res.data));
    });

    const { data } = supabase.auth.onAuthStateChange((_ev, s) => {
      setUser(s?.user || null);
      if (s?.user) NotesService.getAllNotes().then(res => res.data && setNotes(res.data));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const saveNote = async () => {
    if (!audioBlob) return;
    setLoading(true);
    const { text, error: tErr } = await TranscriptionService.transcribeAudio(audioBlob, settings);
    if (tErr) return toast({ title: tErr, variant: "destructive" });
    const { error: nErr } = await NotesService.createNote({
      text, summary: settings.summary ? await TranscriptionService.generateSummary(text, settings.apiKey) : "",
      audio_url: URL.createObjectURL(audioBlob),
      user_id: user!.id,
    });
    if (nErr) return toast({ title: "Failed to save", variant: "destructive" });
    toast({ title: "Saved!" });
    clearRecording(); setNotes(prev => [...prev, { text, created_at: new Date().toISOString(), summary: "", audio_url: URL.createObjectURL(audioBlob) }]);
    setLoading(false);
  };

  if (!user) return <div className="p-8">Please log in.</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-4">
      {recErr && <div className="text-red-500">{recErr}</div>}
      <Button onClick={isRecording ? stopRecording : startRecording} className="w-full">
        {isRecording ? <Square/> : <Mic/>} {isRecording ? "Stop" : "Start"} Recording
      </Button>

      {audioBlob && (
        <>
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full"/>
          <Button onClick={saveNote} disabled={loading} className="w-full">
            {loading ? "Saving..." : "Transcribe & Save Note"}
          </Button>
          <Button onClick={clearRecording} variant="outline" className="w-full">Clear Recording</Button>
        </>
      )}

      <h2>Your Saved Notes ({notes.length})</h2>
      {notes.map(n => (
        <div key={n.id} className="p-4 border rounded">
          <audio controls src={n.audio_url} className="w-full"/>
          <div>{new Date(n.created_at).toLocaleString()}</div>
          <p>{n.text}</p>
        </div>
      ))}
    </div>
  );
}
