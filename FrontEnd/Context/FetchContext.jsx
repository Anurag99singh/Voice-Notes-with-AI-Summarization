import { useRef } from "react";
import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";

// const API = "http://localhost:3000/api";
const API = import.meta.env.VITE_API_URL;

const AppContext = createContext();

function FetchContext({ children }) {
  const [notes, setNotes] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [summarizingIds, setSummarizingIds] = useState(new Set());

  async function fetchNotes() {
    try {
      const res = await fetch(`${API}/notes`);
      const data = await res.json();
      if (res.status === 429) throw new Error(data.message);
      setNotes(data);
    } catch (error) {
      alert(error);
    }
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });

    mediaRecorderRef.current = mr;
    chunksRef.current = [];
    mr.ondataavailable = (e) => chunksRef.current.push(e.data);
    mr.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      await uploadAudio(blob);
    };
    mr.start();
    setIsRecording(true);
  }
  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function uploadAudio(blob) {
    setLoading(true);
    const fd = new FormData();
    console.log(fd);
    fd.append("audio", blob, "note.webm");
    const res = await fetch(`${API}/notes`, { method: "POST", body: fd });
    const note = await res.json();
    if (res.status === 429) throw new Error(note.message);
    setNotes((prev) => [note, ...prev]);
    setLoading(false);
  }

  async function handleDelete(id) {
    await fetch(`${API}/notes/${id}`, { method: "DELETE" });
    setNotes((prev) => prev.filter((n) => n._id !== id));
  }

  function startEdit(note) {
    setEditingId(note._id);
    setEditText(note.transcript || "");
  }

  async function saveEdit(id) {
    const res = await fetch(`${API}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: editText }),
    });
    const updated = await res.json();
    // console.log(updated);
    setNotes((prev) => prev.map((n) => (n._id === id ? updated : n)));
    setEditingId(null);
  }

  async function generateSummary(id) {
    try {
      setSummarizingIds((prev) => new Set(prev).add(id));
      const res = await fetch(`${API}/notes/${id}/summarize`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.status === 429) throw new Error(data.message);
      setNotes((prev) =>
        prev.map((n) =>
          n._id === id ? data.note || { ...n, summary: data.summary } : n
        )
      );
    } catch (error) {
      alert(error);
    } finally {
      setSummarizingIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
    }
  }

  function shouldDisableGenerate(note) {
    if (!note.transcript) return true;
    if (!note.summary) return false;
    if (!note.transcriptUpdatedAt) return false;
    return (
      new Date(note.summaryGeneratedAt) >= new Date(note.transcriptUpdatedAt)
    );
  }
  return (
    <AppContext.Provider
      value={{
        notes,
        isRecording,
        startRecording,
        stopRecording,
        editingId,
        editText,
        setEditText,
        saveEdit,
        startEdit,
        handleDelete,
        generateSummary,
        shouldDisableGenerate,
        summarizingIds,
        fetchNotes,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
function useAppContext() {
  let context = useContext(AppContext);
  if (context === undefined)
    throw new Error("context is useed outside of provider");
  return context;
}

export { FetchContext, useAppContext };
