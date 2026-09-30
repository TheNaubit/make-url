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
		expect(makeURL("www", ".example.com", "a")).toBe(
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

describe("host continuation", () => {
	it("keeps the last valid host instead of dropping it", () => {
		expect(
			makeURL("https://example.com:8080", ".com", { params: { 8080: "P" } }),
		).toBe("https://example.com:8080/.com?8080=P");
		expect(
			makeURL("https://u:p@example.com", ".json", { params: { p: "W" } }),
		).toBe("https://u:p@example.com/.json?p=W");
		expect(makeURL("http://[::1]:8080", ".com")).toBe("http://[::1]:8080/.com");
		expect(makeURL("example.com", ".js")).toBe("https://example.com/.js");
		expect(makeURL("localhost:3000", ".com")).toBe(
			"https://localhost:3000/.com",
		);
		expect(makeURL("//cdn.io", ".json")).toBe("//cdn.io/.json");
	});

	it("does not glue dotfiles to a complete host", () => {
		expect(makeURL("https://example.com", ".env")).toBe(
			"https://example.com/.env",
		);
		expect(makeURL("https://example.com", ".git", "config")).toBe(
			"https://example.com/.git/config",
		);
	});

	it("still glues a port to a complete host", () => {
		expect(makeURL("example.com", ":8080", "a")).toBe(
			"https://example.com:8080/a",
		);
	});
});

describe("relative protocol", () => {
	it("is only recognized inside a single fragment", () => {
		expect(makeURL("/", "/john.doe")).toBe("/john.doe");
		expect(
			makeURL("", "/", "/evil.com", {
				config: { allowEmptyPathSegments: true },
			}),
		).not.toMatch(/^\/\/evil/);
	});
});

describe("empty fragments", () => {
	it("reads the inline query and hash from the last non-empty fragment", () => {
		expect(makeURL("https://example.com/a?x=1", "")).toBe(
			"https://example.com/a?x=1",
		);
		expect(makeURL("https://example.com?x=1#top", "")).toBe(
			"https://example.com?x=1#top",
		);
	});

	it("skips empty fragments before a domain", () => {
		expect(
			makeURL("", "example.com", { config: { allowEmptyPathSegments: true } }),
		).toBe("https://example.com");
	});
});

describe("host and credentials encoding", () => {
	it("encodes the credentials", () => {
		expect(makeURL("https://us er:p|w@example.com")).toBe(
			"https://us%20er:p%7Cw@example.com",
		);
	});

	it("ignores whitespace around the host", () => {
		expect(makeURL("example.com ", "a")).toBe("https://example.com/a");
	});
});

describe("opaque protocols with params", () => {
	it("replaces path params", () => {
		expect(makeURL("mailto::email", { params: { email: "a@b.com" } })).toBe(
			"mailto:a%40b.com",
		);
	});

	it("cleans repeated slashes", () => {
		expect(makeURL("mailto:a@b.com", "/x")).toBe("mailto:a@b.com/x");
	});
});

describe("file protocol", () => {
	it("keeps the empty host", () => {
		expect(makeURL("file:///etc/passwd")).toBe("file:///etc/passwd");
		expect(makeURL("file:///home", "user", "notes.txt")).toBe(
			"file:///home/user/notes.txt",
		);
	});
});
