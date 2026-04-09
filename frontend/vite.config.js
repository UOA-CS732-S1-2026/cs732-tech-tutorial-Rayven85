import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The server proxy is NOT needed here because we use CORS on the FastAPI side.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Default Vite port
  },
});
