<h1 align="center">
  make-url
  <br>
</h1>

<h4 align="center">A tiny, dependency-free URL builder for TypeScript and JavaScript that gets the edge cases right.</h4>

<p align="center">
  <a href="https://github.com/TheNaubit/make-url/actions/workflows/ci.yml">
    <img src="https://github.com/TheNaubit/make-url/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status">
  </a>
  <a href="https://github.com/TheNaubit/make-url/actions/workflows/release.yml">
    <img src="https://github.com/TheNaubit/make-url/actions/workflows/release.yml/badge.svg?branch=main" alt="Release status">
  </a>
  <a href="https://www.npmjs.com/package/@nauverse/make-url">
    <img src="https://img.shields.io/npm/v/@nauverse/make-url.svg?style=flat" alt="npm version">
  </a>
  <a href="https://bundlephobia.com/result?p=@nauverse/make-url">
    <img src="https://img.shields.io/bundlephobia/minzip/%40nauverse/make-url" alt="minzipped size">
  </a>
  <a href="https://github.com/TheNaubit/make-url/blob/main/LICENSE">
    <img src="https://img.shields.io/npm/l/@nauverse/make-url.svg?style=flat" alt="license">
  </a>
</p>

<p align="center">
  <a href="#tldr">tl;dr</a> •
  <a href="#why-make-url">Why make-url?</a> •
  <a href="#installation">Installation</a> •
  <a href="#guide">Guide</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#typescript">TypeScript</a> •
  <a href="#help">Help</a> •
  <a href="#contribute">Contribute</a>
</p>

## tl;dr

```bash
npm install @nauverse/make-url
```

~~~ts
import { makeURL } from "@nauverse/make-url";

makeURL("https://api.example.com/", "/users/:id/posts/", {
  params: { id: 42, limit: 10, tags: ["news", "tech"] },
  hash: "comments",
});
// https://api.example.com/users/42/posts?limit=10&tags=news&tags=tech#comments
~~~

Pass any number of fragments, then optionally an options object. `:id` is replaced in the path, every other param becomes a query param, everything is encoded, and the slashes are cleaned up.

## Why make-url?

Building URLs by hand looks easy until the details show up:

~~~js
const API_URL = "https://api.example.com/";

// Wrong: "https://api.example.com//users/..." and nothing is encoded
const url = `${API_URL}/users/${id}/posts?limit=${limit}&search=${search}`;
~~~

The built-in `URL` and `URLSearchParams` classes encode the query, but you still have to encode every path value yourself and handle the slashes between the base URL and the path. That is what make-url does for you, in one call:

~~~ts
makeURL("https://api.example.com/", "/users/:id/posts", {
  params: { id: "a/b", limit: 10, search: "café & more" },
});
// https://api.example.com/users/a%2Fb/posts?limit=10&search=caf%C3%A9+%26+more
~~~

### make-url vs urlcat and url-join

make-url was inspired by [urlcat](https://www.npmjs.com/package/urlcat), and it covers more cases with a smaller bundle. Every output below was produced by running both libraries (urlcat 3.1.0, url-join 5.0.0, make-url 1.x):

| Case | urlcat | url-join | make-url |
| ---- | ------ | -------- | -------- |
| More than two fragments: `("https://api.example.com", "v1", "users")` | `https://api.example.com/v1?0=u&1=s&2=e&3=r&4=s` (the third argument is read as params) | `https://api.example.com/v1/users` | `https://api.example.com/v1/users` |
| Hash | No option (a `#` written in the path is not encoded: `#a b`) | No option (same) | `hash: "install guide"` gives `#install%20guide` |
| Domain without protocol: `("example.com", "x")` | `example.com/x` | `example.com/x` | `https://example.com/x` (configurable with `forceProtocol`) |
| Trailing slash | Kept as written | Kept as written | Removed or added, your choice (`trailingSlash`) |
| Arrays in the query: `tags: ["a", "b"]` | `tags%5B0%5D=a&tags%5B1%5D=b` | No params support | `tags=a&tags=b`, or `tags=a%2Cb`, or JSON (`arraySerializer`) |
| Objects in the query: `f: { a: 1 }` | Bracket notation (`f%5Ba%5D=1`) | No params support | JSON (`f=%7B%22a%22%3A1%7D`) |
| Empty path param: `(":id", { id: "" })` | Throws | No params support | Removes the empty segment |
| International domain: `https://münchen.de` | `https://münchen.de/x` | `https://münchen.de/x` | `https://xn--mnchen-3ya.de/x` (punycode, valid everywhere) |
| URL validation | None | None | `strict: true` throws if the result is not a complete URL |
| Global defaults | No | No | `setMakeURLDefaultConfig` |
| Size (minified + gzipped, dependencies included) | 14.4 kB (it depends on `qs`) | 0.4 kB (joins strings only) | 2.9 kB, zero dependencies |
| Last release | January 2023 | March 2022 | Maintained |

### Features

- Zero dependencies, ESM and CommonJS builds, TypeScript types included
- Any number of fragments: the protocol, the domain and the path can be split however you like
- URL params (`:id`) replaced in the path, never in the host or the port
- Query params of any type: strings, numbers, booleans, dates, objects and arrays (three array formats)
- Hash support, including client-side routes (`#/users/1?tab=a`)
- A query or hash already written in the last fragment is kept
- Safe encoding everywhere, without encoding existing escapes (`%20`) twice
- Smart protocol handling: adds `https://` only when there is a domain, and keeps `wss://`, `myapp://`, `mailto:` or the relative protocol (`//example.com`)
- Hosts: domains, international domains (punycode), IPv4, IPv6 (`[::1]`), `localhost`, ports and credentials (`user:password@`)
- Configurable trailing slash, empty path segments and validation (`strict`)
- Global defaults so you do not repeat your config

## Installation

```bash
npm install @nauverse/make-url
```

~~~ts
// ESM
import { makeURL } from "@nauverse/make-url";
// CommonJS
const { makeURL } = require("@nauverse/make-url");
~~~

It runs in every modern browser and in Node.js 22 and later, since it only uses the standard `URL` and `URLSearchParams` APIs.

## Guide

`makeURL` takes one or more string fragments, optionally followed by an options object with three optional fields: `params`, `hash` and `config`. The options object must be the last argument.

### Fragments

The fragments are joined with `/`, and repeated slashes are removed:

~~~ts
makeURL("https://example.com/", "/blog/", "//posts/", "1");
// https://example.com/blog/posts/1
~~~

A fragment can contain several path segments (`"blog/posts"`), and the protocol, the domain and the port can be split across fragments:

~~~ts
makeURL("https://example.com", ":8080", "api");
// https://example.com:8080/api
~~~

Without a domain, you get a relative or an absolute path:

~~~ts
makeURL("blog", "posts/1");
// blog/posts/1
~~~

~~~ts
makeURL("/blog", "posts/1");
// /blog/posts/1
~~~

### URL params and query params

Each key of `params` found in the path as `:<key>` is replaced by its encoded value. The other params are added to the query:

~~~ts
makeURL("https://example.com", "users/:id", {
  params: { id: 12, tab: "posts" },
});
// https://example.com/users/12?tab=posts
~~~

A key only matches whole names: `:id` does not match the start of `:identifier`.

~~~ts
makeURL("https://example.com", ":identifier/:id", {
  params: { id: 1, identifier: "abc" },
});
// https://example.com/abc/1
~~~

Values can be of any type. `undefined` and `null` are skipped, dates are sent as ISO strings and objects as JSON:

~~~ts
makeURL("https://example.com", "search", {
  params: { q: "café", page: 2, draft: false, from: new Date(0), missing: undefined },
});
// https://example.com/search?q=caf%C3%A9&page=2&draft=false&from=1970-01-01T00%3A00%3A00.000Z
~~~

An empty value removes its path segment:

~~~ts
makeURL("https://example.com", "users/:id/posts", {
  params: { id: "" },
});
// https://example.com/users/posts
~~~

Arrays always go to the query (see [`arraySerializer`](#arrayserializer)), even when the path contains their key.

### Query and hash in the fragments

A query or a hash written in the last fragment is kept. The params are added after the existing query, and the `hash` option replaces the existing hash:

~~~ts
makeURL("https://example.com/search?sort=new", {
  params: { q: "shoes" },
});
// https://example.com/search?sort=new&q=shoes
~~~

In any other fragment, `?` and `#` are encoded, since they can not be part of a query or a hash there.

### Hash

~~~ts
makeURL("https://example.com", "docs", { hash: "getting started" });
// https://example.com/docs#getting%20started
~~~

A leading `#` is ignored, and `/`, `?`, `:` and `@` are kept, so client-side routes work:

~~~ts
makeURL("https://example.com", { hash: "#/users/1?tab" });
// https://example.com#/users/1?tab
~~~

### Hosts

International domains are converted to punycode. IPv6 addresses, `localhost`, ports and credentials are supported:

~~~ts
makeURL("münchen.de", "straße");
// https://xn--mnchen-3ya.de/stra%C3%9Fe
~~~

~~~ts
makeURL("http://[::1]:8080", "api");
// http://[::1]:8080/api
~~~

~~~ts
makeURL("http://localhost:3000", "api", "users");
// http://localhost:3000/api/users
~~~

~~~ts
makeURL("https://user:password@example.com", "private");
// https://user:password@example.com/private
~~~

Relative paths and file names are not mistaken for domains:

~~~ts
makeURL("./docs", "index.html");
// ./docs/index.html
~~~

### Protocols

Any protocol followed by `//` is kept, and so are `mailto:`, `tel:`, `sms:`, `urn:` and `data:`:

~~~ts
makeURL("wss://example.com", "socket");
// wss://example.com/socket
~~~

~~~ts
makeURL("mailto:hello@example.com", { params: { subject: "Hi there" } });
// mailto:hello@example.com?subject=Hi+there
~~~

The relative protocol (`//`) is kept when it is followed by a domain. Otherwise the URL becomes an absolute path:

~~~ts
makeURL("//example.com", "test/a");
// //example.com/test/a
~~~

~~~ts
makeURL("//example", "test/a");
// /example/test/a
~~~

When there is no protocol, [`forceProtocol`](#forceprotocol) decides what to add.

## Configuration

| Option | Values | Default | What it does |
| ------ | ------ | ------- | ------------ |
| [`forceProtocol`](#forceprotocol) | `"auto"`, `"auto-insecure"`, `"http"`, `"https"`, `"none"` | `"auto"` | The protocol added when the URL has none |
| [`trailingSlash`](#trailingslash) | `"remove"`, `"add"` | `"remove"` | Whether the path ends with a slash |
| [`allowEmptyPathSegments`](#allowemptypathsegments) | `true`, `false` | `false` | Whether repeated slashes are kept |
| [`arraySerializer`](#arrayserializer) | `"repeat"`, `"comma"`, `"stringify"` | `"repeat"` | How arrays are added to the query |
| [`strict`](#strict) | `true`, `false` | `false` | Whether to throw when the result is not a complete URL |

Pass them in `config` for one call, or set them for every call with [`setMakeURLDefaultConfig`](#global-defaults). Options set to `undefined` keep their default value.

### `forceProtocol`

It only applies when the first fragment has no protocol. A protocol you write is always kept.

- `auto`: adds `https://` if the URL starts with a domain.
- `auto-insecure`: adds `http://` if the URL starts with a domain.
- `https` or `http`: always adds that protocol.
- `none`: never adds a protocol.

~~~ts
makeURL("example.com", "blog", { config: { forceProtocol: "auto" } });
// https://example.com/blog
~~~

~~~ts
makeURL("blog", "post/1", { config: { forceProtocol: "auto" } });
// blog/post/1
~~~

~~~ts
makeURL("example.com", "blog", { config: { forceProtocol: "auto-insecure" } });
// http://example.com/blog
~~~

~~~ts
makeURL("blog", "post/1", { config: { forceProtocol: "https" } });
// https://blog/post/1
~~~

~~~ts
makeURL("example.com", "blog", { config: { forceProtocol: "none" } });
// example.com/blog
~~~

### `trailingSlash`

~~~ts
makeURL("https://example.com", "test/a", { config: { trailingSlash: "add" } });
// https://example.com/test/a/
~~~

~~~ts
makeURL("https://example.com", "test/a/", { config: { trailingSlash: "remove" } });
// https://example.com/test/a
~~~

### `allowEmptyPathSegments`

[RFC 3986](https://www.rfc-editor.org/rfc/rfc3986) allows empty path segments (`https://example.com//users`), but most servers do not expect them, so they are removed by default. Set it to `true` to keep every slash you write:

~~~ts
makeURL("https://example.com", "//test///a", {
  config: { allowEmptyPathSegments: true },
});
// https://example.com//test///a
~~~

~~~ts
makeURL("https://example.com", "//test///a", {
  config: { allowEmptyPathSegments: false },
});
// https://example.com/test/a
~~~

### `arraySerializer`

~~~ts
makeURL("https://example.com", "test", {
  params: { arr: ["a", "b", "c"] },
  config: { arraySerializer: "repeat" },
});
// https://example.com/test?arr=a&arr=b&arr=c
~~~

~~~ts
makeURL("https://example.com", "test", {
  params: { arr: ["a", "b", "c"] },
  config: { arraySerializer: "comma" },
});
// https://example.com/test?arr=a%2Cb%2Cc
~~~

~~~ts
makeURL("https://example.com", "test", {
  params: { arr: ["a", "b", "c"] },
  config: { arraySerializer: "stringify" },
});
// https://example.com/test?arr=%5B%22a%22%2C%22b%22%2C%22c%22%5D
~~~

The items are serialized like single values, and `undefined` and `null` items are skipped. An empty array adds nothing with `repeat`, an empty value with `comma` and `[]` with `stringify`.

### `strict`

With `strict: true`, `makeURL` throws if the result is not a complete URL with a valid host (a domain, an IP address or `localhost`). Relative URLs, absolute paths and the relative protocol are rejected:

~~~ts
makeURL("example.com", "blog", { config: { strict: true } });
// https://example.com/blog
~~~

~~~ts
makeURL("/blog", "post/1", { config: { strict: true } });
// Throws: The generated URL is not valid: /blog/post/1
~~~

### Global defaults

Call `setMakeURLDefaultConfig` once, as early as possible (the entry file of your app), to change the defaults of every call. Each call starts from the base defaults, so pass every setting you want to change:

~~~ts
setMakeURLDefaultConfig({ trailingSlash: "add", strict: true });

makeURL("example.com", "blog");
// https://example.com/blog/
~~~

`getMakeURLDefaultConfig` returns a copy of the current defaults, and `BASE_DEFAULT_MAKE_URL_CONFIG` holds the base defaults:

~~~ts
getMakeURLDefaultConfig();
/*
{
  forceProtocol: "auto",
  trailingSlash: "remove",
  strict: false,
  allowEmptyPathSegments: false,
  arraySerializer: "repeat"
}
*/
~~~

## TypeScript

The package includes its type definitions. The types of the options are exported:

~~~ts
import { makeURL, type IConfig, type MakeURLOptions } from "@nauverse/make-url";

const config: Partial<IConfig> = { trailingSlash: "add" };
const options: MakeURLOptions = { params: { id: 1 }, config };

makeURL("example.com", "users/:id", options);
~~~

Exported types: `IConfig`, `IParams`, `MakeURLOptions`, `MakeURLArgs`, `TForceProtocol`, `TTrailingSlash` and `TArraySerializer`.

## Help

Thank you for using *make-url*!

If you need any help using this library, feel free to [create a GitHub issue](https://github.com/TheNaubit/make-url/issues/new/choose) and ask your questions. I'll try to answer as quickly as possible.

## Contribute

Contributions of any kind (pull requests, bug reports, feature requests, documentation, design) are more than welcome! Read the [contributing guide](./CONTRIBUTING.md) to get started (and [AGENTS.md](./AGENTS.md) if you use a coding agent).

## Contributors

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://nauverse.com"><img src="https://avatars.githubusercontent.com/u/22015497?v=4?s=100" width="100px;" alt="Al &#124; Naucode"/><br /><sub><b>Al &#124; Naucode</b></sub></a><br /><a href="#bug-TheNaubit" title="Bug reports">🐛</a> <a href="#code-TheNaubit" title="Code">💻</a> <a href="#doc-TheNaubit" title="Documentation">📖</a> <a href="#maintenance-TheNaubit" title="Maintenance">🚧</a> <a href="#test-TheNaubit" title="Tests">⚠️</a> <a href="#infra-TheNaubit" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
