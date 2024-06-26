/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import packageJson from "./package.json";

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "make-url",
			fileName: "make-url",
		},
		rollupOptions: {
			// Exclude peer dependencies from the bundle to reduce bundle size
			external: [
				"react/jsx-runtime",
				...Object.keys(
					(packageJson as Record<string, any>)?.peerDependencies || {},
				),
			],
		},
		sourcemap: true,
		emptyOutDir: true,
	},
	plugins: [dts({ rollupTypes: true })],
	test: {
		// ...
	},
});
