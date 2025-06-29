// pages/Index.tsx
import React, { useEffect, useState } from 'react';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { AudioService } from '@/services/audioService';
import { NotesService } from '@/services/notesService';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/hooks/useSettings';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Mic, Square } from 'lucide-react';

export default function Index() {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const { settings } = useSettings();
  const toast = useToast();
  const { isRecording, audioBlob, startRecording, stopRecording } = useVoiceRecording();

  useEffect(()=>{
    supabase.auth.getUser().then(r=>{
      if (!r.data.user) return;
      setUser(r.data.user);
      refreshNotes(r.data.user.id);
    });
    supabase.auth.onAuthStateChange((_e, s)=> {
      if (s?.user) { setUser(s.user); refreshNotes(s.user.id); }
    });
  }, []);

  const refreshNotes = (uid) =>
    NotesService.fetchNotes(uid).then(({data})=>setNotes(data||[]));

  const handleSave = async () => {
    if (!audioBlob || !user) return;
    const { publicUrl, error: upErr } = await AudioService.uploadAudio(user.id, audioBlob);
    if (upErr) return toast.toast({ title: 'Upload failed', variant: 'destructive' });
    const { text, error: tErr } = await AudioService.transcribe(publicUrl, settings);
    if (tErr) return toast.toast({ title: 'Transcription failed', variant: 'destructive' });

    let summary = '';
    if (settings.enableSummary && settings.provider==='openai' && settings.openaiKey) {
      const { summary: s, error: sErr } = await AIService.summary(text, settings.openaiKey);
      if (sErr) return toast.toast({ title: 'Summary failed', variant: 'destructive' });
      summary = s;
    }

    NotesService.createNote({
      text, summary, audio_url: publicUrl, user_id: user.id,
    }).then(({error}) => {
      if (error) toast.toast({title:'Save failed', variant:'destructive'});
      else { toast.toast({title:'Saved'}); refreshNotes(user.id); }
    });
  };

  return (
    <div>
      <h1>Record and Save Note</h1>
      {!isRecording ? (
        <Button onClick={startRecording}><Mic/> Start Recording</Button>
      ) : (
        <Button onClick={stopRecording}><Square/> Stop Recording</Button>
      )}

      {audioBlob && (
        <>
          <audio controls src={URL.createObjectURL(audioBlob)}/>
          <Button onClick={handleSave}>Save Note</Button>
        </>
      )}

      <h2>Saved Notes</h2>
      {notes.length===0 ? <p>No notes yet.</p> : notes.map(n=>(
        <div key={n.id}>
          <audio controls src={n.audio_url}/>
          <p>{n.text}</p>
          {n.summary && <small>Summary: {n.summary}</small>}
        </div>
      ))}
    </div>
  );
}
