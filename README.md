# NanoNotes — AI Web Notes with Firebase AI Logic

NanoNotes is a simple web app for writing short notes, then summarizing and
organizing them with AI. It was built for the **#BuildHybridAI 2026**
hackathon (Web track, Google/Firebase, $30,000 prize pool).

**Live demo:** run it locally (below) — no account or server needed for the
notes themselves. AI features need a Firebase project (free tier).

## What it does

- Write, edit, search and delete short notes. Notes are stored locally in
  the browser (`localStorage`) — nothing is uploaded unless you use an AI
  action.
- **✦ Summarize with AI** — a 2–3 sentence summary of the selected note.
- **✦ Suggest tags** — up to 3 short tags for the selected note.
- Summaries are saved with the note; tags show up in the notes list.

## How it uses Firebase AI Logic

All AI features go through **Firebase AI Logic** (the Firebase JS SDK,
`firebase/ai`), using **hybrid inference**:

```js
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { mode: "prefer_on_device" });
const result = await model.generateContent(prompt);
```

- `mode: "prefer_on_device"` means the SDK runs inference on **Gemini Nano
  in Chrome** (desktop, Chrome 139+) when the on-device model is available,
  and seamlessly **falls back to a cloud-hosted Gemini model** otherwise.
- On-device inference is single-turn text generation — exactly what
  summarization and tag suggestion need.
- The cloud backend is the **Gemini Developer API**; text generation fits in
  the Firebase free tier. **No billing card is used by this app.**
- If Firebase is not configured yet, the AI buttons show a clear message
  instead of failing silently or faking a result. The app never invents a
  summary locally.

See `src/ai.js` for the full implementation.

## Setup (Firebase)

1. Go to https://console.firebase.google.com and create a project.
   (For the hackathon, the Sprint 3 quota account works the same way.)
2. In the project, register a **Web app** (`</>` icon) and copy its config.
3. Paste the values into `src/firebase-config.js`, replacing the `YOUR_*`
   placeholders.
4. In the Firebase console, open **Firebase AI Logic** and enable it with
   the **Gemini Developer API** backend.
5. Optional, for on-device Gemini Nano: in Chrome, enable
   `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input` and use
   Chrome 139+ on desktop. Without the flag, the app uses the cloud model.

## Run locally

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build at http://localhost:4173
npm test           # unit tests for the notes store
```

Requires Node.js 18+.

## Project structure

```
index.html            App shell
src/main.js           UI wiring (list, editor, AI buttons)
src/notes.js          Local notes store (localStorage, unit-tested)
src/ai.js             Firebase AI Logic wrapper (hybrid inference)
src/firebase-config.js  Firebase web config — placeholders until you fill it in
src/style.css         Clean, responsive styling
test/notes.test.mjs   Unit tests for the notes store
DEMO_SCRIPT.md        3-minute demo video script
```

## Status

- ✅ Notes CRUD + search + localStorage persistence (unit-tested)
- ✅ Production build passes; app serves and loads
- ✅ AI wiring implemented with Firebase AI Logic hybrid inference
- ⏳ Firebase project config not filled in yet (`src/firebase-config.js`
  still has placeholders) — AI buttons show a setup message until then
- ⏳ Demo video (≤ 3 min) — recorded separately, see `DEMO_SCRIPT.md`

## License

MIT — see [LICENSE](LICENSE).
