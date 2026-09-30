# Contributing

Contributions of any kind (pull requests, bug reports, feature requests, documentation, design) are more than welcome! This package is small, so keep changes small and focused.

## Setup

You need Node.js `^22.14.0 || >=24.10.0` (run `nvm use` for the version in `.nvmrc`) and npm `>=10.9.0`.

```bash
git clone git@github.com:TheNaubit/make-url.git
cd make-url
npm install
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

The build output goes to `dist/`.

## Rules

- Write the failing test first. Every bug fix needs a regression test.
- The README examples are tests (`src/readme.test.ts`): update them when behavior changes.
- Use [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`. A git hook checks the messages, and another one runs the linter, the type check and the tests before each commit.
- Do not bump `version` by hand. Releases are automated with semantic-release: every push to `main` runs `.github/workflows/release.yml`, which computes the version, updates `CHANGELOG.md`, tags, creates the GitHub release and publishes to npm with [trusted publishing](https://docs.npmjs.com/trusted-publishers).

See [AGENTS.md](./AGENTS.md) for the architecture notes.
