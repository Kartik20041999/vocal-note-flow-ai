import { useEffect, useState } from "react";
import { NotesService } from "@/services/notesService";
import { AudioService } from "@/services/audioService";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useSettings } from "@/hooks/useSettings";
import { TranscriptionService } from "@/services/transcriptionService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Download } from "lucide-react";

const Index = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { settings } = useSettings();
  const { toast } = useToast();

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError,
  } = useVoiceRecording();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchNotes(user.id);
    };
    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchNotes(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchNotes = async (userId: string) => {
    const { data } = await NotesService.fetchNotes(userId);
    setNotes(data || []);
  };

  const handleTranscribeAndSave = async () => {
    if (!user || !audioBlob) return;

    setLoading(true);

    const { publicUrl, error: uploadError } = await AudioService.uploadAudio(user.id, audioBlob);
    if (uploadError) {
      toast({ title: "Error", description: "Audio upload failed", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { text: transcription, error: transcribeError } = await TranscriptionService.transcribeAudio(audioBlob, settings);
    if (transcribeError) {
      toast({ title: "Error", description: transcribeError, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error: noteError } = await NotesService.createNote({
      text: transcription,
      summary: "",
      audio_url: publicUrl || "",
      user_id: user.id,
    });

    if (noteError) {
      toast({ title: "Error", description: "Failed to save note", variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Success", description: "Note saved with transcription!" });
    clearRecording();
    fetchNotes(user.id);
    setLoading(false);
  };

  const exportNotes = () => {
    if (notes.length === 0) {
      toast({ title: "No Notes", description: "No notes to export", variant: "destructive" });
      return;
    }

    const exportData = notes.map(note => ({
      date: note.created_at,
      transcription: note.text,
      summary: note.summary || 'N/A',
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "notes-export.json";
    link.click();

    URL.revokeObjectURL(url);
    toast({ title: "Export Complete", description: "Notes exported successfully!" });
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Vocal Notes</h1>
        <p className="mb-4">Please log in to use the app.</p>
        <Button onClick={() => window.location.href = "/login"}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vocal Notes</h1>
        <Button onClick={exportNotes} variant="outline">
          <Download className="w-4 h-4 mr-2" /> Export Notes
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
        {!isRecording && !audioBlob && (
          <Button onClick={startRecording} className="w-full flex items-center justify-center gap-2">
            <Mic className="w-4 h-4" /> Start Recording
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} variant="destructive" className="w-full flex items-center justify-center gap-2">
            <Square className="w-4 h-4" /> Stop Recording
          </Button>
        )}

        {audioBlob && !isRecording && (
          <>
            <audio controls src={URL.createObjectURL(audioBlob)} className="w-full mt-4 mb-4" />
            <Button onClick={handleTranscribeAndSave} disabled={loading} className="w-full mb-2">
              {loading ? "Saving..." : "Transcribe & Save"}
            </Button>
            <Button onClick={clearRecording} variant="outline" className="w-full">
              Clear
            </Button>
          </>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Notes ({notes.length})</h2>
      {notes.length === 0 ? (
        <div className="text-center text-gray-500">No notes yet. Record your first note!</div>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-6">
              <span className="text-sm text-gray-500">{new Date(note.created_at).toLocaleString()}</span>
              {note.text && (
                <div className="mt-2 p-3 bg-blue-50 rounded">
                  <h4 className="font-medium text-blue-800 mb-1">Transcription</h4>
                  <p className="text-blue-700 text-sm whitespace-pre-wrap">{note.text}</p>
                </div>
              )}
              {note.audio_url && (
                <div className="mt-3">
                  <audio controls src={note.audio_url} className="w-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
