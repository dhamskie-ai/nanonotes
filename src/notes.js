// ---------------------------------------------------------------------------
// Local notes store. Pure functions over a storage-like object
// ({ getItem, setItem }) so they can be unit-tested in Node without a DOM.
// In the browser the storage is window.localStorage.
// ---------------------------------------------------------------------------

export const STORAGE_KEY = "nanonotes.notes.v1";

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "note-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

export function loadNotes(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveNotes(storage, notes) {
  storage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function createNote(notes, { title = "", body = "" } = {}) {
  const now = Date.now();
  const note = {
    id: newId(),
    title: title.trim(),
    body,
    tags: [],
    summary: null,
    createdAt: now,
    updatedAt: now,
  };
  return { note, notes: [note, ...notes] };
}

export function updateNote(notes, id, patch) {
  return notes.map((n) =>
    n.id === id ? { ...n, ...patch, updatedAt: Date.now() } : n,
  );
}

export function deleteNote(notes, id) {
  return notes.filter((n) => n.id !== id);
}

export function searchNotes(notes, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return notes;
  return notes.filter(
    (n) =>
      (n.title || "").toLowerCase().includes(q) ||
      (n.body || "").toLowerCase().includes(q) ||
      (n.tags || []).some((t) => t.toLowerCase().includes(q)),
  );
}

export function displayTitle(note) {
  if (note.title) return note.title;
  const firstLine = (note.body || "").split("\n").find((l) => l.trim() !== "");
  if (firstLine) return firstLine.trim().slice(0, 60);
  return "Untitled note";
}

export function seedNotes() {
  const now = Date.now();
  return [
    {
      id: newId(),
      title: "Welcome to NanoNotes",
      body: "NanoNotes keeps your short notes on this device and lets AI summarize and organize them.\n\nTry it: press “Summarize with AI” on this note. On Chrome desktop it runs on-device with Gemini Nano when available; otherwise it falls back to a cloud model via Firebase AI Logic.\n\nYour notes are stored locally in this browser — nothing is uploaded unless you use an AI action.",
      tags: ["welcome"],
      summary: null,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId(),
      title: "Grocery list",
      body: "Rice, eggs, cooking oil, coffee, oat milk, bananas, chicken breast, spinach, tomatoes, bread. Budget around Rp 150.000. Market opens at 7am on Saturday.",
      tags: [],
      summary: null,
      createdAt: now - 1000,
      updatedAt: now - 1000,
    },
    {
      id: newId(),
      title: "Hackathon idea",
      body: "Build a web app for short notes with AI summaries. Use Firebase AI Logic hybrid inference: Gemini Nano on-device in Chrome when available, cloud fallback otherwise. Submit before 1 Dec 2026. Demo video max 3 minutes.",
      tags: ["hackathon"],
      summary: null,
      createdAt: now - 2000,
      updatedAt: now - 2000,
    },
  ];
}
