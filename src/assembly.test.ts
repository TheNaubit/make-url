import { afterEach, describe, expect, it } from "vitest";
import { makeURL, setMakeURLDefaultConfig } from "./index.js";

afterEach(() => {
	setMakeURLDefaultConfig({});
});

describe("protocol reassembly", () => {
	it("does not glue a fragment containing a full URL to the ones before it", () => {
		expect(makeURL("redirect", "https://other.com")).toBe(
			"redirect/https://other.com",
		);
		expect(makeURL("example.com", "redirect", "https://other.com")).toBe(
			"https://example.com/redirect/https://other.com",
		);
	});

	it("still reassembles a protocol split across fragments", () => {
		expect(makeURL("https:", "//example.com", "a")).toBe(
			"https://example.com/a",
		);
		expect(makeURL("https://", "example.com", "a")).toBe(
			"https://example.com/a",
		);
	});
});

describe("domain reassembly", () => {
	it("does not glue a dotted path segment to a complete host", () => {
		expect(
			makeURL("https://example.com", ".well-known", "openid-configuration"),
		).toBe("https://example.com/.well-known/openid-configuration");
		expect(makeURL("https://1.2.3.4", ".", "a.b")).toBe(
			"https://1.2.3.4/./a.b",
		);
		expect(makeURL("localhost:3000", "./p")).toBe("https://localhost:3000/./p");
	});

	it("still reassembles a domain split across fragments", () => {
		expect(makeURL("www", ".example", ".com", "a")).toBe(
			"https://www.example.com/a",
		);
		expect(makeURL("example", ".co.uk", "a")).toBe("https://example.co.uk/a");
		expect(makeURL("example", ".com/blog")).toBe("https://example.com/blog");
	});

	it("never takes a path starting with '/' as a domain", () => {
		expect(makeURL("/", "john.doe")).toBe("/john.doe");
		expect(makeURL("/", "x.com", { config: { forceProtocol: "none" } })).toBe(
			"/x.com",
		);
	});
});

describe("opaque protocols", () => {
	it("does not encode existing escapes again", () => {
		expect(makeURL("mailto:a%40b.com")).toBe("mailto:a%40b.com");
		expect(makeURL(makeURL("tel:1", "é"))).toBe("tel:1/%C3%A9");
	});

	it("encodes '?' and '#' outside the last fragment", () => {
		expect(makeURL("tel:1", "?q=1", "a", { params: { n: 1 } })).toBe(
			"tel:1/%3Fq=1/a?n=1",
		);
	});
});

describe("inline query", () => {
	it("keeps the query written in the fragment as it is", () => {
		expect(makeURL("https://x.com", "a?x=%20")).toBe("https://x.com/a?x=%20");
		expect(makeURL("https://x.com", "a?q")).toBe("https://x.com/a?q");
		expect(makeURL("https://x.com", "p?a=1;b=2&c=/d,e")).toBe(
			"https://x.com/p?a=1;b=2&c=/d,e",
		);
		expect(makeURL("https://x.com", "a?b", { params: { b: 2 } })).toBe(
			"https://x.com/a?b&b=2",
		);
	});
});

describe("credentials", () => {
	it("does not encode existing escapes again", () => {
		expect(makeURL("https://u:p%40ss@münchen.de", "x")).toBe(
			"https://u:p%40ss@xn--mnchen-3ya.de/x",
		);
	});
});
