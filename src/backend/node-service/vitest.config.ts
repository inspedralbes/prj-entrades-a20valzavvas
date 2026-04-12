import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { resolve } from "path";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "shared/types": resolve(__dirname, "../../shared/types"),
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
