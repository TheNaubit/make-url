<h1 align="center">
  <br>
  <!-- <img src="docs/cat.svg" alt="Markdownify"> -->
  <br>
  make-url
  <br>
</h1>

<h4 align="center">Build correct URLs easily.</h4>

<p align="center">
  <a href="https://github.com/TheNaubit/make-url/actions">
    <img src="https://github.com/TheNaubit/make-url/actions/workflows/ci.yml/badge.svg"
         alt="Build Status">
  </a>
  <a href="https://www.npmjs.com/package/test">
    <img src="https://img.shields.io/npm/v/test.svg?style=flat" alt="npm version">
  </a>
  <a href="https://bundlephobia.com/result?p=test">
    <img src="https://badgen.net/bundlephobia/minzip/test" alt="minzipped size">
  </a>
</p>


## How?

### Install

Currently, the package is distributed via NPM.

```bash
npm install --save test
```

### Usage with Node (CommonJS/CJS)

Node 18 and above are officially supported, though you may have luck using it with an earlier Node version.
Since the code uses the `URL` and `URLSearchParams` classes internally, which aren't available below Node v10, the library is known not to work with those versions.

## TypeScript

This library provides its own type definitions. "It just works", no need to install anything from `@types`.


## Help

Thank you for using *make-url*!

If you need any help using this library, feel free to [create a GitHub issue](https://github.com/TheNaubit/make-url/issues/new/choose), and ask your questions. I'll try to answer as quickly as possible.

## Contribute

Contributions of any kind (pull requests, bug reports, feature requests, documentation, design) are more than welcome! If you like this project and want to help, but feel like you are stuck, feel free to contact the maintainers.

### Building from source

Building the project should be quick and easy. If it isn't, it's the maintainer's fault. Please report any problems with building in a GitHub issue.

You need to have a reasonably recent version of node.js to build *urlcat*. 
Tested on node version 18.0.0 and npm version 8.6.0.

First, clone the git repository:

```
git clone git@github.com:TheNaubit/make-url.git
```

Then switch to the newly created urlcat directory and install the dependencies:

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
      <td align="center" valign="top" width="14.28%"><a href="https://nauverse.com"><img src="https://avatars.githubusercontent.com/u/22015497?v=4?s=100" width="100px;" alt="Al &#124; Naucode"/><br /><sub><b>Al &#124; Naucode</b></sub></a><br /><a href="#bug-TheNaubit" title="Bug reports">🐛</a> <a href="#code-TheNaubit" title="Code">💻</a> <a href="#doc-TheNaubit" title="Documentation">📖</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!