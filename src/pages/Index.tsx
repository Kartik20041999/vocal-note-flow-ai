import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { useToast } from "@/hooks/use-toast";
import { NotesService } from "@/services/notesService";
import { TranscriptionService } from "@/services/transcriptionService";
import { SettingsService } from "@/services/settingsService";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Square, Download, Settings as SettingsIcon } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording, error: recordingError } = useVoiceRecording();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) fetchNotes(user.id);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchNotes(session.user.id);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchNotes = async (userId: string) => {
    const { data, error } = await NotesService.fetchNotes(userId);
    if (error) {
      toast({ title: "Error", description: "Failed to load notes", variant: "destructive" });
    } else {
      setNotes(data || []);
    }
  };

  const handleSaveNote = async () => {
    if (!user || !audioBlob) return;

    setLoading(true);

    const { publicUrl, error: uploadError } = await NotesService.uploadAudio(user.id, audioBlob);
    if (uploadError || !publicUrl) {
      toast({ title: "Error", description: "Audio upload failed", variant: "destructive" });
      setLoading(false);
      return;
    }

    const settings = await SettingsService.getSettings();
    const { text: transcription, error: transcriptionError } = await TranscriptionService.transcribeAudio(audioBlob, settings);

    if (transcriptionError) {
      toast({ title: "Error", description: transcriptionError, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await NotesService.createNote({
      text: transcription,
      summary: "",
      audio_url: publicUrl,
      user_id: user.id
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save note", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Note saved successfully!" });
      clearRecording();
      fetchNotes(user.id);
    }

    setLoading(false);
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Vocal Notes</h1>
        <p className="mb-4">Please log in to use the app.</p>
        <Button onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vocal Notes</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/settings')}>
            <SettingsIcon className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-2 mb-4">
          {!isRecording ? (
            <Button onClick={startRecording} variant="outline">
              <Mic className="w-4 h-4 mr-2" /> Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive">
              <Square className="w-4 h-4 mr-2" /> Stop Recording
            </Button>
          )}
        </div>

        {audioBlob && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 mb-2">Recording ready</p>
            <audio controls src={URL.createObjectURL(audioBlob)} className="w-full mb-3" />
            <Button className="w-full" onClick={handleSaveNote} disabled={loading}>
              {loading ? "Saving..." : "Save & Transcribe"}
            </Button>
          </div>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Your Notes</h2>
      {notes.length === 0 ? (
        <p className="text-gray-500">No notes yet. Record your first one!</p>
      ) : (
        <div className="space-y-4">
          {notes.map(note => (
            <div key={note.id} className="bg-white rounded-lg shadow-md p-4 space-y-2">
              <p className="text-sm text-gray-500">{new Date(note.created_at).toLocaleString()}</p>
              {note.summary && (
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-medium text-blue-800 mb-1">AI Summary</h4>
                  <p className="text-blue-700 text-sm">{note.summary}</p>
                </div>
              )}
              <p className="whitespace-pre-wrap">{note.text}</p>
              {note.audio_url && <audio controls src={note.audio_url} className="w-full mt-2" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
