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
  esbuild: {
    logOverride: {
      // Workaround false warning until plugin-react@2.0.0 is released
      // Ref: https://github.com/vitejs/vite/issues/8644#issuecomment-1159308803
      "this-is-undefined-in-esm": "silent",
    },
  },
  preview: {
    port: 3000,
  },
});
