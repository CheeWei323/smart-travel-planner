
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
import fs from "node:fs";

export default defineConfig({
  plugins: [react()],

  server: {
    host: "127.0.0.1",
    https: {
      key: fs.readFileSync("../localhost+2-key.pem"),
      cert: fs.readFileSync("../localhost+2.pem"),
    },
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },

  preview: {
    host: "127.0.0.1",
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
