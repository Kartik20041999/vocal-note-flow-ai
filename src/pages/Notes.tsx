
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Note {
  id: string;
  timestamp: string;
  text: string;
  preview: string;
}

const Notes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);

  // Mock data - TODO: Replace with Supabase data
  useEffect(() => {
    const mockNotes: Note[] = [
      {
        id: '1',
        timestamp: '2024-06-28 10:30 AM',
        text: 'Remember to buy groceries for the weekend. Need milk, bread, eggs, and some fresh vegetables for the salad.',
        preview: 'Remember to buy groceries for the weekend...'
      },
      {
        id: '2',
        timestamp: '2024-06-28 09:15 AM',
        text: 'Meeting notes from the project review. Discussed timeline, budget allocation, and team responsibilities.',
        preview: 'Meeting notes from the project review...'
      },
      {
        id: '3',
        timestamp: '2024-06-27 04:45 PM',
        text: 'Idea for the new mobile app feature. Voice-to-text functionality with AI enhancement for better accuracy.',
        preview: 'Idea for the new mobile app feature...'
      }
    ];
    setNotes(mockNotes);
  }, []);

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    // TODO: Delete from Supabase
    console.log('Deleting note:', id);
  };

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
                      {note.timestamp}
                    </div>
                    <div className="text-gray-800 leading-relaxed">
                      {note.text}
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteNote(note.id)}
                    variant="ghost"
                    size="sm"
                    className="ml-4 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
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
