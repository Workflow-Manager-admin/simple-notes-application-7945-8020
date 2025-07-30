import React, { useState, useEffect } from "react";
import "./App.css";

// Storage Key for Notes in localStorage
const STORAGE_KEY = "notes_simple_app_data";

// PUBLIC_INTERFACE
function App() {
  /**
   * Main App entry point for Simple Notes.
   * Features: Create, List, View, Edit, Delete notes.
   * Minimal UI with sidebar for navigation and light theme.
   */
  const [theme] = useState("light"); // permanently light theme as required
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editorData, setEditorData] = useState({ title: "", content: "" });

  // -- Load notes from localStorage (for demo purposes) --
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    if (savedNotes) setNotes(JSON.parse(savedNotes));
  }, [theme]);

  // -- Save notes to localStorage whenever notes change --
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // PUBLIC_INTERFACE
  function openNewNoteModal() {
    setEditorData({ title: "", content: "" });
    setIsEditing(false);
    setShowEditor(true);
  }

  // PUBLIC_INTERFACE
  function openEditNoteModal() {
    if (!selectedNoteId) return;
    const note = notes.find((n) => n.id === selectedNoteId);
    if (!note) return;
    setEditorData({ title: note.title, content: note.content });
    setIsEditing(true);
    setShowEditor(true);
  }

  // PUBLIC_INTERFACE
  function handleEditorChange(e) {
    const { name, value } = e.target;
    setEditorData((prev) => ({ ...prev, [name]: value }));
  }

  // PUBLIC_INTERFACE
  function handleEditorSubmit(e) {
    e.preventDefault();
    if (isEditing) {
      // Edit existing
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNoteId
            ? { ...n, ...editorData, updatedAt: new Date().toISOString() }
            : n
        )
      );
    } else {
      // Create new
      const newNote = {
        id: Date.now().toString(),
        title: editorData.title || "Untitled Note",
        content: editorData.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
    }
    setShowEditor(false);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    if (window.confirm("Delete this note?")) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNoteId === id) setSelectedNoteId(null);
      setShowEditor(false);
    }
  }

  // PUBLIC_INTERFACE
  function handleSelectNote(id) {
    setSelectedNoteId(id);
    setShowEditor(false);
  }

  // PUBLIC_INTERFACE
  function handleCloseEditor() {
    setShowEditor(false);
    setEditorData({ title: "", content: "" });
  }

  // Layout split: sidebar and main area
  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  // Responsive: auto-hide sidebar on mobile when opening notes
  useEffect(() => {
    function onResize() {
      if (window.innerWidth < 600) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    }
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="notes-app-shell">
      {/* Sidebar */}
      <aside className={`sidebar${isSidebarOpen ? "" : " collapsed"}`}>
        <div className="sidebar-header">
          <h1>
            <span className="brand-accent">●</span> Notes
          </h1>
          <button
            className="sidebar-toggle"
            aria-label="Toggle sidebar"
            onClick={() => setIsSidebarOpen((v) => !v)}
          >
            {isSidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        {isSidebarOpen && (
          <div className="sidebar-content">
            <button className="sidebar-btn-create" onClick={openNewNoteModal}>
              ＋ New Note
            </button>
            <ul className="notes-list">
              {notes.length === 0 && (
                <li className="notes-list-empty">No notes yet.</li>
              )}
              {notes.map((note) => (
                <li
                  key={note.id}
                  className={`notes-list-item${note.id === selectedNoteId ? " selected" : ""
                    }`}
                  onClick={() => handleSelectNote(note.id)}
                >
                  <div className="list-title">{note.title || "Untitled"}</div>
                  <div className="list-date">
                    {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
      {/* Main area */}
      <main className="main-content">
        {/* Topbar for mobile: Add new note button */}
        <div className="topbar-mobile">
          <button
            className="sidebar-toggle-mobile"
            onClick={() => setIsSidebarOpen((v) => !v)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <button className="btn btn-main" onClick={openNewNoteModal}>
            ＋ New Note
          </button>
        </div>
        {/* Note view or placeholder */}
        {!selectedNote ? (
          <div className="placeholder">
            <h2>Welcome to Notes!</h2>
            <p className="placeholder-secondary">
              Select a note from the left or create a new note to get started.
            </p>
          </div>
        ) : (
          <div className="note-detail-view">
            <div className="note-detail-header">
              <h2>{selectedNote.title || "Untitled"}</h2>
              <div className="note-detail-actions">
                <button
                  className="btn btn-accent"
                  onClick={openEditNoteModal}
                  title="Edit note"
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  title="Delete note"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
            <div className="note-detail-meta">
              <span>
                Created:{" "}
                {new Date(selectedNote.createdAt).toLocaleString()}
              </span>
              &nbsp;|&nbsp;
              <span>
                Updated:{" "}
                {new Date(selectedNote.updatedAt).toLocaleString()}
              </span>
            </div>
            <div className="note-detail-content">
              <pre>{selectedNote.content || <em>(No content)</em>}</pre>
            </div>
          </div>
        )}
      </main>
      {/* Editor Modal */}
      {showEditor && (
        <div className="modal-overlay" onClick={handleCloseEditor}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2>{isEditing ? "Edit Note" : "New Note"}</h2>
            <form onSubmit={handleEditorSubmit} className="editor-form">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={editorData.title}
                onChange={handleEditorChange}
                className="editor-title"
                maxLength={100}
                autoFocus
                autoComplete="off"
              />
              <textarea
                name="content"
                placeholder="Note content..."
                value={editorData.content}
                onChange={handleEditorChange}
                rows={8}
                className="editor-content"
                maxLength={2000}
              />
              <div className="editor-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseEditor}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-main">
                  {isEditing ? "Save Changes" : "Create Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
