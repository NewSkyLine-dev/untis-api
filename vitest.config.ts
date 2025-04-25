import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
    test: {
        globals: true,
        coverage: {
            reporter: ["text", "html"],
        },
        testTimeout: 500000,
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src"),
        },
    },
});
