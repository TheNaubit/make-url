import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

// https://vite.dev/guide/build.html#library-mode
export default defineConfig({
	build: {
		lib: {
			entry: resolve(import.meta.dirname, "src/index.ts"),
			name: "makeURL",
			fileName: "make-url",
			formats: ["es", "umd"],
		},
		sourcemap: true,
		emptyOutDir: true,
	},
	test: {
		include: ["src/**/*.test.ts"],
		coverage: {
			include: ["src/**/*.ts"],
			exclude: ["src/**/*.test.ts", "src/**/*.test-d.ts", "src/types.ts"],
			thresholds: { lines: 90, functions: 90, branches: 85, statements: 90 },
		},
	},
});
