# Changelog

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
