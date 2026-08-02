import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Scoped to admin-src/ only — the public pages at the repo root (index.html,
// fahrzeuge.html, ersatzteile.html, ...) are plain static files and must
// never be picked up as Vite entry points.
export default defineConfig({
  root: resolve(__dirname, "admin-src"),
  base: "/admin/",
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "admin"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://localhost:8888",
    },
  },
});
