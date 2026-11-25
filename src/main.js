import "./style.css";
import {
  loadNotes,
  saveNotes,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  displayTitle,
  seedNotes,
} from "./notes.js";
import {
  summarizeNote,
  suggestTags,
  aiStatus,
  friendlyErrorMessage,
} from "./ai.js";

const $ = (id) => document.getElementById(id);

const els = {
  aiStatus: $("ai-status"),
  newNoteBtn: $("new-note-btn"),
  emptyNewNoteBtn: $("empty-new-note-btn"),
  searchInput: $("search-input"),
  notesList: $("notes-list"),
  emptyState: $("empty-state"),
  editorPane: $("editor-pane"),
  noteTitle: $("note-title"),
  noteBody: $("note-body"),
  tagsRow: $("tags-row"),
  tagsList: $("tags-list"),
  summarizeBtn: $("summarize-btn"),
  tagsBtn: $("tags-btn"),
  aiHint: $("ai-hint"),
  summaryBox: $("summary-box"),
  summaryText: $("summary-text"),
  summaryMeta: $("summary-meta"),
  summaryClearBtn: $("summary-clear-btn"),
  aiError: $("ai-error"),
  saveState: $("save-state"),
  deleteNoteBtn: $("delete-note-btn"),
};

let notes = loadNotes(window.localStorage);
if (notes.length === 0) {
  notes = seedNotes();
  saveNotes(window.localStorage, notes);
}
let selectedId = notes[0] ? notes[0].id : null;
let saveTimer = null;

function persist() {
  saveNotes(window.localStorage, notes);
  els.saveState.textContent =
    "Saved locally · " + new Date().toLocaleTimeString();
}

function renderList() {
  const query = els.searchInput.value;
  const visible = searchNotes(notes, query);
  els.notesList.innerHTML = "";
  if (visible.length === 0) {
    const li = document.createElement("li");
    li.className = "notes-empty";
    li.textContent = query
      ? "No notes match your search."
      : "No notes yet. Create one!";
    els.notesList.appendChild(li);
    return;
  }
  for (const note of visible) {
    const li = document.createElement("li");
    if (note.id === selectedId) li.classList.add("active");
    const title = document.createElement("p");
    title.className = "note-item-title";
    title.textContent = displayTitle(note);
    const preview = document.createElement("p");
    preview.className = "note-item-preview";
    preview.textContent = (note.body || "").replace(/\s+/g, " ").slice(0, 80);
    li.appendChild(title);
    li.appendChild(preview);
    if (note.tags && note.tags.length > 0) {
      const tags = document.createElement("p");
      tags.className = "note-item-tags";
      tags.textContent = note.tags.map((t) => "#" + t).join(" ");
      li.appendChild(tags);
    }
    li.addEventListener("click", () => selectNote(note.id));
    els.notesList.appendChild(li);
  }
}

function renderEditor() {
  const note = notes.find((n) => n.id === selectedId);
  if (!note) {
    els.emptyState.hidden = false;
    els.editorPane.hidden = true;
    return;
  }
  els.emptyState.hidden = true;
  els.editorPane.hidden = false;
  if (document.activeElement !== els.noteTitle) els.noteTitle.value = note.title || "";
  if (document.activeElement !== els.noteBody) els.noteBody.value = note.body || "";

  if (note.tags && note.tags.length > 0) {
    els.tagsRow.hidden = false;
    els.tagsList.innerHTML = "";
    for (const tag of note.tags) {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.textContent = "#" + tag;
      els.tagsList.appendChild(chip);
    }
  } else {
    els.tagsRow.hidden = true;
  }

  if (note.summary) {
    els.summaryBox.hidden = false;
    els.summaryText.textContent = note.summary;
    els.summaryMeta.textContent = "Saved with this note";
  } else {
    els.summaryBox.hidden = true;
    els.summaryText.textContent = "";
  }
  hideError();
}

function renderAiStatus() {
  const status = aiStatus();
  if (!status.configured) {
    els.aiStatus.textContent = "AI: not configured — see README";
    els.aiStatus.className = "status-pill status-warn";
    els.aiHint.textContent =
      "AI actions need a Firebase project. Add your config to src/firebase-config.js (README → Setup). Notes still work fully without it.";
  } else {
    els.aiStatus.textContent = "AI: ready · Firebase AI Logic (hybrid)";
    els.aiStatus.className = "status-pill status-ok";
    els.aiHint.textContent = status.looksLikeChromeDesktop
      ? "Hybrid inference: on-device Gemini Nano in Chrome when available, cloud fallback otherwise."
      : "Hybrid inference: on-device Gemini Nano needs Chrome on desktop; other browsers use the cloud model.";
  }
}

function showError(message) {
  els.aiError.textContent = message;
  els.aiError.hidden = false;
}

function hideError() {
  els.aiError.hidden = true;
  els.aiError.textContent = "";
}

function selectNote(id) {
  selectedId = id;
  renderList();
  renderEditor();
}

function createNewNote() {
  const { note, notes: updated } = createNote(notes, { title: "", body: "" });
  notes = updated;
  persist();
  selectNote(note.id);
  els.noteTitle.focus();
}

function scheduleSave(patch) {
  els.saveState.textContent = "Saving…";
  clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    notes = updateNote(notes, selectedId, patch);
    persist();
    renderList();
  }, 400);
}

els.noteTitle.addEventListener("input", () => {
  scheduleSave({ title: els.noteTitle.value });
});
els.noteBody.addEventListener("input", () => {
  scheduleSave({ body: els.noteBody.value });
});
els.searchInput.addEventListener("input", renderList);
els.newNoteBtn.addEventListener("click", createNewNote);
els.emptyNewNoteBtn.addEventListener("click", createNewNote);

els.deleteNoteBtn.addEventListener("click", () => {
  const note = notes.find((n) => n.id === selectedId);
  if (!note) return;
  if (!window.confirm(`Delete "${displayTitle(note)}"?`)) return;
  notes = deleteNote(notes, selectedId);
  selectedId = notes[0] ? notes[0].id : null;
  persist();
  renderList();
  renderEditor();
});

els.summarizeBtn.addEventListener("click", async () => {
  const note = notes.find((n) => n.id === selectedId);
  if (!note || !note.body.trim()) {
    showError("Write something in the note first — there is nothing to summarize yet.");
    return;
  }
  els.summarizeBtn.disabled = true;
  els.tagsBtn.disabled = true;
  els.summarizeBtn.textContent = "✦ Summarizing…";
  hideError();
  try {
    const summary = await summarizeNote(note.body);
    notes = updateNote(notes, selectedId, { summary });
    persist();
    renderEditor();
    els.summaryMeta.textContent =
      "Firebase AI Logic · hybrid (on-device Gemini Nano when available, cloud fallback)";
  } catch (err) {
    showError(friendlyErrorMessage(err));
  } finally {
    els.summarizeBtn.disabled = false;
    els.tagsBtn.disabled = false;
    els.summarizeBtn.textContent = "✦ Summarize with AI";
  }
});

els.tagsBtn.addEventListener("click", async () => {
  const note = notes.find((n) => n.id === selectedId);
  if (!note || !note.body.trim()) {
    showError("Write something in the note first — there is nothing to tag yet.");
    return;
  }
  els.summarizeBtn.disabled = true;
  els.tagsBtn.disabled = true;
  els.tagsBtn.textContent = "✦ Suggesting…";
  hideError();
  try {
    const tags = await suggestTags(note.body);
    if (tags.length === 0) {
      showError("The AI returned no tags for this note.");
      return;
    }
    notes = updateNote(notes, selectedId, { tags });
    persist();
    renderList();
    renderEditor();
  } catch (err) {
    showError(friendlyErrorMessage(err));
  } finally {
    els.summarizeBtn.disabled = false;
    els.tagsBtn.disabled = false;
    els.tagsBtn.textContent = "✦ Suggest tags";
  }
});

els.summaryClearBtn.addEventListener("click", () => {
  notes = updateNote(notes, selectedId, { summary: null });
  persist();
  renderEditor();
});

renderAiStatus();
renderList();
renderEditor();
