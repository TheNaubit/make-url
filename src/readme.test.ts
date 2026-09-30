import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import {
	getMakeURLDefaultConfig,
	makeURL,
	setMakeURLDefaultConfig,
} from "./index.js";

// Every README example written as a `makeURL(...)` call followed by a `// <output>` (or `// Throws: <message>`) comment is run and checked, so the docs can not drift from the code.

interface IExample {
	code: string;
	expected: string;
}

const README = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const CODE_BLOCK_REGEX = /~~~(?:ts|js)\n([\s\S]*?)~~~/g;
// Lines that are not plain JavaScript statements we can run (imports, declarations, TypeScript types)
const SKIPPED_LINE_REGEX = /^(?:import|const|let|\/\/ ESM|\/\/ CommonJS)\b/;

function examplesOf(block: string): Array<IExample> {
	const lines = block
		.split("\n")
		.filter((line) => !SKIPPED_LINE_REGEX.test(line.trim()));
	const examples: Array<IExample> = [];
	let pending: Array<string> = [];

	for (const line of lines) {
		const expectation = /^\/\/ (.+)$/.exec(line.trim());
		const previous = pending.join("\n").trim();

		if (expectation && previous.endsWith(");")) {
			examples.push({ code: previous, expected: expectation[1] as string });
			pending = [];
		} else if (!line.trim().startsWith("//")) {
			pending = [...pending, line];
		}
	}

	return examples;
}

function run(code: string): unknown {
	// The last statement is the expression to check, the ones before it (like setMakeURLDefaultConfig calls) are run first
	const lastStart = code.lastIndexOf("\nmakeURL(");
	const [setup, expression] =
		lastStart === -1
			? ["", code]
			: [code.slice(0, lastStart), code.slice(lastStart + 1)];

	// The code comes from this repository's own README (trusted content), and this only runs in the test suite
	return new Function(
		"makeURL",
		"setMakeURLDefaultConfig",
		"getMakeURLDefaultConfig",
		`${setup}\nreturn ${expression.replace(/;\s*$/, "")};`,
	)(makeURL, setMakeURLDefaultConfig, getMakeURLDefaultConfig);
}

const examples = [...README.matchAll(CODE_BLOCK_REGEX)].flatMap((match) =>
	examplesOf(match[1] as string),
);

afterEach(() => {
	setMakeURLDefaultConfig({});
});

describe("README examples", () => {
	it("has examples to check", () => {
		expect(examples.length).toBeGreaterThan(30);
	});

	it.each(examples)("$code", ({ code, expected }) => {
		const thrownMessage = /^Throws: (.+)$/.exec(expected)?.[1];

		if (thrownMessage !== undefined) {
			expect(() => run(code)).toThrow(thrownMessage);
		} else {
			expect(run(code)).toBe(expected);
		}
	});
});
