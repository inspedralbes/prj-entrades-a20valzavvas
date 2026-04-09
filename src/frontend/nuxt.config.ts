// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],

  // @shared/* alias: resolves to ../shared/types for Vite bundler and auto-imports
  alias: {
    "@shared": fileURLToPath(new URL("../shared/types", import.meta.url)),
  },

  runtimeConfig: {
    public: {
      wsUrl: "http://localhost/ws",
    },
  },

  typescript: {
    typeCheck: false, // Run explicitly via `pnpm type-check`
    strict: true,
  },
});
