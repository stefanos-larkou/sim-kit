import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [
        react(),
        dts({
            tsconfigPath: "tsconfig.app.json",
            include: ["src"],
            exclude: ["**/*.test.ts", "**/*.test.tsx", "src/test-setup.ts"]
        })
    ],
    build: {
        lib: {
            entry: {
                index: "src/index.ts",
                testing: "src/testing.ts"
            },
            formats: ["es"]
        },
        rollupOptions: {
            external: [/^react($|\/)/, /^react-dom($|\/)/, /^@mui\//, /^@emotion\//]
        }
    },
    test: {
        environment: "jsdom",
        setupFiles: "./src/test-setup.ts"
    }
});
