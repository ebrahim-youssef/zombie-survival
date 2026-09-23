import { defineConfig } from "vite";

export default defineConfig({
  // Cloudflare's Vite integration expects a concrete plugins array so it can
  // safely inspect or augment the config during deployment.
  plugins: [],
  server: {
    host: true,
  },
  build: {
    outDir: "dist",
  },
});
