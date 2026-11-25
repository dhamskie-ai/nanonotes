# NanoNotes — Demo Video Script (≤ 3 minutes)

Target length: **~2:45**. Record in Chrome on desktop, 1080p, with the app
open at `http://localhost:5173` (or the deployed URL). Narration in English.
Show only features that really work — no staged results.

## 0:00–0:20 — Hook + what it is

**On screen:** NanoNotes open, notes list on the left, a note in the editor.

**Narration:**
> "Meet NanoNotes — a web app for short notes, with AI that summarizes and
> organizes them for you. It runs on-device with Gemini Nano in Chrome when
> it can, and falls back to the cloud when it can't — that's Firebase AI
> Logic hybrid inference."

## 0:20–1:00 — Write a note

**On screen:** Click "+ New note". Type a title and a few sentences — e.g.
a messy meeting note about the hackathon: deadlines, the demo video, the
quota account arriving Friday.

**Narration:**
> "Notes are just notes. Type, and everything is saved locally in your
> browser — nothing is uploaded. You can search them, and the list updates
> as you type."

## 1:00–2:00 — Summarize with AI

**On screen:** Click "✦ Summarize with AI" on the messy note. Wait for the
real result, then show the summary box. Point at the label under it.

**Narration:**
> "Now the AI part. One click, and Firebase AI Logic summarizes the note.
> On this Chrome it prefers the on-device Gemini Nano model — private and
> fast — and if Nano isn't available, the same call falls back to a cloud
> Gemini model. No separate code paths, no fake summaries."

*(If the on-device model isn't downloaded in the recording Chrome, say
"falling back to the cloud model" honestly while the request runs.)*

## 2:00–2:30 — Suggest tags

**On screen:** Click "✦ Suggest tags". Tags appear as chips and in the list.

**Narration:**
> "Same idea for organizing: suggest tags, and they show up on the note
> and in the list, so related notes are easy to find later."

## 2:30–2:45 — Close

**On screen:** Back to the notes list; footer visible.

**Narration:**
> "NanoNotes — short notes, summarized by AI, on your device when possible.
> Built with Firebase AI Logic for #BuildHybridAI. Try it — the code is on
> GitHub."

---

## Recording notes

- Do a dry run first so the on-device model (if used) is already downloaded.
- If Firebase is not configured in the recording build, the AI buttons show
  a setup message — do NOT record that as a "demo" of AI. Configure Firebase
  first (README → Setup), then record.
- Keep the narration at a natural pace; total must stay under 3:00.
