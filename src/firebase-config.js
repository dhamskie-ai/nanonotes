// ---------------------------------------------------------------------------
// Firebase web app configuration.
//
// HOW TO FILL THIS IN (no billing card needed — free tier is enough):
//   1. Go to https://console.firebase.google.com and create a project
//      (or use the quota account sent for #BuildHybridAI Sprint 3).
//   2. In the project, register a Web app (</> icon) and copy its config.
//   3. Paste the values below, replacing the YOUR_* placeholders.
//   4. In the Firebase console, open "Firebase AI Logic" and enable it
//      with the Gemini Developer API backend.
//   5. (Optional, for on-device Gemini Nano) In Chrome, enable
//      chrome://flags/#prompt-api-for-gemini-nano-multimodal-input
//      and use Chrome 139+ on desktop.
//
// Until this file is filled in, the app works fully as a local notes app,
// and the AI buttons show a clear message instead of failing silently.
// ---------------------------------------------------------------------------

export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// True only once a real config has been pasted in.
// NOTE ON BUILDS: this config is a build-time input. The production
// bundler may fold the placeholder check away while the placeholders are
// still here (the AI path is then absent from dist/ — which is fine, the
// app shows the "not configured" message instead). After you paste a real
// config, run `npm run build` again (or just use `npm run dev`) and the
// full Firebase AI Logic path is included. Verified 2026-11-25: with a
// real apiKey the bundle contains the full hybrid-inference path
// (mode "prefer_on_device"); with placeholders it correctly degrades.
export function isFirebaseConfigured() {
  return (
    firebaseConfig.apiKey !== "YOUR_API_KEY" && Boolean(firebaseConfig.apiKey)
  );
}
