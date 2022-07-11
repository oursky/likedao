import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import resolve from "@rollup/plugin-node-resolve";
import nodePolyfills from "rollup-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    resolve({
      extensions: [".js", ".ts"],
    }),
  ],
  build: {
    outDir: "build",
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
  preview: {
    port: 3000,
  },
});
