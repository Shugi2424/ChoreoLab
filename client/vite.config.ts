import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Listen on all network interfaces so other devices on the same Wi-Fi can connect.
    host: true,
  },
});
