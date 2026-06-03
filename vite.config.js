import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import  {}from "././src/services/salesApi";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});