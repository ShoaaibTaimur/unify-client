import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackRouter: {
    autoCodeSplitting: false,
  },
  nitro: {
    preset: "vercel",
  },
  tanstackStart: {
    server: {
      entry: "server",
    },
  },
});
