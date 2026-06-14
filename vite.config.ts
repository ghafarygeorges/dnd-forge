import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Relative base so the build works under a GitHub Pages project subpath
  // (https://<user>.github.io/<repo>/) regardless of the repo name.
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5175,
  },
});
