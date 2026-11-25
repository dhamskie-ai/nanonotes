// Unit tests for the notes store (pure functions, no DOM).
// Run with: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEY,
  loadNotes,
  saveNotes,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  displayTitle,
  seedNotes,
} from "../src/notes.js";

function memoryStorage() {
  const store = new Map();
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, v),
  };
}

test("create + load + save round-trip", () => {
  const storage = memoryStorage();
  const { note, notes } = createNote([], { title: "Hello", body: "World" });
  assert.equal(notes.length, 1);
  assert.equal(note.title, "Hello");
  assert.equal(note.body, "World");
  assert.deepEqual(note.tags, []);
  assert.equal(note.summary, null);
  saveNotes(storage, notes);
  const loaded = loadNotes(storage);
  assert.equal(loaded.length, 1);
  assert.equal(loaded[0].id, note.id);
});

test("create prepends and trims the title", () => {
  const { notes } = createNote([{ id: "old", title: "Old", body: "", tags: [], summary: null, createdAt: 0, updatedAt: 0 }], {
    title: "  New  ",
    body: "b",
  });
  assert.equal(notes.length, 2);
  assert.equal(notes[0].title, "New");
  assert.equal(notes[1].id, "old");
});

test("update changes only the target note", () => {
  const a = { id: "a", title: "A", body: "", tags: [], summary: null, createdAt: 1, updatedAt: 1 };
  const b = { id: "b", title: "B", body: "", tags: [], summary: null, createdAt: 1, updatedAt: 1 };
  const updated = updateNote([a, b], "b", { body: "new body", summary: "sum" });
  assert.equal(updated[0].body, "");
  assert.equal(updated[1].body, "new body");
  assert.equal(updated[1].summary, "sum");
  assert.equal(updated[1].title, "B");
});

test("delete removes only the target note", () => {
  const a = { id: "a", title: "A", body: "", tags: [], summary: null, createdAt: 1, updatedAt: 1 };
  const b = { id: "b", title: "B", body: "", tags: [], summary: null, createdAt: 1, updatedAt: 1 };
  assert.deepEqual(deleteNote([a, b], "a").map((n) => n.id), ["b"]);
  assert.equal(deleteNote([a, b], "zzz").length, 2);
});

test("search matches title, body and tags (case-insensitive)", () => {
  const notes = [
    { id: "1", title: "Grocery", body: "buy rice", tags: [], summary: null, createdAt: 1, updatedAt: 1 },
    { id: "2", title: "Ideas", body: "build a rocket", tags: ["space"], summary: null, createdAt: 1, updatedAt: 1 },
  ];
  assert.deepEqual(searchNotes(notes, "rice").map((n) => n.id), ["1"]);
  assert.deepEqual(searchNotes(notes, "SPACE").map((n) => n.id), ["2"]);
  assert.deepEqual(searchNotes(notes, "").map((n) => n.id), ["1", "2"]);
  assert.deepEqual(searchNotes(notes, "nope"), []);
});

test("displayTitle falls back to first body line, then Untitled", () => {
  assert.equal(displayTitle({ title: "T", body: "b" }), "T");
  assert.equal(displayTitle({ title: "", body: "\n  First line here\nsecond" }), "First line here");
  assert.equal(displayTitle({ title: "", body: "" }), "Untitled note");
});

test("loadNotes tolerates missing and corrupt data", () => {
  const storage = memoryStorage();
  assert.deepEqual(loadNotes(storage), []);
  storage.setItem(STORAGE_KEY, "not json{");
  assert.deepEqual(loadNotes(storage), []);
  storage.setItem(STORAGE_KEY, JSON.stringify({ not: "an array" }));
  assert.deepEqual(loadNotes(storage), []);
});

test("seedNotes returns 3 usable sample notes", () => {
  const seeds = seedNotes();
  assert.equal(seeds.length, 3);
  for (const n of seeds) {
    assert.ok(n.id);
    assert.ok(n.title);
    assert.ok(n.body.length > 10);
  }
});
