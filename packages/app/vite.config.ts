import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/app/",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 5173,
    // Dev-only proxy: server.matters.town only allows requests from the
    // matters.town/news origin. In dev we let vite forward server-side
    // (which has no CORS concerns) and rewrite the Origin header so the
    // upstream sees a whitelisted referrer. In prod we deploy the
    // CF-Worker proxy at packages/worker.
    proxy: {
      "/api/graphql": {
        target: "https://server.matters.town",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/graphql/, "/graphql"),
        headers: {
          origin: "https://matters.town",
          referer: "https://matters.town/",
        },
      },
    },
  },
});
