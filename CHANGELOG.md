# [2.0.0](https://github.com/TheNaubit/make-url/compare/v1.10.17...v2.0.0) (2026-09-30)


* docs!: document the upgrade from 1.x ([a31f764](https://github.com/TheNaubit/make-url/commit/a31f764e89b41eb7811dfc727c8ba141ca46c7e4))


### Bug Fixes

* build correct URLs for params, ports, hosts and hashes ([7f8ec6f](https://github.com/TheNaubit/make-url/commit/7f8ec6f66631e2813b273cd44871a03df0833524))
* harden opaque URLs, backslash hosts and colon segments ([b5bd361](https://github.com/TheNaubit/make-url/commit/b5bd36157100f13dd1ea716210e2e069a2301b92))
* keep credentials with international domains ([29a9d7b](https://github.com/TheNaubit/make-url/commit/29a9d7b339cbba361148971431d1292670c3537b))
* keep empty values and opaque protocols from changing the URL ([2ce2230](https://github.com/TheNaubit/make-url/commit/2ce2230580a69303b2e210c3a0404e4625e40e1e))
* keep valid hosts, relative protocols and inline queries intact ([3de1436](https://github.com/TheNaubit/make-url/commit/3de14364758c4f2bc0be184c90202f402b541bdc))
* never create a host out of path fragments or params ([d5b6929](https://github.com/TheNaubit/make-url/commit/d5b69299878aac0286e4016a065cdf1aabac4181))
* never let param values traverse the path or become the host ([ab16b68](https://github.com/TheNaubit/make-url/commit/ab16b6862201e9b06c04cd91f14fe00e6284307f))
* rewrite the protocol and host reassembly ([9df5697](https://github.com/TheNaubit/make-url/commit/9df56974d8dc195734de57394e066c809cfce1cd))
* rewrite the URL assembly to fix slashes, hosts, encoding and params ([b1847d8](https://github.com/TheNaubit/make-url/commit/b1847d8a7cafd2db271079a913e1e5cbd8465ac5))


### BREAKING CHANGES

* Node.js 22 or later is required, and several results
change because wrong URLs are fixed: undefined and null params are
skipped, dates are sent as ISO strings, localhost, IPv6 and
international hosts get a protocol with forceProtocol auto, relative
paths and file names are no longer taken as domains, a query or hash
written in the last fragment is kept, the hash keeps / ? : and @, any
protocol:// and opaque protocols (mailto:, tel:) are kept, the slash
after a host alone is removed with trailingSlash remove,
getMakeURLDefaultConfig returns a copy, BASE_DEFAULT_MAKE_URL_CONFIG is
frozen and the options object can only be the last argument. See
"Upgrading from 1.x" in the README.

## [1.10.17](https://github.com/TheNaubit/make-url/compare/v1.10.16...v1.10.17) (2024-10-02)


### Bug Fixes

* set the trailingSlash prop to remove by default and updated dev dependencies ([d08f967](https://github.com/TheNaubit/make-url/commit/d08f967d2d9209336d1c1daee298bd64e068dee0))



## [1.10.16](https://github.com/TheNaubit/make-url/compare/v1.10.15...v1.10.16) (2024-09-15)


### Bug Fixes

* fixed formatting ([3ef8bba](https://github.com/TheNaubit/make-url/commit/3ef8bba638d9c9c64650794aa7c61929ca362c81))
* removed console.log ([76dc539](https://github.com/TheNaubit/make-url/commit/76dc5390f3e5a0c35e63167ff53807040cd71d84))



## [1.10.15](https://github.com/TheNaubit/make-url/compare/v1.10.14...v1.10.15) (2024-08-29)


### Bug Fixes

* improved port support ([f2c6c77](https://github.com/TheNaubit/make-url/commit/f2c6c772c822cadd5bd5cf4b49b9e4e06993089b))
* updated dev dependencies ([06b9935](https://github.com/TheNaubit/make-url/commit/06b99357a8c1231a1880d35e83aa3fd03d5683ae))



## [1.10.14](https://github.com/TheNaubit/make-url/compare/v1.10.13...v1.10.14) (2024-08-29)


### Bug Fixes

* support for ports ([7abdca8](https://github.com/TheNaubit/make-url/commit/7abdca8724f8008145da69f47f6da553d7b6128a))



## [1.10.13](https://github.com/TheNaubit/make-url/compare/v1.10.12...v1.10.13) (2024-07-01)


### Bug Fixes

* fixed action ([2ad0c47](https://github.com/TheNaubit/make-url/commit/2ad0c475d72ce93b2d21275ee0864cefdc9f3f24))
* fixed package.json file ([445485a](https://github.com/TheNaubit/make-url/commit/445485a39c3d2cfa5f7031e375b42d39fd396770))
