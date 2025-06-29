import { useEffect, useState } from "react";
import { NotesService } from "@/services/notesService";
import { AudioService } from "@/services/audioService";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Play, Pause, Download, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const { isRecording, audioBlob, startRecording, stopRecording, clearRecording, error: recordingError } = useVoiceRecording();

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
      toast({ title: "Recording Error", description: recordingError, variant: "destructive" });
    }
  }, [recordingError]);

  const fetchNotes = async (userId: string) => {
    const { data } = await NotesService.fetchNotes(userId);
    setNotes(data || []);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    let audioUrl = "";
    if (audioBlob) {
      const { publicUrl, error } = await AudioService.uploadAudio(user.id, audioBlob);
      if (error) {
        toast({ title: "Error", description: "Audio upload failed", variant: "destructive" });
        setLoading(false);
        return;
      }
      audioUrl = publicUrl || "";
    }

    const { error } = await NotesService.createNote({
      text, summary: "", audio_url: audioUrl, user_id: user.id,
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save note", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Note saved successfully!" });
      setText(""); clearRecording(); fetchNotes(user.id);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Vocal Notes</h1>
        <p className="mb-4">Please log in to use the note-taking app.</p>
        <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vocal Notes</h1>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/settings')} variant="outline">
            <SettingsIcon className="w-4 h-4 mr-2" /> Settings
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <Textarea placeholder="Type your note or record audio..." value={text} onChange={(e) => setText(e.target.value)} className="min-h-[120px] mb-4" />
        <div className="flex gap-2 mb-4">
          {!isRecording ? (
            <Button onClick={startRecording} variant="outline"><Mic className="w-4 h-4" /> Start Recording</Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive"><Square className="w-4 h-4" /> Stop Recording</Button>
          )}
          {audioBlob && <Button onClick={clearRecording} variant="outline">Clear Recording</Button>}
        </div>

        {audioBlob && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 mb-2">Recording ready to save</p>
            <audio controls src={URL.createObjectURL(audioBlob)} className="w-full" />
          </div>
        )}

        <Button onClick={handleSave} disabled={loading || (!text.trim() && !audioBlob)} className="w-full">
          {loading ? "Saving..." : "Save Note"}
        </Button>
      </div>
    </div>
  );
};

export default Index;
