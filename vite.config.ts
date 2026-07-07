import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/graphql": {
        target: "http://3.7.222.252:4000",
        changeOrigin: true,
        secure: false,
      },
      "/users": {
        target: "http://3.7.222.252:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
