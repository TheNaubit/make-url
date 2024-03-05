<h1 align="center">
  🪄 make-url
  <br>
</h1>

<h4 align="center">A tiny URL builder library for TypeScript.</h4>

<p align="center">
  <a href="https://github.com/TheNaubit/make-url/actions">
    <img src="https://github.com/TheNaubit/make-url/actions/workflows/release.yml/badge.svg"
         alt="Build Status">
  </a>
  <a href="https://www.npmjs.com/package/@nauverse/make-url">
    <img src="https://img.shields.io/npm/v/@nauverse/make-url.svg?style=flat" alt="npm version">
  </a>
  <a href="https://bundlephobia.com/result?p=@nauverse/make-url">
    <img src="https://img.shields.io/bundlephobia/minzip/%40nauverse/make-url" alt="minzipped size">
  </a>
</p>

<p align="center">
  <a href="#what">What?</a> •
  <a href="#why">Why?</a> •
  <a href="#how">How?</a> •
  <a href="#typescript">TypeScript</a> •
  <a href="#guide-and-examples">Guide and examples</a> •
  <a href="#help">Help</a> •
  <a href="#contribute">Contribute</a>
</p>

## tl;dr
If you just want to try and you don't want to read this guide right now (although you should in the future if you decide to use the library), you can start quickly by:

### 1. Installing the dependency:
```bash
npm install --save @nauverse/make-url
```

### 2. Checking this example of use:
~~~ts
import { makeURL } from "@nauverse/make-url";

makeURL("https://api.example.com/", "/:id/:param2/:id///", {
  queryParams: {
    id: 1,
    param2: "678"
  }
});
// https://api.example.com/1/678/1
~~~
> I added too many slashes intentionally to showcase they can be removed automatically (you also have an option to disable that)

If you want to see more examples, jump to [here](#full-examples).

### 3. You are done! 🪄
Feel free to test and explore and if later on you need more guidance, read the whole guide and ask in the GitHub repo.

## What?

*make-url* is heavily inspired in the awesome [urlcat](https://www.npmjs.com/package/urlcat). It is a tiny JavaScript library that makes building URLs very convenient and prevents common mistakes. It is fully type-safe and highly configurable.

<br>
<p align="center">
  <img src="https://raw.githubusercontent.com/balazsbotond/urlcat/d5834df094b4e436ebf3ba3bf015857798f29675/docs/urlcat-basic-usage.svg#gh-light-mode-only">
  <img src="https://raw.githubusercontent.com/balazsbotond/urlcat/d5834df094b4e436ebf3ba3bf015857798f29675/docs/urlcat-basic-usage-dark.svg#gh-dark-mode-only">
</p>
<p align="center">
<i>Although the image above is from the `urlcat` package, this package behaves very similar so it is a good way to showcase its functionality</i>
</p>

### Features

<center>
  <table>
  <thead>
    <tr>
      <th align="center"><strong>v1</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td align="center">Latest version</td>
    </tr>
    <tr>
      <td align="center">No dependencies</td>
    </tr>
    <tr>
      <td align="center">1kB <a href="https://bundlephobia.com/package/@nauverse/make-url@latest">minified and gzipped</a></td>
    </tr>
    <tr>
      <td align="center" colspan="2">TypeScript types provided</td>
    </tr>
  </tbody>
  </table>
</center>

## Why?

When a dev wants to call an API or build an URL, they must make sure to check lots of things: adding parameters in the URL path, adding query parameters, maybe adding hash parameters, making sure it is a valid URL, mayberemoving trailing slashes and much, much more:

~~~js
const API_URL = 'https://api.example.com/';

function getUserPosts(id, blogId, limit, offset) {
  const requestUrl = `${API_URL}/users/${id}/blogs/${blogId}/posts?limit=${limit}&offset=${offset}`;
  // send HTTP request
}
~~~

As you can see, this minimal example is already rather hard to read. It is also incorrect:

- I forgot that there was a trailing slash at the end of the `API_URL` constant so this resulted in a URL containing duplicate slashes (`https://api.example.com//users`).
- The embedded values need to be escaped using `encodeURIComponent`

I can use the built-in `URL` class to prevent duplicate slashes and `URLSearchParams` to escape the query string. But I still need to escape all path parameters manually.

~~~js
const API_URL = 'https://api.example.com/';

function getUserPosts(id, blogId, limit, offset) {
  const escapedId = encodeURIComponent(id);
  const escapedBlogId = encodeURIComponent(blogId);
  const path = `/users/${escapedId}/blogs/${escapedBlogId}`;
  const url = new URL(path, API_URL);
  url.search = new URLSearchParams({ limit, offset });
  const requestUrl = url.href;
  // send HTTP request
}
~~~

Something like that should be an easy task, but it can be a real pain. That is why this library exists.

And you might wonder: why, if you are inspired in `urlcat`, don't just use that library?

Well, that library allows you to generate complete URLs with some protections but... it was not enough safe for me (and I also needed to support other URL formats like relative URLs).

~~~js
const API_URL = 'https://api.example.com/';
const SOME_SLUG = 'hey';

function getUserPosts(id, limit, offset) {
  const requestUrl = makeURL('api.example.com', SOME_SLUG, 'users/:id/posts', {
      queryParams: { 
        id,
        limit,
        offset 
      }
    });
  // The URL will be:
  // https://api.example.com/hey/users/<id_value>/?limit=<limit_value>&offset=<offset_value>
  // send HTTP request
}
~~~

So, what does this library offer?
- Escaping all parameters
- Concatenating all parts (there will always be exactly one <kbd>/</kbd> and <kbd>?</kbd> character between them)
- Support for query parameters (you can pass any value as a query parameter key and it will be added as a valid query parameter to the URL)
- Support for hash parameters
- Support for URL parameters (with the `:<query key>` template in the URL)
- Fully type-safe
- Trailing slash handling (you can choose if always add or remove it)
- Global default config option (if you use always the same settings, you can make it constant, instead of having to specify them on each function call)
- URL type detection (if it is a full URL, a relative URL, an absolute URL...)
- Protocol enforcing
- Enable or disable removing extra slashes
- Production-ready
- Zero dependencies


## How?

### Install

Currently, the package is distributed via NPM.

```bash
npm install --save @nauverse/make-url
```

### Usage with Node

Node 18 and above are officially supported, though you may have luck using it with an earlier Node version.
Since the code uses the `URL` and `URLSearchParams` classes internally, which aren't available below Node v10, the library is known not to work with those versions.

The package comes with CJS and ESM modules.

## TypeScript

This library provides its own type definitions. "It just works", no need to install anything from `@types`.

## Guide and examples
> A good contribution for this repo would be a more detailed guide about how to use it.

The most important function that this package offers is `makeURL`.
You can call with with any amount of string values and optionally at the end with a config object.

A config object has the following interface:
~~~ts
export interface IParams {
  queryParams: Record<string, unknown>;
  hashParam: string;
  config: {
    forceProtocol: "http" | "https" | "none" | "auto" | "auto-insecure";
    trailingSlash: "add" | "remove";
    strict: boolean;
    allowEmptyPathSegments: boolean;
  };
}
~~~
Every field in the object is optional.

`queryParams` is an optional object that contains key-value pairs. If in the generated URL is there any match of `:<key>`, being `<key>` any of the keys in that object, the matches will be replaced with the value of their respective keys.
If they are not replaced in the URL, they will be added to the URL as query parameters.

Let's see some examples:
### makeURL with only query parameters
~~~ts
makeURL("https://example.com", {
  queryParams: {
    id: 12,
    name: "test"
  }
});
// https://example.com?id=12&name=test
~~~

### makeURL with query parameters and also URL params
~~~ts
makeURL("https://example.com", ":id/", {
  queryParams: {
    id: 12,
    name: "test"
  }
});
// https://example.com/12?name=test
~~~

> Notice that the `queryParams` values can be of any type. I used in the examples `string` and `number` types, but you can use anything (including objects) and it will be always safely casted. Don't worry if the string contains invalid characters, everything is safely encoded in this library!

---

`hashParam` is another optional field containg a string.
>  Don't worry if the string contains invalid characters, everything is safely encoded in this library!

Let's see one example:
### makeURL with a hash parameter
~~~ts
makeURL("https://example.com", {
  hashParam: "test"
});
// https://example.com#test
~~~

---

Now it is time to talk about the `config` object.
### `allowEmptyPathSegments`
> By default, it is set to `false`

This setting is made to support the RFC 3986. That RFC allows empty path segments in URLs (for example, https://example.com//users////2).

By default, this library has this option disabled but you can enable it in any function call you need it or globally by using the `setMakeURLDefaultConfig` function.

Some examples:
#### makeURL with `allowEmptyPathSegments: true`
~~~ts
makeURL("https://example.com", "//test///a", {
  config: {
    allowEmptyPathSegments: true
  }
});
// https://example.com//test///a
~~~

#### makeURL with `allowEmptyPathSegments: false`
~~~ts
makeURL("https://example.com", "//test///a", {
  config: {
    allowEmptyPathSegments: false
  }
});
// https://example.com/test/a
~~~

### `trailingSlash`
> By default, it is set to `add`

Some servers expect trailing slashes, some does not support it. With this setting, you can configure the behaviour however you want.

By default, this library has this option set to `add` but you can change it in any function call you need it or globally by using the `setMakeURLDefaultConfig` function.

It has two possible values: `add` and `remove`.

Some examples:
#### makeURL with `trailingSlash: 'add'`
~~~ts
makeURL("https://example.com", "/test/a", {
  config: {
    trailingSlash: 'add'
  }
});
// https://example.com/test/a/
~~~

#### makeURL with `trailingSlash: 'remove'`
~~~ts
makeURL("https://example.com", "/test/a/", {
  config: {
    trailingSlash: 'remove'
  }
});
// https://example.com/test/a
~~~

### `forceProtocol`
> By default, it is set to `auto`

It has 5 possible values: `http`, `https`, `none`, `auto`, `auto-insecure`.

`http` will always add the `http://` to the URL if it does not contain a protocol, <b>without checking if the URL is a full URL, a relative one or an absolute one</b>:
#### makeURL with `forceProtocol: 'http'` and a full URL without protocol
~~~ts
makeURL("example.com", "/test/a", {
  config: {
    forceProtocol: 'http'
  }
});
// http://example.com/test/a
~~~

#### makeURL with `forceProtocol: 'http'` and a full URL with protocol
~~~ts
makeURL("https://example.com", "/test/a", {
  config: {
    forceProtocol: 'http'
  }
});
// https://example.com/test/a
~~~

#### makeURL with `forceProtocol: 'http'` and a relative URL
~~~ts
makeURL("test/a", {
  config: {
    forceProtocol: 'http'
  }
});
// http://test/a
~~~

#### makeURL with `forceProtocol: 'http'` and an absolute URL
~~~ts
makeURL("/test/a", {
  config: {
    forceProtocol: 'http'
  }
});
// http://test/a
~~~

> This means you should only use `forceProtocol: 'http'` if you are 100% sure the URLs you will build with that function will be always full URLs. If not, you should use `auto`, `auto-insecure` or `none`.

---

`https` will always add the `https://` to the URL if it does not contain a protocol, <b>without checking if the URL is a full URL, a relative one or an absolute one</b>:
#### makeURL with `forceProtocol: 'https'` and a full URL without protocol
~~~ts
makeURL("example.com", "/test/a", {
  config: {
    forceProtocol: 'https'
  }
});
// https://example.com/test/a
~~~

#### makeURL with `forceProtocol: 'https'` and a full URL with protocol
~~~ts
makeURL("http://example.com", "/test/a", {
  config: {
    forceProtocol: 'https'
  }
});
// http://example.com/test/a
~~~

#### makeURL with `forceProtocol: 'https'` and a relative URL
~~~ts
makeURL("test/a", {
  config: {
    forceProtocol: 'https'
  }
});
// https://test/a
~~~

#### makeURL with `forceProtocol: 'https'` and an absolute URL
~~~ts
makeURL("/test/a", {
  config: {
    forceProtocol: 'https'
  }
});
// https://test/a
~~~

> This means you should only use `forceProtocol: 'https'` if you are 100% sure the URLs you will build with that function will be always full URLs. If not, you should use `auto`, `auto-insecure` or `none`.

---
`none` will not add any protocol to the URL, no matter if it has one, it doesn't have one, it is a full URL, it is a relative URL, an absolute one...:
#### makeURL with `forceProtocol: 'none'` and a full URL without protocol
~~~ts
makeURL("example.com", "/test/a", {
  config: {
    forceProtocol: 'none'
  }
});
// example.com/test/a
~~~

#### makeURL with `forceProtocol: 'none'` and a full URL with protocol
~~~ts
makeURL("https://example.com", "/test/a", {
  config: {
    forceProtocol: 'none'
  }
});
// https://example.com/test/a
~~~

#### makeURL with `forceProtocol: 'none'` and a relative URL
~~~ts
makeURL("test/a", {
  config: {
    forceProtocol: 'none'
  }
});
// test/a
~~~

#### makeURL with `forceProtocol: 'none'` and an absolute URL
~~~ts
makeURL("/test/a", {
  config: {
    forceProtocol: 'none'
  }
});
// /test/a
~~~
---

`auto` is the safe and smart option. It will add the `https://` protocol if the generated URL is a full URL (containing a domain) and it doesn't have already a protocol. In any other case, it won't add anything to it. This is the recommened mode in production if you want to have something to "set and forget":
#### makeURL with `forceProtocol: 'auto'` and a full URL without protocol
~~~ts
makeURL("example.com", "/test/a", {
  config: {
    forceProtocol: 'auto'
  }
});
// https://example.com/test/a
~~~

#### makeURL with `forceProtocol: 'auto'` and a full URL with protocol
~~~ts
makeURL("http://example.com", "/test/a", {
  config: {
    forceProtocol: 'auto'
  }
});
// http://example.com/test/a
~~~

#### makeURL with `forceProtocol: 'auto'` and a relative URL
~~~ts
makeURL("test/a", {
  config: {
    forceProtocol: 'auto'
  }
});
// test/a
~~~

#### makeURL with `forceProtocol: 'auto'` and an absolute URL
~~~ts
makeURL("/test/a", {
  config: {
    forceProtocol: 'auto'
  }
});
// /test/a
~~~
---

`auto-insecure` is an alternative smart option to `auto`. It will add the `http://` protocol if the generated URL is a full URL (containing a domain) and it doesn't have already a protocol. In any other case, it won't add anything to it. 

It is called `insecure` not because it is not safe to use but because it uses the `http` protocol, so I prefer to make it noticeable for the devs.

#### makeURL with `forceProtocol: 'auto-insecure'` and a full URL without protocol
~~~ts
makeURL("example.com", "/test/a", {
  config: {
    forceProtocol: 'auto-insecure'
  }
});
// http://example.com/test/a
~~~

#### makeURL with `forceProtocol: 'auto-insecure'` and a full URL with protocol
~~~ts
makeURL("https://example.com", "/test/a", {
  config: {
    forceProtocol: 'auto-insecure'
  }
});
// https://example.com/test/a
~~~

#### makeURL with `forceProtocol: 'auto-insecure'` and a relative URL
~~~ts
makeURL("test/a", {
  config: {
    forceProtocol: 'auto-insecure'
  }
});
// test/a
~~~

#### makeURL with `forceProtocol: 'auto-insecure'` and an absolute URL
~~~ts
makeURL("/test/a", {
  config: {
    forceProtocol: 'auto-insecure'
  }
});
// /test/a
~~~
> Although it is not recommended to use `http` in production; if you want to use `auto` in your local environment and you have issues with the `https`, you could use a setting like: `forceProtocol: process.env.NODE_ENV === "production" ? "auto" : "auto-insecure"`

### `strict`
> By default, it is set to `false`

It is a boolean, so it can be `true` or `false`. I set it to `false` by default to provide the most flexible option by default.

This option enforces that the final URL string you get from calling `makeURL` is a totally valid complete URL (like `https://example.com/my/path/`). If it is not, it will throw an error, so you can catch it and handle the exception.

The drawback is that relative and absolute URLs won't work with this option set to `true`, since those URLs are not "fully valid URLs".

#### makeURL with `strict: true` and an full URL
~~~ts
makeURL("example.com", "/test/a", {
  config: {
    strict: true
  }
});
// https://example.com/test/a
~~~

#### makeURL with `strict: true` and an full URL without protocol
~~~ts
makeURL("example.com", "/test/a", {
  config: {
    strict: true,
    forceProtocol: "none"
  }
});
// Throws an error
~~~

#### makeURL with `strict: true` and an full URL with an invalid domain
~~~ts
makeURL("example", "/test/a", {
  config: {
    strict: true
  }
});
// Throws an error
~~~

#### makeURL with `strict: true` and a relative URL
~~~ts
makeURL("test/a", {
  config: {
    strict: true
  }
});
// Throws an error
~~~

#### makeURL with `strict: true` and an absolute URL
~~~ts
makeURL("/test/a", {
  config: {
    strict: true
  }
});
// Throws an error
~~~

---

#### makeURL with `strict: false` and an full URL
~~~ts
makeURL("example.com", "/test/a", {
  config: {
    strict: false
  }
});
// https://example.com/test/a
~~~

#### makeURL with `strict: false` and an full URL without protocol
~~~ts
makeURL("example.com", "/test/a", {
  config: {
    strict: false,
    forceProtocol: "none"
  }
});
// example.com/test/a
~~~

#### makeURL with `strict: false` and an full URL with an invalid domain
~~~ts
makeURL("example", "/test/a", {
  config: {
    strict: false
  }
});
// https://example/test/a
~~~

#### makeURL with `strict: false` and a relative URL
~~~ts
makeURL("test/a", {
  config: {
    strict: false
  }
});
// test/a
~~~

#### makeURL with `strict: false` and an absolute URL
~~~ts
makeURL("/test/a", {
  config: {
    strict: false
  }
});
// /test/a
~~~

> So, the best and most secure option is to have `strict: true`, but that won't allow you to use relative and absolute URLs. So my advice is to keep `strict: true` globally and disable it in the function calls where you know you need to build relative and/or absolute URLs.

---

As we explained, you can set the config by passing a config object as the last item in any `makeURL` call. But if you uses most of the time the same settings, you might prefer to set the config globally and only pass the config object in the `makeURL` calls when you want to override them.

You can achieve it by calling the function `setMakeURLDefaultConfig`.
> If you want to set the config globally, I recommend you to call this function the earliest you can in your project, so you have the guarantee the global config is set before you call the `makeURL` function. For example, in a Node app, you might want to call it at the beginning of your entry file. In Next.js you might want to call it in the root server layout or in the middleware (if used server-side) or in a root client layout (of used client-side).

The `setMakeURLDefaultConfig` accepts only one parameter with a partial config object (meaning you don't need to set every setting).
For example:
### setMakeURLDefaultConfig setting `strict: true` globally
~~~ts
setMakeURLDefaultConfig({
  strict: true
});
~~~

---

You probably won't ever need to get the current global config, but if you need it, there is a function you can call: `getMakeURLDefaultConfig`:
### getMakeURLDefaultConfig
~~~ts
getMakeURLDefaultConfig();
/*
{
  forceProtocol: "auto",
  trailingSlash: "add",
  strict: false,
  allowEmptyPathSegments: false
}
*/
~~~

### getMakeURLDefaultConfig after setting `strict: true` globally
~~~ts
setMakeURLDefaultConfig({
  strict: true
});
getMakeURLDefaultConfig();
/*
{
  forceProtocol: "auto",
  trailingSlash: "add",
  strict: true,
  allowEmptyPathSegments: false
}
*/
~~~
---
### Full examples
To finish with this "guide", I want to provide some examples combining several of the explained settings:
#### Example 1
~~~ts
makeURL("example.com/", "/test/:id///edit/", {
  queryParams: {
    id: 1,
    name: "John"
  },
  hashParam: "test",
  config: {
    forceProtocol: "auto",
    trailingSlash: "remove",
    strict: true,
    allowEmptyPathSegments: false
  }
});
// https://example.com/test/1/edit?name=John#test
~~~

#### Example 2
~~~ts
// Default global settings set in the entry file
setMakeURLDefaultConfig({
  forceProtocol: "auto",
  trailingSlash: "remove",
  strict: true,
  allowEmptyPathSegments: false
});
//

makeURL("https://api.example.com/", "/:id/:param2/:id///", {
  queryParams: {
    id: 1,
    param2: "678"
  }
});
// https://api.example.com/1/678/1
~~~

## Help

Thank you for using *make-url*!

If you need any help using this library, feel free to [create a GitHub issue](https://github.com/TheNaubit/make-url/issues/new/choose), and ask your questions. I'll try to answer as quickly as possible.

## Contribute

Contributions of any kind (pull requests, bug reports, feature requests, documentation, design) are more than welcome! If you like this project and want to help, but feel like you are stuck, feel free to contact the maintainers.

### Building from source

Building the project should be quick and easy. If it isn't, it's the maintainer's fault. Please report any problems with building in a GitHub issue.

You need to have a reasonably recent version of node.js to build *make-url*. 
Tested on node version 18.0.0 and npm version 8.6.0.

First, clone the git repository:

```
git clone git@github.com:TheNaubit/make-url.git
```

Then switch to the newly created make-url directory and install the dependencies:

```
cd make-url
npm install
```

You can then run the unit tests to verify that everything works correctly:

```
npm run test:run
```

And finally, build the library:

```
npm run build
```

The output will appear in the `dist` directory.

Happy hacking!

## Contributors ✨

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
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