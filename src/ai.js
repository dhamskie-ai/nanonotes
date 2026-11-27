// ---------------------------------------------------------------------------
// AI features via Firebase AI Logic — hybrid inference.
//
// The model is created with mode "prefer_on_device": the Firebase AI Logic
// SDK runs inference on Gemini Nano in Chrome (desktop, Chrome 139+) when
// the on-device model is available, and seamlessly falls back to a
// cloud-hosted Gemini model otherwise. On-device inference is single-turn
// text generation, which is exactly what summarization and tag suggestion
// need.
//
// No API key or secret is ever stored here — the Firebase web config in
// src/firebase-config.js only identifies the project; calls go through the
// Firebase AI Logic SDK. If the config is still a placeholder, every AI
// call fails fast with a clear, human-readable error instead of
// pretending to work.
// ---------------------------------------------------------------------------

import { initializeApp } from "firebase/app";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

export const NOT_CONFIGURED_MESSAGE =
  "Firebase is not configured yet. Add your Firebase web app config to " +
  "src/firebase-config.js — see the Setup section in README.md.";

let modelPromise = null;

function getModel() {
  if (!isFirebaseConfigured()) {
    throw new Error(NOT_CONFIGURED_MESSAGE);
  }
  if (!modelPromise) {
    modelPromise = (async () => {
      const app = initializeApp(firebaseConfig);
      // Gemini Developer API backend; free tier covers text generation.
      const ai = getAI(app, { backend: new GoogleAIBackend() });
      // Hybrid inference: prefer on-device Gemini Nano, fall back to cloud.
      // (String form of InferenceMode.PREFER_ON_DEVICE.)
      // Model pinned explicitly in inCloudParams: the SDK default
      // (gemini-2.5-flash-lite) is no longer available to new users
      // (404, 28 Nov 2026); the API itself suggests gemini-3.5-flash-lite.
      // (Top-level `model` is ignored in hybrid mode — the SDK warns so.)
      return getGenerativeModel(ai, {
        mode: "prefer_on_device",
        inCloudParams: { model: "gemini-3.5-flash-lite" },
      });
    })();
  }
  return modelPromise;
}

/** Summarize a note into 2–3 short sentences. Returns the summary text. */
export async function summarizeNote(text) {
  const model = await getModel();
  const prompt =
    "Summarize the following note in 2-3 short sentences, keeping the key facts. " +
    "Do not add information that is not in the note.\n\nNote:\n\n" +
    text;
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

/** Suggest up to 3 short tags for a note. Returns an array of tag strings. */
export async function suggestTags(text) {
  const model = await getModel();
  const prompt =
    "Suggest up to 3 short tags (single words or two-word phrases) for the " +
    "following note. Reply with only the tags, separated by commas, nothing else.\n\nNote:\n\n" +
    text;
  const result = await model.generateContent(prompt);
  return result.response
    .text()
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);
}

/** Cheap status info for the UI header. Never throws. */
export function aiStatus() {
  let looksLikeChrome = false;
  try {
    looksLikeChrome =
      typeof navigator !== "undefined" &&
      /Chrome/.test(navigator.userAgent) &&
      !/Edg|OPR|Brave/.test(navigator.userAgent);
  } catch {
    looksLikeChrome = false;
  }
  return {
    configured: isFirebaseConfigured(),
    looksLikeChromeDesktop: looksLikeChrome,
  };
}

/** Turn a raw SDK error into a short, honest message for the UI. */
export function friendlyErrorMessage(err) {
  const msg = err && err.message ? err.message : String(err);
  if (msg.includes("not configured")) return msg;
  if (/network|fetch|Failed to fetch|offline/i.test(msg)) {
    return (
      "Network error while reaching the AI service. Check your connection " +
      "and try again. (On-device inference also needs the model downloaded in Chrome.)"
    );
  }
  if (/API key|permission|API_KEY|403|401/i.test(msg)) {
    return (
      "The AI request was rejected by the service (API key / permissions). " +
      "Check the Firebase project setup in README.md."
    );
  }
  return "AI request failed: " + msg;
}
