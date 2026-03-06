import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, "src"),
      obsidian: path.resolve(__dirname, "test/__mocks__/obsidian.ts"),
      "obsidian-daily-notes-interface": path.resolve(
        __dirname,
        "test/__mocks__/obsidian-daily-notes-interface.ts"
      ),
    },
  },
  test: {
    globals: true,
    setupFiles: ["test/setup.ts"],
  },
});
