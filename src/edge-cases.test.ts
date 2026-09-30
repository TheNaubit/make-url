import { afterEach, describe, expect, it } from "vitest";
import {
	BASE_DEFAULT_MAKE_URL_CONFIG,
	type IConfig,
	makeURL,
	setMakeURLDefaultConfig,
} from "./index.js";

afterEach(() => {
	setMakeURLDefaultConfig({});
});

describe("slashes", () => {
	it("removes the trailing slash after collapsing repeated slashes", () => {
		expect(
			makeURL("https://api.example.com/", "/:id/:param2/:id///", {
				params: { id: 1, param2: "678" },
			}),
		).toBe("https://api.example.com/1/678/1");
		expect(makeURL("https://x.com", "a//")).toBe("https://x.com/a");
	});

	it("treats the slash after the host as the separator with allowEmptyPathSegments", () => {
		const config = { allowEmptyPathSegments: true };
		expect(makeURL("https://example.com", "//test///a", { config })).toBe(
			"https://example.com//test///a",
		);
		expect(makeURL("https://example.com/", "test", { config })).toBe(
			"https://example.com/test",
		);
	});

	it("keeps the root path", () => {
		expect(makeURL("/")).toBe("/");
		expect(makeURL("https://")).toBe("https://");
	});

	it("keeps a URL inside the path", () => {
		expect(makeURL("https://example.com", "redirect/https://other.com")).toBe(
			"https://example.com/redirect/https://other.com",
		);
	});
});

describe("config", () => {
	it("ignores config keys set to undefined", () => {
		const config: Partial<IConfig> = {
			forceProtocol: undefined,
			trailingSlash: undefined,
			arraySerializer: undefined,
		};
		expect(
			makeURL("example.com", "a/", { params: { t: ["x", "y"] }, config }),
		).toBe("https://example.com/a?t=x&t=y");
	});

	it("freezes the base default config", () => {
		expect(Object.isFrozen(BASE_DEFAULT_MAKE_URL_CONFIG)).toBe(true);
	});

	it("does not throw with a null options object", () => {
		// @ts-expect-error: invalid options on purpose (plain JavaScript callers)
		expect(makeURL("https://example.com", null)).toBe("https://example.com");
	});
});

describe("encoding", () => {
	it("does not throw on lone surrogates", () => {
		expect(makeURL("https://example.com", "a\uD800b")).toBe(
			"https://example.com/a%EF%BF%BDb",
		);
		expect(
			makeURL("https://example.com", ":id", {
				params: { id: "\uDC00" },
				hash: "\uD800",
			}),
		).toBe("https://example.com/%EF%BF%BD#%EF%BF%BD");
	});

	it("does not encode existing percent-escapes again", () => {
		expect(makeURL("https://example.com", "hello%20world", "100%")).toBe(
			"https://example.com/hello%20world/100%25",
		);
	});

	it("keeps the characters of client-side routes in the hash", () => {
		expect(makeURL("https://example.com", { hash: "/users/1?tab=a&b=c" })).toBe(
			"https://example.com#/users/1?tab%3Da%26b%3Dc",
		);
	});

	it("replaces params with non-ASCII keys", () => {
		expect(
			makeURL("https://example.com", "tags/:ñandú", {
				params: { ñandú: "sí" },
			}),
		).toBe("https://example.com/tags/s%C3%AD");
	});

	it("serializes symbols and circular objects without throwing", () => {
		const circular: Record<string, unknown> = {};
		circular["self"] = circular;
		expect(
			makeURL("https://example.com", {
				params: { s: Symbol("x"), c: circular },
			}),
		).toBe("https://example.com?s=Symbol%28x%29&c=%5Bobject+Object%5D");
	});

	it("accepts a non-string hash from JavaScript callers", () => {
		// @ts-expect-error: invalid hash on purpose (plain JavaScript callers)
		expect(makeURL("https://example.com", { hash: 42 })).toBe(
			"https://example.com#42",
		);
	});
});

describe("hosts", () => {
	it("does not treat relative paths and file names as domains", () => {
		expect(makeURL("./page")).toBe("./page");
		expect(makeURL("../up", "x")).toBe("../up/x");
		expect(makeURL("file.json")).toBe("file.json");
		expect(makeURL("docs", "index.html")).toBe("docs/index.html");
	});

	it("supports IPv6 hosts", () => {
		expect(makeURL("http://[::1]:8080", "api")).toBe("http://[::1]:8080/api");
		expect(
			makeURL("http://[::1]:8080", "api", { config: { strict: true } }),
		).toBe("http://[::1]:8080/api");
	});

	it("supports localhost", () => {
		expect(makeURL("localhost:3000", "api")).toBe("https://localhost:3000/api");
		expect(
			makeURL("http://localhost:3000", "api", { config: { strict: true } }),
		).toBe("http://localhost:3000/api");
	});

	it("never replaces the port, even without a protocol", () => {
		expect(
			makeURL("localhost:3000", "a/:3000", { params: { 3000: "x" } }),
		).toBe("https://localhost:3000/a/x");
		expect(
			makeURL("example.com:8080", "a", {
				params: { 8080: "x" },
				config: { forceProtocol: "none" },
			}),
		).toBe("example.com:8080/a?8080=x");
	});
});

describe("protocols", () => {
	it("recognizes any protocol followed by //", () => {
		expect(
			makeURL("wss://example.com", "socket", {
				config: { forceProtocol: "https" },
			}),
		).toBe("wss://example.com/socket");
		expect(makeURL("myapp://settings", "profile")).toBe(
			"myapp://settings/profile",
		);
	});

	it("keeps protocols without // like mailto", () => {
		expect(
			makeURL("mailto:me@example.com", { params: { subject: "Hi there" } }),
		).toBe("mailto:me@example.com?subject=Hi+there");
		expect(makeURL("tel:+34600000000")).toBe("tel:+34600000000");
	});

	it("ignores whitespace around the URL", () => {
		expect(makeURL(" https://example.com", "a ")).toBe("https://example.com/a");
	});
});

describe("query and hash written in the fragments", () => {
	it("keeps an existing query and adds the params after it", () => {
		expect(
			makeURL("https://x.com/search?key=abc", { params: { q: "1" } }),
		).toBe("https://x.com/search?key=abc&q=1");
	});

	it("keeps an existing hash", () => {
		expect(makeURL("https://x.com", "page#top")).toBe("https://x.com/page#top");
	});

	it("prefers the hash option", () => {
		expect(makeURL("https://x.com", "page#top", { hash: "end" })).toBe(
			"https://x.com/page#end",
		);
	});

	it("encodes a '?' written in a fragment that is not the last one", () => {
		expect(makeURL("https://x.com", "what?", "now")).toBe(
			"https://x.com/what%3F/now",
		);
	});
});

describe("arrays", () => {
	const params = {
		a: [{ x: 1 }, new Date(0), null, undefined, 2],
	};

	it("serializes the items like single values in repeat mode", () => {
		expect(makeURL("https://x.com", { params })).toBe(
			"https://x.com?a=%7B%22x%22%3A1%7D&a=1970-01-01T00%3A00%3A00.000Z&a=2",
		);
	});

	it("serializes the items like single values in comma mode", () => {
		expect(
			makeURL("https://x.com", {
				params,
				config: { arraySerializer: "comma" },
			}),
		).toBe(
			"https://x.com?a=%7B%22x%22%3A1%7D%2C1970-01-01T00%3A00%3A00.000Z%2C2",
		);
	});
});
