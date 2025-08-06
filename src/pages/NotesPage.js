import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../api';
import { useAuth } from '../contexts/AuthContext';

const NotesPage = () => {
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [versions, setVersions] = useState([]);
  const [isNewNote, setIsNewNote] = useState(true);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (user?._id) fetchNotes();
  }, [user?._id]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notes?userId=${user._id}`, { headers });
      setNotes(res.data);
    } catch (err) {
      console.error('❌ Failed to fetch notes:', err);
    }
  };

  const fetchNoteDetails = async (note) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notes/${note._id}`, { headers });
      const versionRes = await axios.get(`${API_BASE_URL}/notes/${note._id}/versions`, { headers });

      setSelectedNote(note);
      setNoteTitle(note.title);
      setNoteContent(res.data.versions?.[0]?.content || '');
      setVersions(versionRes.data);
      setIsNewNote(false);
    } catch (err) {
      console.error('❌ Failed to fetch note details:', err);
    }
  };

  const handleCreateNote = async () => {
    if (!user || !user._id) {
      console.error("❌ Cannot create note: user is undefined or not logged in.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/notes`, {
        title: noteTitle,
        content: noteContent,
        userId: user._id
      }, { headers });

      setNotes([...notes, res.data]);
      resetEditor();
    } catch (err) {
      console.error('❌ Failed to create note:', err);
    }
  };

  const handleUpdateNote = async () => {
    try {
      await axios.put(`${API_BASE_URL}/notes/${selectedNote._id}`, { content: noteContent }, { headers });
      alert('✅ Version saved successfully.');
      fetchNotes();
      fetchNoteDetails(selectedNote);
    } catch (err) {
      console.error('❌ Failed to update note:', err);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedNote.title}"?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE_URL}/notes/${selectedNote._id}`, { headers });
      alert('🗑️ Note deleted successfully.');
      resetEditor();
      fetchNotes();
    } catch (err) {
      console.error('❌ Failed to delete note:', err);
      alert('Failed to delete the note.');
    }
  };

  const handleDownload = async (type = 'latest') => {
    try {
      const url = type === 'latest'
        ? `${API_BASE_URL}/notes/${selectedNote._id}/download`
        : `${API_BASE_URL}/notes/${selectedNote._id}/download/all`;

      const res = await axios.get(url, { headers, responseType: 'blob' });

      const blob = new Blob([res.data], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = type === 'latest'
        ? `${selectedNote.title}.txt`
        : `${selectedNote.title}_all_versions.txt`;
      link.click();
    } catch (err) {
      console.error('❌ Failed to download file:', err);
    }
  };

  const resetEditor = () => {
    setSelectedNote(null);
    setNoteTitle('');
    setNoteContent('');
    setVersions([]);
    setIsNewNote(true);
  };

  return (
    <div className="main-content p-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="text-2xl fw-bold mb-4">📝 Notes</h1>

      {/* Notes List */}
      <div className="mb-4 card-custom p-3">
        <h2 className="fw-semibold mb-2">Your Notes</h2>
        <ul className="list-unstyled">
          {notes.map((note) => (
            <li
              key={note._id}
              onClick={() => fetchNoteDetails(note)}
              style={{ cursor: 'pointer', color: 'var(--primary)', marginBottom: '6px' }}
            >
              {note.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Editor */}
      <div className="mb-4 card-custom p-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          className="form-control-custom"
          placeholder="Note Title"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          disabled={!isNewNote}
        />
        <textarea
          className="form-control-custom"
          rows={8}
          placeholder="Write your note here..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
        />

        {isNewNote ? (
          <button onClick={handleCreateNote} className="btn-success-custom">
            ➕ Create Note
          </button>
        ) : (
          <>
            <button onClick={handleUpdateNote} className="btn-primary-custom">
              💾 Save Version
            </button>
            <button onClick={() => handleDownload('latest')} className="btn-info-custom">
              ⬇️ Download Latest
            </button>
            <button onClick={() => handleDownload('all')} className="btn-secondary-custom">
              ⬇️ Download All Versions
            </button>
            <button onClick={handleDeleteNote} className="btn-danger-custom">
              🗑️ Delete Note
            </button>
            <button onClick={resetEditor} className="btn-danger-custom">
              🔙 Back to New Note
            </button>
          </>
        )}
      </div>

      {/* Version History */}
      {!isNewNote && versions.length > 1 && (
        <div className="card-custom p-4 mb-4">
          <h2 className="fw-semibold mb-3">📜 Version History</h2>
          <ul className="list-unstyled">
            {versions
              .slice()
              .reverse()
              .map((ver, idx) => (
                <li key={idx} className="mb-2">
                  <div className="font-monospace">{ver.content.slice(0, 60)}...</div>
                  <div className="text-muted small">{new Date(ver.createdAt).toLocaleString()}</div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
