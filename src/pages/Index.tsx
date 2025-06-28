import { useState } from "react";
import { NotesService } from "@/services/notesService";
import { useToast } from "@/hooks/use-toast";

interface IndexProps {
  user: { id: string; email: string };
}

const Index = ({ user }: IndexProps) => {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const saveNote = async () => {
    if (!text) return;

    setSaving(true);
    try {
      await NotesService.saveNote({
        text,
        user_id: user.id,
        summary: "",
        audio_url: "",
      });
      toast({ title: "Note saved successfully!" });
      setText("");
    } catch (error) {
      console.error(error);
      toast({ title: "Error saving note" });
    }
    setSaving(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Welcome, {user.email}</h1>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your note here..."
        className="w-full p-2 border mb-4"
      />
      <button
        onClick={saveNote}
        disabled={saving}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {saving ? "Saving..." : "Save Note"}
      </button>
    </div>
  );
};

export default Index;
