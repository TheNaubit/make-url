import { describe, it, expect } from "vitest";
import {
  setMakeURLDefaultConfig,
  makeURL,
  getMakeURLDefaultConfig,
  BASE_DEFAULT_MAKE_URL_CONFIG
} from "./index";
import type { IConfig } from "./types";

describe("makeURL", () => {
  it("should generate a valid URL with trailing slash using string fragments", () => {
    // Set the configuration object to some default values
    setMakeURLDefaultConfig({
      forceProtocol: "auto",
      trailingSlash: "add",
      strict: true,
      allowEmptyPathSegments: true
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
      allowEmptyPathSegments: true
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
      allowEmptyPathSegments: true
    });

    const url = makeURL("https://example.com", {
      queryParams: { key: "value" }
    });
    expect(url).toBe("https://example.com/?key=value");
  });

  it("should generate a valid URL without trailing slash containing query parameters", () => {
    // Set the configuration object to some default values
    setMakeURLDefaultConfig({
      forceProtocol: "auto",
      trailingSlash: "remove",
      strict: true,
      allowEmptyPathSegments: true
    });

    const url = makeURL("https://example.com", {
      queryParams: { key: "value" }
    });
    expect(url).toBe("https://example.com?key=value");
  });

  it("should generate a valid URL with trailing slash containing hash parameters", () => {
    // Set the configuration object to some default values
    setMakeURLDefaultConfig({
      forceProtocol: "auto",
      trailingSlash: "add",
      strict: true,
      allowEmptyPathSegments: true
    });

    const url = makeURL("https://example.com", {
      hashParams: { section: "about" }
    });
    expect(url).toBe("https://example.com/#section=about");
  });

  it("should generate a valid URL without trailing slash containing hash parameters", () => {
    // Set the configuration object to some default values
    setMakeURLDefaultConfig({
      forceProtocol: "auto",
      trailingSlash: "remove",
      strict: true,
      allowEmptyPathSegments: true
    });

    const url = makeURL("https://example.com", {
      hashParams: { section: "about" }
    });
    expect(url).toBe("https://example.com#section=about");
  });

  it("should throw an error if no params are provided", () => {
    expect(() => {
      makeURL();
    }).toThrow("makeURL must receive at least one string item");
  });

  it("should throw an error if no string params are provided", () => {
    expect(() => {
      makeURL({
        queryParams: {
          key: "value"
        }
      });
    }).toThrow("makeURL must receive at least one string item");
  });

  it("should throw an error if the first param provided is not a string", () => {
    expect(() => {
      makeURL(
        {
          queryParams: {
            key: "value"
          }
        },
        "example.com"
      );
    }).toThrow("makeURL must receive at least one string item");
  });

  it("should throw an error if any other than the last param is a config object", () => {
    expect(() => {
      makeURL(
        "example.com",
        {
          queryParams: {
            key: "value"
          }
        },
        "test"
      );
    }).toThrow("Params config object argument must be the last argument");
  });

  it("should remove empty path segments if allowEmptyPathSegments is false", () => {
    // Set the configuration object to some default values
    setMakeURLDefaultConfig({
      forceProtocol: "auto",
      trailingSlash: "remove",
      strict: true,
      allowEmptyPathSegments: true // Just to test the config is changed when calling the makeURL function
    });

    const url = makeURL(
      "https://example.com",
      "",
      "path",
      "",
      "to",
      "",
      "resource",
      { config: { allowEmptyPathSegments: false } }
    );
    expect(url).toBe("https://example.com/path/to/resource");
  });

  it("should not remove empty path segments if allowEmptyPathSegments is true", () => {
    // Set the configuration object to some default values
    setMakeURLDefaultConfig({
      forceProtocol: "auto",
      trailingSlash: "remove",
      strict: true,
      allowEmptyPathSegments: false // Just to test the config is changed when calling the makeURL function
    });

    const url = makeURL(
      "https://example.com",
      "",
      "/path",
      "",
      "to",
      "",
      "resource",
      { config: { allowEmptyPathSegments: true } }
    );
    expect(url).toBe("https://example.com///path//to//resource");
  });

  it("should throw an error if strict is set to true and a relative URL is created", () => {
    // Set the configuration object to some default values
    setMakeURLDefaultConfig({
      forceProtocol: "auto",
      trailingSlash: "remove",
      strict: true,
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
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
      allowEmptyPathSegments: false
    });

    const url = makeURL("example.com", "/blog", "post/1");
    expect(url).toBe("http://example.com/blog/post/1");
  });
});

describe("setMakeURLDefaultConfig", () => {
  it("should set the default configuration object", () => {
    const config: Partial<IConfig> = {
      ...BASE_DEFAULT_MAKE_URL_CONFIG
    };

    setMakeURLDefaultConfig(config);

    expect(getMakeURLDefaultConfig()).toEqual(config);
  });

  it("should merge the provided configuration object with the default configuration object", () => {
    const config: Partial<IConfig> = {
      ...BASE_DEFAULT_MAKE_URL_CONFIG,
      trailingSlash: "remove",
      strict: false
    };

    const expectedConfig: IConfig = {
      ...BASE_DEFAULT_MAKE_URL_CONFIG,
      ...config
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
