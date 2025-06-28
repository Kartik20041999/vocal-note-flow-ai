import { useEffect, useState, useRef } from "react";
import { NotesService } from "@/services/notesService";
import { AuthService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [text, setText] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  useEffect(() => {
    AuthService.getUser().then((res) => {
      setUser(res);
      fetchNotes(res.id);
    });
  }, []);

  async function fetchNotes(userId: string) {
    const { data } = await NotesService.getNotes(userId);
    if (data) setNotes(data);
  }

  async function handleSave() {
    if (!user) return;

    let audioUrl = "";
    if (audioBlob) {
      audioUrl = URL.createObjectURL(audioBlob);
    }

    const { data, error } = await NotesService.saveNote({
      text,
      audioUrl,
      summary: "",
      userId: user.id
    });

    if (error) {
      toast({ title: "Error saving note!" });
    } else {
      toast({ title: "Note saved successfully!" });
      setNotes([data, ...notes]);
      setText("");
      setAudioBlob(null);
    }
  }

  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        setAudioBlob(event.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    });
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Vocal Note Keeper</h1>

      <textarea
        className="w-full border p-2"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your note here..."
      />

      {isRecording ? (
        <button onClick={stopRecording} className="bg-red-500 text-white p-2 rounded">
          Stop Recording
        </button>
      ) : (
        <button onClick={startRecording} className="bg-green-500 text-white p-2 rounded">
          Start Recording
        </button>
      )}

      <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">
        Save Note
      </button>

      <div className="space-y-2">
        {notes.map((note) => (
          <div key={note.id} className="border p-2">
            <p>{note.text}</p>
            {note.audio_url && (
              <audio controls src={note.audio_url}></audio>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
