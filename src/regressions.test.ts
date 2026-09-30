import { afterEach, describe, expect, it } from "vitest";
import {
	getMakeURLDefaultConfig,
	makeURL,
	setMakeURLDefaultConfig,
} from "./index.js";

afterEach(() => {
	setMakeURLDefaultConfig({});
});

describe("path fragments with URL params right after the domain", () => {
	it("keeps the slash between the domain and a fragment containing ':'", () => {
		expect(
			makeURL("https://example.com", "users/:id", { params: { id: 1 } }),
		).toBe("https://example.com/users/1");
	});

	it("works without a protocol too", () => {
		expect(makeURL("example.com", "users/:id", { params: { id: 1 } })).toBe(
			"https://example.com/users/1",
		);
	});

	it("still supports a port given as its own fragment", () => {
		expect(makeURL("https://example.com", ":8080", "api")).toBe(
			"https://example.com:8080/api",
		);
	});
});

describe("URL params replacement", () => {
	it("does not replace a param that is a prefix of another one", () => {
		expect(
			makeURL("https://example.com", "users/:identifier/:id", {
				params: { id: 1, identifier: "abc" },
			}),
		).toBe("https://example.com/users/abc/1");
	});

	it("supports keys with regular expression characters", () => {
		expect(
			makeURL("https://example.com", "a/:b.c", { params: { "b.c": 1 } }),
		).toBe("https://example.com/a/1");
		expect(makeURL("https://example.com", "a", { params: { "a(": 1 } })).toBe(
			"https://example.com/a?a%28=1",
		);
	});

	it("never replaces the port", () => {
		expect(
			makeURL("https://example.com:8080", "x", { params: { 8080: "p" } }),
		).toBe("https://example.com:8080/x?8080=p");
	});
});

describe("international domains", () => {
	it("converts the domain to punycode instead of percent-encoding it", () => {
		expect(makeURL("https://münchen.de", "straße")).toBe(
			"https://xn--mnchen-3ya.de/stra%C3%9Fe",
		);
		expect(makeURL("münchen.de", "x")).toBe("https://xn--mnchen-3ya.de/x");
		expect(makeURL("//münchen.de:8080", "x")).toBe(
			"//xn--mnchen-3ya.de:8080/x",
		);
	});

	it("keeps ASCII domains untouched", () => {
		expect(makeURL("https://Example.com:8080", "x")).toBe(
			"https://Example.com:8080/x",
		);
	});
});

describe("protocol detection", () => {
	it("keeps a relative protocol when the domain has a port", () => {
		expect(makeURL("//example.com:8080", "x")).toBe("//example.com:8080/x");
		expect(makeURL("//", "example.com:8080", "x")).toBe("//example.com:8080/x");
	});

	it("supports an uppercase protocol and domain", () => {
		expect(makeURL("HTTPS://Example.com", "x")).toBe("HTTPS://Example.com/x");
	});
});

describe("query params", () => {
	it("skips undefined and null values", () => {
		expect(
			makeURL("https://example.com", "x", {
				params: { a: undefined, b: null, c: false, d: 0 },
			}),
		).toBe("https://example.com/x?c=false&d=0");
	});

	it("does not throw when params is undefined", () => {
		expect(makeURL("https://example.com", "x", { params: undefined })).toBe(
			"https://example.com/x",
		);
	});

	it("serializes dates as ISO strings", () => {
		expect(
			makeURL("https://example.com", "x", { params: { d: new Date(0) } }),
		).toBe("https://example.com/x?d=1970-01-01T00%3A00%3A00.000Z");
	});
});

describe("hash", () => {
	it("ignores a leading '#'", () => {
		expect(makeURL("https://example.com", "x", { hash: "#section" })).toBe(
			"https://example.com/x#section",
		);
	});
});

describe("default config", () => {
	it("cannot be mutated through getMakeURLDefaultConfig", () => {
		const config = getMakeURLDefaultConfig();
		config.strict = true;
		expect(getMakeURLDefaultConfig().strict).toBe(false);
	});
});
