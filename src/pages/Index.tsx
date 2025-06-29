import { useEffect, useState } from "react";
import { NotesService } from "@/services/notesService";
import { AudioService } from "@/services/audioService";
import { TranscriptionService } from "@/services/transcriptionService";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const Index = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording, error } = useVoiceRecording();

  useEffect(() => {
    NotesService.getAllNotes().then(({ data }) => {
      setNotes(data || []);
    });
  }, []);

  const handleSave = async () => {
    if (!audioBlob) return;

    setLoading(true);
    const { publicUrl, error: uploadError } = await AudioService.uploadAudio(audioBlob);
    if (uploadError) {
      toast({ title: "Error", description: "Audio upload failed", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { text, error: transcribeError } = await TranscriptionService.transcribeAudio(audioBlob, settings);
    if (transcribeError) {
      toast({ title: "Error", description: "Transcription failed", variant: "destructive" });
      setLoading(false);
      return;
    }

    await NotesService.createNote({ text, summary: "", audio_url: publicUrl, user_id: "", });
    setLoading(false);
    clearRecording();
    toast({ title: "Note Saved", description: "Your note has been saved." });
    NotesService.getAllNotes().then(({ data }) => setNotes(data || []));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Record and Save Note</h1>

      {!isRecording ? (
        <Button className="w-full mb-4" onClick={startRecording}><Mic className="mr-2" />Start Recording</Button>
      ) : (
        <Button className="w-full mb-4" variant="destructive" onClick={stopRecording}><Square className="mr-2" />Stop Recording</Button>
      )}

      {audioBlob && (
        <div className="space-y-4">
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
          <Button className="w-full" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save Note"}</Button>
        </div>
      )}

      <h2 className="text-xl font-bold mt-8 mb-2">Saved Notes</h2>
      {notes.length === 0 ? <p>No notes yet.</p> : (
        <ul className="space-y-2">
          {notes.map(note => (
            <li key={note.id} className="p-4 bg-gray-100 rounded">
              <p className="text-sm text-gray-600">{new Date(note.created_at).toLocaleString()}</p>
              <p className="mt-2">{note.text}</p>
              {note.audio_url && <audio controls src={note.audio_url} className="w-full mt-2" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Index;
