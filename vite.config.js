import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so the built app also works when served from any
  // static host (e.g. GitHub Pages) under a sub-path.
  base: "./",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
