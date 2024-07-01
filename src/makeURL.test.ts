import { describe, expect, it } from "vitest";
import {
	BASE_DEFAULT_MAKE_URL_CONFIG,
	getMakeURLDefaultConfig,
	makeURL,
	setMakeURLDefaultConfig,
} from "./index";
import type { IConfig } from "./types";

describe("makeURL", () => {
	it("should generate a valid URL with trailing slash using string fragments", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "add",
			strict: true,
			allowEmptyPathSegments: true,
		});

		const url = makeURL("https://example.com", "path", "to", "resource");
		expect(url).toBe("https://example.com/path/to/resource/");
	});

	it("should generate a valid URL without trailing slash using string fragments", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: true,
		});

		const url = makeURL("https://example.com", "path", "to", "resource");
		expect(url).toBe("https://example.com/path/to/resource");
	});

	it("should generate a valid URL with trailing slash containing query parameters", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "add",
			strict: true,
			allowEmptyPathSegments: true,
		});

		const url = makeURL("https://example.com", {
			params: { key: "value" },
		});
		expect(url).toBe("https://example.com/?key=value");
	});

	it("should generate a valid URL without trailing slash containing query parameters", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: true,
		});

		const url = makeURL("https://example.com", {
			params: { key: "value" },
		});
		expect(url).toBe("https://example.com?key=value");
	});

	it("should generate a valid URL with trailing slash containing a hash parameter", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "add",
			strict: true,
			allowEmptyPathSegments: true,
		});

		const url = makeURL("https://example.com", {
			hash: "about",
		});
		expect(url).toBe("https://example.com/#about");
	});

	it("should generate a valid URL without trailing slash containing a hash parameter", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: true,
		});

		const url = makeURL("https://example.com", {
			hash: "about",
		});
		expect(url).toBe("https://example.com#about");
	});

	it("should throw an error if no params are provided", () => {
		expect(() => {
			makeURL();
		}).toThrow("makeURL must receive at least one string item");
	});

	it("should throw an error if no string params are provided", () => {
		expect(() => {
			makeURL({
				params: {
					key: "value",
				},
			});
		}).toThrow("makeURL must receive at least one string item");
	});

	it("should throw an error if the first param provided is not a string", () => {
		expect(() => {
			makeURL(
				{
					params: {
						key: "value",
					},
				},
				"example.com",
			);
		}).toThrow("makeURL must receive at least one string item");
	});

	it("should throw an error if any other than the last param is a config object", () => {
		expect(() => {
			makeURL(
				"example.com",
				{
					params: {
						key: "value",
					},
				},
				"test",
			);
		}).toThrow("Params config object argument must be the last argument");
	});

	it("should remove empty path segments if allowEmptyPathSegments is false", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: true, // Just to test the config is changed when calling the makeURL function
		});

		const url = makeURL(
			"https://example.com",
			"",
			"path",
			"",
			"to",
			"",
			"resource",
			{ config: { allowEmptyPathSegments: false } },
		);
		expect(url).toBe("https://example.com/path/to/resource");
	});

	it("should not remove empty path segments if allowEmptyPathSegments is true", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false, // Just to test the config is changed when calling the makeURL function
		});

		const url = makeURL(
			"https://example.com",
			"",
			"/path",
			"",
			"to",
			"",
			"resource",
			{ config: { allowEmptyPathSegments: true } },
		);
		expect(url).toBe("https://example.com///path//to//resource");
	});

	it("should throw an error if strict is set to true and a relative URL is created", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
		});

		expect(() => {
			makeURL("blog", "post/1");
		}).toThrow("The generated URL is not valid: blog/post/1");
	});

	it("should throw an error if strict is set to true and an absolute URL is created", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
		});

		expect(() => {
			makeURL("/blog", "post/1");
		}).toThrow("The generated URL is not valid: /blog/post/1");
	});

	it("should throw an error if strict is set to true and an invalid complete URL is created", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
		});

		expect(() => {
			makeURL("http://example", "blog/post/1");
		}).toThrow("The generated URL is not valid: http://example/blog/post/1");
	});

	it("should not throw an error if strict is set to false and a relative URL is created", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("blog", "post/1");
		expect(url).toBe("blog/post/1");
	});

	it("should not throw an error if strict is set to false and an absolute URL is created", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("/blog", "post/1");
		expect(url).toBe("/blog/post/1");
	});

	it("should not throw an error if strict is set to false and an invalid complete URL is created", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("http://example", "blog/post/1");
		expect(url).toBe("http://example/blog/post/1");
	});

	it("should not add any protocol to a URL that already includes the protocol in the first string argument when forceProtocol is `http`", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "http",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("https://example.com", "blog", "post/1");
		expect(url).toBe("https://example.com/blog/post/1");
	});

	it("should add the `http` protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `http`", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "http",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("example.com", "blog", "post/1");
		expect(url).toBe("http://example.com/blog/post/1");
	});

	it("should add the `http` protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `http` even if the generated URL is relative", () => {
		// Note: This is the expected behaviour, for dynamic protocol, use `auto` or `auto-insecure` in the forceProtocol config
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "http",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("blog", "post/1");
		expect(url).toBe("http://blog/post/1");
	});

	it("should add the `http` protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `http` even if the generated URL is absolute", () => {
		// Note: This is the expected behaviour, for dynamic protocol, use `auto` or `auto-insecure` in the forceProtocol config
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "http",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("/blog", "post/1");
		expect(url).toBe("http://blog/post/1");
	});

	it("should not add any protocol to a URL that already includes the protocol in the first string argument when forceProtocol is `https`", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "https",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("http://example.com", "blog", "post/1");
		expect(url).toBe("http://example.com/blog/post/1");
	});

	it("should add the `https` protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `https`", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "https",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("example.com", "blog", "post/1");
		expect(url).toBe("https://example.com/blog/post/1");
	});

	it("should add the `https` protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `https` even if the generated URL is relative", () => {
		// Note: This is the expected behaviour, for dynamic protocol, use `auto` or `auto-insecure` in the forceProtocol config
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "https",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("blog", "post/1");
		expect(url).toBe("https://blog/post/1");
	});

	it("should add the `https` protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `https` even if the generated URL is absolute", () => {
		// Note: This is the expected behaviour, for dynamic protocol, use `auto` or `auto-insecure` in the forceProtocol config
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "https",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("/blog", "post/1");
		expect(url).toBe("https://blog/post/1");
	});

	it("should not add any protocol to a URL that already includes the protocol in the first string argument when forceProtocol is `none`", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "none",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("https://example.com", "blog", "post/1");
		expect(url).toBe("https://example.com/blog/post/1");
	});

	it("should not add any protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `none`", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "none",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("example.com", "blog", "post/1");
		expect(url).toBe("example.com/blog/post/1");
	});

	it("should not add the `https`(or any other) protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `auto` and the created URL is relative", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("blog", "post/1");
		expect(url).toBe("blog/post/1");
	});

	it("should not add the `https`(or any other) protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `auto` and the created URL is absolute", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("/blog", "post/1");
		expect(url).toBe("/blog/post/1");
	});

	it("should add the `https` protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `auto` and the created URL contains a valid domain in the first string argument", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("example.com", "/blog", "post/1");
		expect(url).toBe("https://example.com/blog/post/1");
	});

	it("should not add the `http`(or any other) protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `auto-insecure` and the created URL is relative", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto-insecure",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("blog", "post/1");
		expect(url).toBe("blog/post/1");
	});

	it("should not add the `http`(or any other) protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `auto-insecure` and the created URL is absolute", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto-insecure",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("/blog", "post/1");
		expect(url).toBe("/blog/post/1");
	});

	it("should add the `http` protocol to a URL that does not include the protocol in the first string argument when forceProtocol is `auto-insecure` and the created URL contains a valid domain in the first string argument", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto-insecure",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("example.com", "/blog", "post/1");
		expect(url).toBe("http://example.com/blog/post/1");
	});

	it("should encode unsafe characters in the URL", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
		});
		// https://example.com/blog/pÖ&st/1/about me/*Æ?testQÉr/y=%ª`B
		const url = makeURL(
			"https://example.com",
			"blog",
			"pÖ&st/1",
			"about me",
			"/:id/",
			{
				params: {
					id: "*Æ",
					"testQÉr/y": "%ª`B",
				},
				hash: "Üº&%·3",
			},
		);
		expect(url).toBe(
			"https://example.com/blog/p%C3%96%26st/1/about%20me/*%C3%86?testQ%C3%89r%2Fy=%25%C2%AA%60B#%C3%9C%C2%BA%26%25%C2%B73",
		);
	});

	it("should serialize the query parameters as a JSON serialized string if the arraySerializer is set to `stringify`", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
			arraySerializer: "stringify",
		});

		const url = makeURL("https://example.com", {
			params: {
				key: "value",
				arr: ["item1", "item2"],
			},
		});
		expect(url).toBe(
			"https://example.com?key=value&arr=%5B%22item1%22%2C%22item2%22%5D",
		);
	});

	it("should serialize the query parameters as a JSON serialized string if the arraySerializer is set to `stringify` and the array is empty", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
			arraySerializer: "stringify",
		});

		const url = makeURL("https://example.com", {
			params: {
				key: "value",
				arr: [],
			},
		});

		expect(url).toBe("https://example.com?key=value&arr=%5B%5D");
	});

	it("should repeat the query parameters as a string if the arraySerializer is set to `repeat`", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
			arraySerializer: "repeat",
		});

		const url = makeURL("https://example.com", {
			params: {
				key: "value",
				arr: ["item1", "item2"],
			},
		});
		expect(url).toBe("https://example.com?key=value&arr=item1&arr=item2");
	});

	it("should not add the query parameters as a string if the arraySerializer is set to `repeat` and the array is empty", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
			arraySerializer: "repeat",
		});

		const url = makeURL("https://example.com", {
			params: {
				key: "value",
				arr: [],
			},
		});
		expect(url).toBe("https://example.com?key=value");
	});

	it("should serialize the query parameters as a comma separated string if the arraySerializer is set to `comma`", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
			arraySerializer: "comma",
		});

		const url = makeURL("https://example.com", {
			params: {
				key: "value",
				arr: ["item1", "item2"],
			},
		});
		expect(url).toBe("https://example.com?key=value&arr=item1%2Citem2");
	});

	it("should serialize the query parameters as an empty key if the arraySerializer is set to `comma` and the array is empty", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
			arraySerializer: "comma",
		});

		const url = makeURL("https://example.com", {
			params: {
				key: "value",
				arr: [],
			},
		});
		expect(url).toBe("https://example.com?key=value&arr=");
	});

	it("should support the relative protocol `//` when strict is set to false", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("//example.com", "blog", "post/1");
		expect(url).toBe("//example.com/blog/post/1");
	});

	it("should treat the relative protocol `//` as an absolute path when strict is set to false but the URL does not start with a domain", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: false,
			allowEmptyPathSegments: false,
		});

		const url = makeURL("//example", "blog", "post/1");
		expect(url).toBe("/example/blog/post/1");
	});

	it("should not support the relative protocol `//` when strict is set to true", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
		});

		expect(() => {
			makeURL("//example.com", "blog", "post/1");
		}).toThrow("The generated URL is not valid: //example.com/blog/post/1");
	});

	it("should detect the protocol even if it is splitted in several strings", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: false,
		});

		const url = makeURL(
			"htt",
			"p",
			"s:",
			"//example",
			".com",
			"blog",
			"post/1",
		);
		expect(url).toBe("https://example.com/blog/post/1");
	});

	it("should build valid URLs even if the strings provided are a mess", () => {
		// Set the configuration object to some default values
		setMakeURLDefaultConfig({
			forceProtocol: "auto",
			trailingSlash: "remove",
			strict: true,
			allowEmptyPathSegments: true,
		});

		const url = makeURL(
			"htt",
			"p",
			"",
			"s:",
			"//example",
			"",
			".com",
			"",
			" ",
			"blog",
			"post/1",
		);
		expect(url).toBe("https://example.com//%20/blog/post/1");
	});
});

describe("setMakeURLDefaultConfig", () => {
	it("should set the default configuration object", () => {
		const config: Partial<IConfig> = {
			...BASE_DEFAULT_MAKE_URL_CONFIG,
		};

		setMakeURLDefaultConfig(config);

		expect(getMakeURLDefaultConfig()).toEqual(config);
	});

	it("should merge the provided configuration object with the default configuration object", () => {
		const config: Partial<IConfig> = {
			...BASE_DEFAULT_MAKE_URL_CONFIG,
			trailingSlash: "remove",
			strict: false,
		};

		const expectedConfig: IConfig = {
			...BASE_DEFAULT_MAKE_URL_CONFIG,
			...config,
		};

		setMakeURLDefaultConfig(config);

		expect(getMakeURLDefaultConfig()).toEqual(expectedConfig);
	});
});

describe("getMakeURLDefaultConfig", () => {
	it("should return the default configuration object", () => {
		// First, reset the config values since they have been used in the previous tests
		setMakeURLDefaultConfig(BASE_DEFAULT_MAKE_URL_CONFIG);
		//
		const config = getMakeURLDefaultConfig();
		expect(config).toEqual(BASE_DEFAULT_MAKE_URL_CONFIG);
	});
});
