# Changelog

## [11.0.1](https://github.com/npm/npm-package-arg/compare/v11.0.0...v11.0.1) (2023-09-05)

### Bug Fixes

* [`74b3c7e`](https://github.com/npm/npm-package-arg/commit/74b3c7e34a7ec16a6f9d36e3d8dfbc052f3ff5a8) [#141](https://github.com/npm/npm-package-arg/pull/141) use URL instead of url.parse (#141) (@wraithgar)

### Documentation

* [`ea00495`](https://github.com/npm/npm-package-arg/commit/ea0049578355050e0f56cdd28809501326ba534b) [#142](https://github.com/npm/npm-package-arg/pull/142) fix readme typo (#142) (@rotu)
* [`26705c5`](https://github.com/npm/npm-package-arg/commit/26705c5fefcd695a881635cf4ccbd7c27de91af3) [#143](https://github.com/npm/npm-package-arg/pull/143) Fix citations to RFC 8089 (not 8909) for file: url (#143) (@rotu)

## [11.0.0](https://github.com/npm/npm-package-arg/compare/v10.1.0...v11.0.0) (2023-08-15)

### ⚠️ BREAKING CHANGES

* the strict RFC 8089 mode has been removed
* support for node 14 has been removed

### Bug Fixes

* [`9344167`](https://github.com/npm/npm-package-arg/commit/934416709cb14ad0a0bab6e544b8d42c62aa279f) [#135](https://github.com/npm/npm-package-arg/pull/135) remove strict 8909 mode (@wraithgar)
* [`5042ff2`](https://github.com/npm/npm-package-arg/commit/5042ff2bba38bf3d8f62541960c808ac3230da08) [#139](https://github.com/npm/npm-package-arg/pull/139) drop node14 support (@lukekarrys)

### Dependencies

* [`d2ab7ba`](https://github.com/npm/npm-package-arg/commit/d2ab7bade19f4594c828ee2a4d5942b2626123cb) [#138](https://github.com/npm/npm-package-arg/pull/138) bump hosted-git-info from 6.1.1 to 7.0.0

## [10.1.0](https://github.com/npm/npm-package-arg/compare/v10.0.0...v10.1.0) (2022-12-01)

### Features

* [`f2c243c`](https://github.com/npm/npm-package-arg/commit/f2c243c140a397d3054fe1ec84a091d237bbd6e9) [#122](https://github.com/npm/npm-package-arg/pull/122) add function to return pacakge purl (@bdehamer, @ljharb)

## [10.0.0](https://github.com/npm/npm-package-arg/compare/v9.1.0...v10.0.0) (2022-10-18)

### ⚠️ BREAKING CHANGES

* `x` and `x@` now return the same spec as `x@*`
* `npm-package-arg` is now compatible with the following semver range for node: `^14.17.0 || ^16.13.0 || >=18.0.0`

### Features

* [`749ccad`](https://github.com/npm/npm-package-arg/commit/749ccad1516e0e61db989669326165bfdb6b7227) [#104](https://github.com/npm/npm-package-arg/pull/104) postinstall for dependabot template-oss PR (@lukekarrys)

### Bug Fixes

* [`d2b87c0`](https://github.com/npm/npm-package-arg/commit/d2b87c083f6f83d01d869281631a0d544190edcf) [#97](https://github.com/npm/npm-package-arg/pull/97) standardize `x` `x@` and `x@*` (#97) (@wraithgar)
* [`7b9cb25`](https://github.com/npm/npm-package-arg/commit/7b9cb25e2b2788ae7b0c9a9b33ca8701a030b8aa) [#108](https://github.com/npm/npm-package-arg/pull/108) resolve relative urls that start with file:// (@lukekarrys)

### Dependencies

* [`b3f0b93`](https://github.com/npm/npm-package-arg/commit/b3f0b93abae31e8e3a186c5f6ebedd3616b0764a) [#117](https://github.com/npm/npm-package-arg/pull/117) bump proc-log from 2.0.1 to 3.0.0 (#117)
* [`7162848`](https://github.com/npm/npm-package-arg/commit/71628486d9f96ef522e28cb32e15ff8d26cf3903) [#116](https://github.com/npm/npm-package-arg/pull/116) bump validate-npm-package-name from 4.0.0 to 5.0.0 (#116)
* [`3110d8f`](https://github.com/npm/npm-package-arg/commit/3110d8f954a76e237649bd478d0cb2fbc95f6afc) [#115](https://github.com/npm/npm-package-arg/pull/115) `hosted-git-info@6.0.0` (#115)

## [9.1.0](https://github.com/npm/npm-package-arg/compare/v9.0.2...v9.1.0) (2022-06-22)


### Features

* **git:** add support for :: in #committish ([#91](https://github.com/npm/npm-package-arg/issues/91)) ([246f1e9](https://github.com/npm/npm-package-arg/commit/246f1e919bd19302bbb907acbe87735f61392a9a))

### [9.0.2](https://github.com/npm/npm-package-arg/compare/v9.0.1...v9.0.2) (2022-03-29)


### Dependencies

* bump validate-npm-package-name from 3.0.0 to 4.0.0 ([#83](https://github.com/npm/npm-package-arg/issues/83)) ([05f40c5](https://github.com/npm/npm-package-arg/commit/05f40c512326c0047ef31259ddc231fc81d9a187))

### [9.0.1](https://www.github.com/npm/npm-package-arg/compare/v9.0.0...v9.0.1) (2022-03-15)


### Dependencies

* bump hosted-git-info from 4.1.0 to 5.0.0 ([#75](https://www.github.com/npm/npm-package-arg/issues/75)) ([c26876d](https://www.github.com/npm/npm-package-arg/commit/c26876d116285c8ab6a91f223b679155c91e60a0))

## [9.0.0](https://www.github.com/npm/npm-package-arg/compare/v8.1.5...v9.0.0) (2022-02-10)


### ⚠ BREAKING CHANGES

* This drops support for node10 and non-LTS versions of node 12 and node 14.

### Bug Fixes

* make error message more clear to locate which package is invalid ([8cb4527](https://www.github.com/npm/npm-package-arg/commit/8cb452760e9e0d7921ea59a1e4d3ec3db7994595))


### Dependencies

* @npmcli/template-oss@2.7.1 ([6975264](https://www.github.com/npm/npm-package-arg/commit/6975264f553471a21b4bb313290c226eb3aa8da3))
* update hosted-git-info requirement from ^4.0.1 to ^4.1.0 ([c6a9e12](https://www.github.com/npm/npm-package-arg/commit/c6a9e12c67d4209118dfabe6e110ece64a0ad1b7))
* update semver requirement from ^7.3.4 to ^7.3.5 ([73fc02e](https://www.github.com/npm/npm-package-arg/commit/73fc02e91ba887201880d37be81838df9b161f05))


### Documentation

* Update result object documentation for type=alias ([55907a9](https://www.github.com/npm/npm-package-arg/commit/55907a917979e566250428dc6da9aad8fd4fb65a))

## [8.0.0](https://github.com/npm/npm-package-arg/compare/v7.0.0...v8.0.0) (2019-12-15)


### ⚠ BREAKING CHANGES

* Dropping support for node 6 and 8.  It'll probably
still work on those versions, but they are no longer supported or
tested, since npm v7 is moving away from them.

* drop support for node 6 and 8 ([ba85e68](https://github.com/npm/npm-package-arg/commit/ba85e68555d6270f672c3d59da17672f744d0376))

<a name="7.0.0"></a>
# [7.0.0](https://github.com/npm/npm-package-arg/compare/v6.1.1...v7.0.0) (2019-11-11)


### deps

* bump hosted-git-info to 3.0.2 ([68a4fc3](https://github.com/npm/npm-package-arg/commit/68a4fc3)), closes [/github.com/npm/hosted-git-info/pull/38#issuecomment-520243803](https://github.com//github.com/npm/hosted-git-info/pull/38/issues/issuecomment-520243803)


### BREAKING CHANGES

* this drops support for ancient node versions.



<a name="6.1.1"></a>
## [6.1.1](https://github.com/npm/npm-package-arg/compare/v6.1.0...v6.1.1) (2019-08-21)


### Bug Fixes

* preserve drive letter on windows git file:// urls ([3909203](https://github.com/npm/npm-package-arg/commit/3909203))



<a name="6.1.0"></a>
# [6.1.0](https://github.com/npm/npm-package-arg/compare/v6.0.0...v6.1.0) (2018-04-10)


### Bug Fixes

* **git:** Fix gitRange for git+ssh for private git ([#33](https://github.com/npm/npm-package-arg/issues/33)) ([647a0b3](https://github.com/npm/npm-package-arg/commit/647a0b3))


### Features

* **alias:** add `npm:` registry alias spec ([#34](https://github.com/npm/npm-package-arg/issues/34)) ([ab99f8e](https://github.com/npm/npm-package-arg/commit/ab99f8e))
