import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";
import fs from "node:fs";

export default defineConfig(({ command }) => {
  let https;
  // Builds generate static files and do not need local development keys.
  if (command === "serve") {
    const keyFile = new URL("../localhost+2-key.pem", import.meta.url);
    const certFile = new URL("../localhost+2.pem", import.meta.url);
    if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
      throw new Error(
        "Local HTTPS certificates are missing. Generate localhost+2.pem and " +
        "localhost+2-key.pem in the project root using the README setup steps.",
      );
    }
    https = {
      key: fs.readFileSync(keyFile),
      cert: fs.readFileSync(certFile),
      minVersion: "TLSv1.2",
    };
  }

  return {
    plugins: [react()],

    server: {
      host: "127.0.0.1",
      https,
      proxy: {
        "/api": {
          target: process.env.API_PROXY_TARGET || "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },

    preview: {
      host: "127.0.0.1",
      https,
      proxy: {
        "/api": {
          target: process.env.API_PROXY_TARGET || "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
