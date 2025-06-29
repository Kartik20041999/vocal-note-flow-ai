import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Edit, Play, Pause, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { NotesService, type Note } from '@/services/notesService';
import { useToast } from '@/hooks/use-toast';

const Notes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    const { data, error } = await NotesService.getAllNotes();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load notes.",
        variant: "destructive",
      });
    } else {
      setNotes(data || []);
    }
    setLoading(false);
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await NotesService.deleteNote(id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete note.",
        variant: "destructive",
      });
    } else {
      setNotes(notes.filter(note => note.id !== id));
      toast({
        title: "Success",
        description: "Note deleted successfully.",
      });
    }
  };

  const toggleAudio = (noteId: string, audioUrl?: string | null) => {
    if (!audioUrl) return;

    if (playingAudio === noteId) {
      // Pause current audio
      audioElements[noteId]?.pause();
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio && audioElements[playingAudio]) {
        audioElements[playingAudio].pause();
      }

      // Create or get audio element
      let audio = audioElements[noteId];
      if (!audio) {
        audio = new Audio(audioUrl);
        audio.onended = () => setPlayingAudio(null);
        setAudioElements(prev => ({ ...prev, [noteId]: audio }));
      }

      audio.play();
      setPlayingAudio(noteId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center mb-6 pt-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="mr-3 hover:bg-white/50 dark:hover:bg-gray-700/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">My Notes</h1>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No notes yet</p>
            <Button
              onClick={() => navigate('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Create Your First Note
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Date and Time */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(note.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(note.created_at)}
                      </div>
                    </div>

                    {/* Summary (if available) */}
                    {note.summary && (
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                          AI Summary
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm bg-blue-50 dark:bg-blue-900/20 rounded p-2">
                          {note.summary}
                        </p>
                      </div>
                    )}

                    {/* Transcription Preview */}
                    <div className="mb-4">
                      <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                        {note.text.length > 200 ? `${note.text.substring(0, 200)}...` : note.text}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Audio Play Button */}
                    {note.audio_url && (
                      <Button
                        onClick={() => toggleAudio(note.id, note.audio_url)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        {playingAudio === note.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">
                          {playingAudio === note.id ? 'Pause' : 'Play'}
                        </span>
                      </Button>
                    )}

                    {/* View Full Text Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 sm:mr-1" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Note Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="text-sm text-gray-500">
                            {formatDate(note.created_at)} at {formatTime(note.created_at)}
                          </div>
                          
                          {note.summary && (
                            <div>
                              <h4 className="font-medium text-blue-600 mb-2">AI Summary</h4>
                              <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                                <p className="text-gray-700 dark:text-gray-300">{note.summary}</p>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="font-medium text-gray-800 dark:text-white mb-2">Full Transcription</h4>
                            <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 max-h-60 overflow-y-auto">
                              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {note.text}
                              </p>
                            </div>
                          </div>

                          {note.audio_url && (
                            <div className="flex justify-center">
                              <Button
                                onClick={() => toggleAudio(note.id, note.audio_url)}
                                className="flex items-center gap-2"
                              >
                                {playingAudio === note.id ? (
                                  <>
                                    <Pause className="w-4 h-4" />
                                    Pause Audio
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4" />
                                    Play Audio
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Delete Button */}
                    <Button
                      onClick={() => handleDeleteNote(note.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline sm:ml-1">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
