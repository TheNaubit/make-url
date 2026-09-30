# make-url - agent guide

This is a publishable, dependency-free URL builder: `@nauverse/make-url`.
`makeURL(...fragments, options?)` joins fragments into a URL, replaces `:key` params in the path, adds the other params to the query, adds the hash, and cleans up protocols, hosts and slashes.

## Commands

Use **npm** only. Node.js `^22.14.0 || >=24.10.0` (`.nvmrc` has the recommended version).

```bash
npm install
npm run lint           # Biome
npm run typecheck      # tsc --noEmit
npm run test:coverage  # Vitest with coverage thresholds
npm run build          # vite build (ESM + UMD) and tsc declarations -> dist/
```

Run lint, typecheck, tests and build before you say a task is done. CI runs the same steps on Node.js 22, 24 and 26.

## Layout

```
src/
  index.ts              public exports (makeURL, config functions and types)
  makeURL.ts            orchestration: parse the arguments, assemble protocol + host + path, query, hash, strict check
  config.ts             base defaults (frozen), global defaults, config merging (undefined keys are ignored)
  types.ts              public types
  lib/assemble.ts       finds the protocol, the host and the path, even when they are split across fragments ("https:" + "//example" + ".com")
  lib/host.ts           host heuristic (domain with a TLD, IP, [IPv6], localhost; not a file name)
  lib/encode.ts         encoding: path segments, values, hash, domains (punycode), lone surrogates
  lib/path-params.ts    :key replacement in path segments
  lib/query.ts          value and array serialization, query string
  *.test.ts             makeURL.test.ts (original suite), regressions.test.ts and edge-cases.test.ts (bug fixes), readme.test.ts (runs every README example)
```

## Hard rules

1. **Steps run in this order**: parse arguments, split the inline query and hash of the last fragment, reassemble protocol and domain, encode the path and replace params, collapse slashes, trailing slash, query, hash, strict check. Slash cleanup must run after the params are replaced.
2. **Params are only replaced in the path**, never in the protocol, the host, the credentials or the port. A URL without host can never gain one from path fragments or params: its path never starts with "//", and a first segment that looks like a protocol ("https:", "javascript:") has its ":" encoded (RFC 3986, section 4.2).
3. **The host is never percent-encoded.** International domains become punycode (`encodeDomain`), credentials are percent-encoded.
4. **Literal fragments keep existing `%XX` escapes and `:`**. Values (params and the hash option) are fully encoded.
5. **`makeURL` never throws on string input** unless `strict` is on, the arguments are invalid (no leading string, options not last), or a param value would create a "." or ".." path segment (a path traversal: URL parsers resolve them, even percent-encoded).
10. **Param and hash values are untrusted.** They must never change the protocol, the host, the port, the credentials or the path structure. Without a host, a protocol is not added when the first path segment contains a param (the value would become the host). `javascript:` and `vbscript:` are never protocols.
6. **The README examples are tests.** A `makeURL(...)` call followed by a `// <output>` comment in a `~~~ts` block is run by `src/readme.test.ts`. Keep them true.
7. **Immutability.** Do not mutate inputs or shared state. `BASE_DEFAULT_MAKE_URL_CONFIG` is frozen and `getMakeURLDefaultConfig` returns a copy.
8. **No emojis** in code, comments or docs. No `console.log` (Biome `noConsole` is an error).
9. **Files stay small** (under 400 lines typical, 800 max).

## Testing

- TDD. Write the failing test first. Every bug fix gets a regression test.
- Keep coverage at 90% or more.
- After a build change, check the packed tarball in a fresh project: `require()`, ESM `import`, and TypeScript with `moduleResolution` `bundler` and `nodenext`. Relative imports use `.js` extensions for `nodenext`.

## Releases

- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`, `perf:`, `ci:`.
- Do not add "Co-Authored-By" or similar lines to commit messages.
- `semantic-release` runs in `.github/workflows/release.yml` on pushes to `main`. It sets the version, updates `CHANGELOG.md`, tags, creates the GitHub release and publishes. Do not bump `version` by hand.
- Publishing uses npm trusted publishing (OIDC) for `TheNaubit/make-url`, `release.yml` and the `npm` environment. There is no `NPM_TOKEN` or personal access token. Do not add one. If you rename the workflow file or the environment, update the trusted publisher on npm.
- Every action in `.github/workflows` is pinned to a commit SHA with the version in a comment. Check workflows with `actionlint` and `zizmor`.

## Gotchas

- `conventional-commits-filter` is a pinned dev dependency on purpose: `@conventional-changelog/git-client` (from commitlint) has an optional peer dependency on version 6, and without it npm 11 may hoist version 5 (from semantic-release) and write a lock file that `npm ci` on npm 10 (Node.js 22) rejects. After changing dependencies, check that `npm ls --all` reports no invalid package.

- `@semantic-release/changelog` 7 and `@semantic-release/git` 11 need Node.js 24.15 or later. They are pinned to 6.0.3 and 10.0.1 (same features) so that contributors on older Node.js 24 releases can install.
- Tags up to `v1.10.17` were created by the previous release tool (annotated tags). semantic-release reads them fine for versioning.
- Only http, https, ws, wss and ftp can be split across fragments ("https:" + "//x.com"). Other protocols, and the relative protocol "//", must be in one fragment, so "redirect" + "https://other.com" stays a path and "/" + "/evil.com" is not a link to evil.com.
- An incomplete host takes top-level domain labels (".com", ".co.uk") and ports from the next fragments ("example" + ".com"). A complete host only takes a port that keeps it valid: ".env", ".git" or ".well-known" after "example.com" stay path segments, and so does ".com" after "www.example".
- The inline query and hash are read from the last non-empty fragment. Empty fragments before a host are ignored.
- `file:///path` keeps its empty host.
- Domain detection is a heuristic: a hostname needs a dot and a last label that is not a common file extension (`index.html` is a path), or be an IP address, `[IPv6]` or `localhost`.
