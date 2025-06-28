
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { NotesService, Note } from '@/services/notesService';
import { useToast } from '@/hooks/use-toast';

const Notes = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await NotesService.getAllNotes();
      
      if (error) {
        toast({
          title: "Failed to load notes",
          description: "There was an error loading your notes.",
          variant: "destructive",
        });
        console.error('Error loading notes:', error);
      } else {
        setNotes(data || []);
      }
    } catch (error) {
      toast({
        title: "Load error",
        description: "An unexpected error occurred while loading notes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    setDeletingIds(prev => new Set(prev).add(id));
    
    try {
      const { error } = await NotesService.deleteNote(id);
      
      if (error) {
        toast({
          title: "Failed to delete note",
          description: "There was an error deleting the note.",
          variant: "destructive",
        });
      } else {
        setNotes(prev => prev.filter(note => note.id !== id));
        toast({
          title: "Note deleted",
          description: "The note has been successfully deleted.",
        });
      }
    } catch (error) {
      toast({
        title: "Delete error",
        description: "An unexpected error occurred while deleting.",
        variant: "destructive",
      });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPreview = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center mb-6 pt-4">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="sm"
            className="mr-3 hover:bg-white/50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Your Notes</h1>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8">
                <p className="text-gray-500 text-lg">No notes yet</p>
                <p className="text-gray-400 mt-2">Start recording to create your first note!</p>
                <Button
                  onClick={() => navigate('/')}
                  className="mt-4 bg-blue-500 hover:bg-blue-600"
                >
                  Create Note
                </Button>
              </div>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-2">
                      {formatTimestamp(note.created_at)}
                    </div>
                    <div className="text-gray-800 leading-relaxed">
                      {note.text}
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteNote(note.id)}
                    disabled={deletingIds.has(note.id)}
                    variant="ghost"
                    size="sm"
                    className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingIds.has(note.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Notes;
