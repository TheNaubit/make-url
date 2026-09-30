import { afterEach, describe, expect, it } from "vitest";
import { makeURL, setMakeURLDefaultConfig } from "./index.js";

// Param and hash values can come from users: they must never change the structure of the URL

afterEach(() => {
	setMakeURLDefaultConfig({});
});

describe("dot segments from param values", () => {
	it("throws instead of letting a value climb the path", () => {
		expect(() =>
			makeURL("https://example.com", "users/:id", "delete", {
				params: { id: ".." },
			}),
		).toThrow('The value of the param "id" can not be "." or ".." in the path');
		expect(() =>
			makeURL("/api/users/:id/delete", { params: { id: "." } }),
		).toThrow();
		expect(() =>
			makeURL("https://example.com", "x/:a:b/y", {
				params: { a: ".", b: "." },
			}),
		).toThrow();
		expect(() =>
			makeURL("https://example.com", "x/.:a/y", { params: { a: "." } }),
		).toThrow();
	});

	it("allows dots inside a longer value", () => {
		expect(
			makeURL("https://example.com", "files/:name", {
				params: { name: "..hidden" },
			}),
		).toBe("https://example.com/files/..hidden");
	});

	it("keeps literal dot segments written by the developer", () => {
		expect(makeURL("https://example.com", "a/../b")).toBe(
			"https://example.com/a/../b",
		);
	});
});

describe("hosts from param values", () => {
	it("does not add a forced protocol when the first segment has a param", () => {
		const config = { forceProtocol: "https" as const };
		expect(
			makeURL("/:slug", "about", { params: { slug: "evil.com" }, config }),
		).toBe("/evil.com/about");
		expect(
			makeURL("/:a/:b", { params: { a: "", b: "evil.com" }, config }),
		).toBe("/evil.com");
		expect(() =>
			makeURL("/:slug", {
				params: { slug: "evil.com" },
				config: { ...config, strict: true },
			}),
		).toThrow("The generated URL is not valid");
	});

	it("does not use a param after a protocol without host as the host", () => {
		expect(makeURL("https://", ":h", { params: { h: "evil.com" } })).toBe(
			"evil.com",
		);
		expect(
			new URL(
				makeURL("https://", ":h", { params: { h: "evil.com" } }),
				"https://base.example",
			).host,
		).toBe("base.example");
	});

	it("does not replace params in an invalid host", () => {
		const url = makeURL("https://example.com:id", {
			params: { id: "x.evil.com" },
		});
		expect(new URL(url, "https://base.example").host).toBe("base.example");
		expect(() =>
			makeURL("https://example.com:id", {
				params: { id: "x.evil.com" },
				config: { strict: true },
			}),
		).toThrow();
	});

	it("keeps a literal first segment with a forced protocol", () => {
		expect(
			makeURL("blog", "post", { config: { forceProtocol: "https" } }),
		).toBe("https://blog/post");
	});
});

describe("scheme injection", () => {
	it("never keeps javascript: or vbscript: as a protocol", () => {
		expect(makeURL("javascript://%0aalert(1)")).not.toMatch(/^javascript:/i);
		expect(makeURL("", "javascript://%0aalert(1)")).not.toMatch(
			/^javascript:/i,
		);
		expect(makeURL("VBScript://x")).not.toMatch(/^vbscript:/i);
	});
});

describe("opaque protocols split across fragments", () => {
	it("does not add a slash after the protocol", () => {
		expect(makeURL("mailto:", "me@x.com")).toBe("mailto:me@x.com");
		expect(makeURL("tel:", ":n", { params: { n: 1 } })).toBe("tel:1");
	});
});

describe("low-severity hardening", () => {
	it("never builds an authority in opaque URLs", () => {
		expect(makeURL("mailto:", "/", ":p", { params: { p: "evil.com" } })).toBe(
			"mailto:/evil.com",
		);
		expect(makeURL("mailto:me@x.com", "a:", "b")).toBe("mailto:me@x.com/a:/b");
	});

	it("ends the host at a backslash, like URL parsers", () => {
		const url = makeURL("example.com\\@evil.com", "x");
		expect(new URL(url).host).toBe("example.com");
		expect(makeURL("https://example.com\\evil", "x")).toBe(
			"https://example.com/%5Cevil/x",
		);
	});

	it("does not let a value decide whether '//' stays in the path", () => {
		expect(makeURL(":p:", "/", ":q", { params: { p: "1", q: "x" } })).toBe(
			"1:/x",
		);
	});
});
