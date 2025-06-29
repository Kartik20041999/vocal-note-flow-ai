import { useEffect, useState } from "react";
import { NotesService } from "@/services/notesService";
import { AudioService } from "@/services/audioService";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [notes, setNotes] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [recording, setRecording] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);

  const user = supabase.auth.user();

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    const { data } = await NotesService.fetchNotes(user.id);
    setNotes(data || []);
  };

  const handleSave = async () => {
    setLoading(true);

    let audioUrl = "";

    if (recording) {
      const { publicUrl, error } = await AudioService.uploadAudio(user.id, recording);
      if (error) return alert("Audio upload failed");
      audioUrl = publicUrl;
    }

    const { error } = await NotesService.createNote({
      text,
      summary: "",
      audio_url: audioUrl,
      user_id: user.id,
    });

    if (error) return alert("Failed to save note");

    setText("");
    setRecording(null);
    fetchNotes();
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1>Vocal Notes</h1>
      <textarea
        placeholder="Type your note..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border w-full p-2"
      />
      <button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Note"}
      </button>

      <h2 className="mt-6">Your Notes</h2>
      {notes.map((note) => (
        <div key={note.id} className="border p-4 my-2">
          <p>{note.text}</p>
          {note.audio_url && (
            <audio controls src={note.audio_url} className="mt-2" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Index;
