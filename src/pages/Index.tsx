import { useEffect, useState } from "react";
import { NotesService } from "@/services/notesService";
import { AudioService } from "@/services/audioService";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Download } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { TranscriptionService } from "@/services/transcriptionService";

const Index = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const { settings } = useSettings();

  const {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
    clearRecording,
    error: recordingError
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

  useEffect(() => {
    if (recordingError) {
      toast({
        title: "Recording Error",
        description: recordingError,
        variant: "destructive",
      });
    }
  }, [recordingError, toast]);

  const fetchNotes = async (userId: string) => {
    const { data } = await NotesService.fetchNotes(userId);
    setNotes(data || []);
  };

  const handleSave = async () => {
    if (!user || !audioBlob) return;

    setLoading(true);

    const { publicUrl, error: uploadError } = await AudioService.uploadAudio(user.id, audioBlob);
    if (uploadError || !publicUrl) {
      toast({
        title: "Error",
        description: "Audio upload failed.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { transcription, error: transcribeError } = await TranscriptionService.transcribeAudio({
      audioBlob,
      provider: settings.transcriptionProvider,
      apiKey: settings.apiKey,
    });

    if (transcribeError) {
      toast({
        title: "Error",
        description: "Transcription failed.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    let summaryText = "";
    if (settings.summaryEnabled && settings.transcriptionProvider === "openai" && settings.apiKey.trim()) {
      const { summary, error: summaryError } = await TranscriptionService.generateSummary({
        text: transcription,
        apiKey: settings.apiKey,
      });

      if (summaryError) {
        toast({
          title: "Summary Error",
          description: "Failed to generate summary.",
          variant: "destructive",
        });
      } else {
        summaryText = summary;
      }
    }

    const { error: noteError } = await NotesService.createNote({
      text: transcription,
      summary: summaryText,
      audio_url: publicUrl,
      user_id: user.id,
    });

    if (noteError) {
      toast({
        title: "Error",
        description: "Failed to save note.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    clearRecording();
    fetchNotes(user.id);
    setLoading(false);

    toast({
      title: "Success",
      description: "Note saved successfully!",
    });
  };

  const exportNotes = () => {
    if (notes.length === 0) {
      toast({
        title: "No Notes",
        description: "No notes to export.",
        variant: "destructive",
      });
      return;
    }

    const exportData = notes.map(note => ({
      date: note.created_at,
      text: note.text,
      summary: note.summary || 'N/A'
    }));

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'notes-export.json';
    link.click();

    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Notes exported successfully!",
    });
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Vocal Notes</h1>
        <p className="mb-4">Please log in to use the note-taking app.</p>
        <Button onClick={() => window.location.href = '/login'}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vocal Notes</h1>
        <Button onClick={exportNotes} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Notes
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-2 mb-4">
          {!isRecording ? (
            <Button onClick={startRecording} variant="outline" className="flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
              <Square className="w-4 h-4" />
              Stop Recording
            </Button>
          )}

          {audioBlob && (
            <Button onClick={clearRecording} variant="outline">
              Clear Recording
            </Button>
          )}
        </div>

        {audioBlob && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 mb-2">Recording ready to save</p>
            <audio controls src={URL.createObjectURL(audioBlob)} className="w-full mb-2" />
            <Button onClick={handleSave} disabled={loading} className="w-full">
              {loading ? "Saving..." : "Transcribe & Save Note"}
            </Button>
          </div>
        )}
      </div>

      <h2 className="text-2xl font-bold mb-4">Your Notes ({notes.length})</h2>
      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No notes yet. Record your first note above!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>

              {note.summary && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">AI Summary</h4>
                  <p className="text-blue-700 text-sm">{note.summary}</p>
                </div>
              )}

              <p className="mb-4 whitespace-pre-wrap">{note.text}</p>

              {note.audio_url && (
                <div className="mt-4">
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
