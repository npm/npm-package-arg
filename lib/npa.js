'use strict'

const isWindows = process.platform === 'win32'

const { URL } = require('node:url')
// We need to use path/win32 so that we get consistent results in tests, but this also means we need to manually convert backslashes to forward slashes when generating file: urls with paths.
const path = isWindows ? require('node:path/win32') : require('node:path')
const { homedir } = require('node:os')
const HostedGit = require('hosted-git-info')
const semver = require('semver')
const validatePackageName = require('validate-npm-package-name')
const { log } = require('proc-log')

const hasSlashes = isWindows ? /\\|[/]/ : /[/]/
const isURL = /^(?:git[+])?[a-z]+:/i
const isGit = /^[^@]+@[^:.]+\.[^:]+:.+$/i
const isFileType = /[.](?:tgz|tar\.gz|tar)$/i
const isPortNumber = /:[0-9]+(\/|$)/i
const isWindowsFile = /^(?:[.]|~[/]|[/\\]|[a-zA-Z]:)/
const isPosixFile = /^(?:[.]|~[/]|[/]|[a-zA-Z]:)/
const defaultRegistry = 'https://registry.npmjs.org'

function npa (arg, where) {
  let name
  let spec
  if (typeof arg === 'object') {
    if (arg instanceof Result && (!where || where === arg.where)) {
      return arg
    } else if (arg.name && arg.rawSpec) {
      return npa.resolve(arg.name, arg.rawSpec, where || arg.where)
    } else {
      return npa(arg.raw, where || arg.where)
    }
  }
  const nameEndsAt = arg.indexOf('@', 1) // Skip possible leading @
  const namePart = nameEndsAt > 0 ? arg.slice(0, nameEndsAt) : arg
  if (isURL.test(arg)) {
    spec = arg
  } else if (isGit.test(arg)) {
    spec = `git+ssh://${arg}`
  // eslint-disable-next-line max-len
  } else if (!namePart.startsWith('@') && (hasSlashes.test(namePart) || isFileType.test(namePart))) {
    spec = arg
  } else if (nameEndsAt > 0) {
    name = namePart
    spec = arg.slice(nameEndsAt + 1) || '*'
  } else {
    const valid = validatePackageName(arg)
    if (valid.validForOldPackages) {
      name = arg
      spec = '*'
    } else {
      spec = arg
    }
  }
  return resolve(name, spec, where, arg)
}

function isFileSpec (spec) {
  if (!spec) {
    return false
  }
  if (spec.toLowerCase().startsWith('file:')) {
    return true
  }
  if (isWindows) {
    return isWindowsFile.test(spec)
  }
  return isPosixFile.test(spec)
}

const aliasPrefixes = ['npm:', 'jsr:', 'github:']

function aliasPrefix (spec) {
  if (!spec) {
    return null
  }
  const lower = spec.toLowerCase()
  for (const prefix of aliasPrefixes) {
    if (lower.startsWith(prefix)) {
      return prefix
    }
  }
  return null
}

// `hosted-git-info` treats `github:<owner>/<repo>` as a shorthand for a GitHub
// git repository. We only claim `github:` as an alias when the body is
// unambiguously not a git shortcut — either a scoped package name
// (`github:@<owner>/<name>[@<version>]`) or a bare version selector paired
// with a scoped alias (`<@scope/name>@github:<version>`). Anything else —
// `github:owner/repo`, `github:owner/repo#main`, `github:abcd1234`, or a
// bare version without a scoped alias — is deferred to hosted-git-info so
// existing git-shortcut usage keeps working.
function isGithubAliasSpec (spec, name) {
  const body = spec.slice('github:'.length)
  if (body.startsWith('@')) {
    return true
  }
  // bare version form requires a scoped alias name and must not look like a path
  if (!name || !name.startsWith('@') || body.includes('/')) {
    return false
  }
  return true
}

function isAliasSpec (spec, name) {
  const prefix = aliasPrefix(spec)
  if (!prefix) {
    return false
  }
  if (prefix === 'github:') {
    return isGithubAliasSpec(spec, name)
  }
  return true
}

function resolve (name, spec, where, arg) {
  const res = new Result({
    raw: arg,
    name: name,
    rawSpec: spec,
    fromArgument: arg != null,
  })

  if (name) {
    res.name = name
  }

  if (!where) {
    where = process.cwd()
  }

  if (isFileSpec(spec)) {
    return fromFile(res, where)
  } else if (isAliasSpec(spec, name)) {
    return fromAlias(res, where)
  }

  const hosted = HostedGit.fromUrl(spec, {
    noGitPlus: true,
    noCommittish: true,
  })
  if (hosted) {
    return fromHostedGit(res, hosted)
  } else if (spec && isURL.test(spec)) {
    return fromURL(res)
  } else if (spec && (hasSlashes.test(spec) || isFileType.test(spec))) {
    return fromFile(res, where)
  } else {
    return fromRegistry(res)
  }
}

function toPurl (arg, reg = defaultRegistry) {
  const res = npa(arg)

  if (res.type !== 'version') {
    throw invalidPurlType(res.type, res.raw)
  }

  // URI-encode leading @ of scoped packages
  let purl = 'pkg:npm/' + res.name.replace(/^@/, '%40') + '@' + res.rawSpec
  if (reg !== defaultRegistry) {
    purl += '?repository_url=' + reg
  }

  return purl
}

function invalidPackageName (name, valid, raw) {
  // eslint-disable-next-line max-len
  const err = new Error(`Invalid package name "${name}" of package "${raw}": ${valid.errors.join('; ')}.`)
  err.code = 'EINVALIDPACKAGENAME'
  return err
}

function invalidTagName (name, raw) {
  // eslint-disable-next-line max-len
  const err = new Error(`Invalid tag name "${name}" of package "${raw}": Tags may not have any characters that encodeURIComponent encodes.`)
  err.code = 'EINVALIDTAGNAME'
  return err
}

function invalidPurlType (type, raw) {
  // eslint-disable-next-line max-len
  const err = new Error(`Invalid type "${type}" of package "${raw}": Purl can only be generated for "version" types.`)
  err.code = 'EINVALIDPURLTYPE'
  return err
}

class Result {
  constructor (opts) {
    this.type = opts.type
    this.registry = opts.registry
    this.where = opts.where
    if (opts.raw == null) {
      this.raw = opts.name ? `${opts.name}@${opts.rawSpec}` : opts.rawSpec
    } else {
      this.raw = opts.raw
    }
    this.name = undefined
    this.escapedName = undefined
    this.scope = undefined
    this.rawSpec = opts.rawSpec || ''
    this.saveSpec = opts.saveSpec
    this.fetchSpec = opts.fetchSpec
    if (opts.name) {
      this.setName(opts.name)
    }
    this.gitRange = opts.gitRange
    this.gitCommittish = opts.gitCommittish
    this.gitSubdir = opts.gitSubdir
    this.hosted = opts.hosted
    this.aliasType = opts.aliasType
    this.jsrName = opts.jsrName
  }

  // TODO move this to a getter/setter in a semver major
  setName (name) {
    const valid = validatePackageName(name)
    if (!valid.validForOldPackages) {
      throw invalidPackageName(name, valid, this.raw)
    }

    this.name = name
    this.scope = name[0] === '@' ? name.slice(0, name.indexOf('/')) : undefined
    // scoped packages in couch must have slash url-encoded, e.g. @foo%2Fbar
    this.escapedName = name.replace('/', '%2f')
    return this
  }

  toString () {
    const full = []
    if (this.name != null && this.name !== '') {
      full.push(this.name)
    }
    const spec = this.saveSpec || this.fetchSpec || this.rawSpec
    if (spec != null && spec !== '') {
      full.push(spec)
    }
    return full.length ? full.join('@') : this.raw
  }

  toJSON () {
    const result = Object.assign({}, this)
    delete result.hosted
    return result
  }
}

// sets res.gitCommittish, res.gitRange, and res.gitSubdir
function setGitAttrs (res, committish) {
  if (!committish) {
    res.gitCommittish = null
    return
  }

  // for each :: separated item:
  for (const part of committish.split('::')) {
    // if the item has no : the n it is a commit-ish
    if (!part.includes(':')) {
      if (res.gitRange) {
        throw new Error('cannot override existing semver range with a committish')
      }
      if (res.gitCommittish) {
        throw new Error('cannot override existing committish with a second committish')
      }
      res.gitCommittish = part
      continue
    }
    // split on name:value
    const [name, value] = part.split(':')
    // if name is semver do semver lookup of ref or tag
    if (name === 'semver') {
      if (res.gitCommittish) {
        throw new Error('cannot override existing committish with a semver range')
      }
      if (res.gitRange) {
        throw new Error('cannot override existing semver range with a second semver range')
      }
      res.gitRange = decodeURIComponent(value)
      continue
    }
    if (name === 'path') {
      if (res.gitSubdir) {
        throw new Error('cannot override existing path with a second path')
      }
      res.gitSubdir = `/${value}`
      continue
    }
    log.warn('npm-package-arg', `ignoring unknown key "${name}"`)
  }
}

// Taken from: EncodePathChars and lookup_table in src/node_url.cc
// url.pathToFileURL only returns absolute references.  We can't use it to encode paths.
// encodeURI mangles windows paths. We can't use it to encode paths.
// Under the hood, url.pathToFileURL does a limited set of encoding, with an extra windows step, and then calls path.resolve.
// The encoding node does without path.resolve is not available outside of the source, so we are recreating it here.
const encodedPathChars = new Map([
  ['\0', '%00'],
  ['\t', '%09'],
  ['\n', '%0A'],
  ['\r', '%0D'],
  [' ', '%20'],
  ['"', '%22'],
  ['#', '%23'],
  ['%', '%25'],
  ['?', '%3F'],
  ['[', '%5B'],
  ['\\', isWindows ? '/' : '%5C'],
  [']', '%5D'],
  ['^', '%5E'],
  ['|', '%7C'],
  ['~', '%7E'],
])

function pathToFileURL (str) {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    result = `${result}${encodedPathChars.get(str[i]) ?? str[i]}`
  }
  if (result.startsWith('file:')) {
    return result
  }
  return `file:${result}`
}

function fromFile (res, where) {
  res.type = isFileType.test(res.rawSpec) ? 'file' : 'directory'
  res.where = where

  let rawSpec = pathToFileURL(res.rawSpec)

  if (rawSpec.startsWith('file:/')) {
    // XXX backwards compatibility lack of compliance with RFC 8089

    // turn file://path into file:/path
    if (/^file:\/\/[^/]/.test(rawSpec)) {
      rawSpec = `file:/${rawSpec.slice(5)}`
    }

    // turn file:/../path into file:../path
    // for 1 or 3 leading slashes (2 is already ruled out from handling file:// explicitly above)
    if (/^\/{1,3}\.\.?(\/|$)/.test(rawSpec.slice(5))) {
      rawSpec = rawSpec.replace(/^file:\/{1,3}/, 'file:')
    }
  }

  let resolvedUrl
  let specUrl
  try {
    // always put the '/' on "where", or else file:foo from /path/to/bar goes to /path/to/foo, when we want it to be /path/to/bar/foo
    resolvedUrl = new URL(rawSpec, `${pathToFileURL(path.resolve(where))}/`)
    specUrl = new URL(rawSpec)
  } catch (originalError) {
    const er = new Error('Invalid file: URL, must comply with RFC 8089')
    throw Object.assign(er, {
      raw: res.rawSpec,
      spec: res,
      where,
      originalError,
    })
  }

  // turn /C:/blah into just C:/blah on windows
  let specPath = decodeURIComponent(specUrl.pathname)
  let resolvedPath = decodeURIComponent(resolvedUrl.pathname)
  if (isWindows) {
    specPath = specPath.replace(/^\/+([a-z]:\/)/i, '$1')
    resolvedPath = resolvedPath.replace(/^\/+([a-z]:\/)/i, '$1')
  }

  // replace ~ with homedir, but keep the ~ in the saveSpec
  // otherwise, make it relative to where param
  if (/^\/~(\/|$)/.test(specPath)) {
    res.saveSpec = `file:${specPath.substr(1)}`
    resolvedPath = path.resolve(homedir(), specPath.substr(3))
  } else if (!path.isAbsolute(rawSpec.slice(5))) {
    res.saveSpec = `file:${path.relative(where, resolvedPath)}`
  } else {
    res.saveSpec = `file:${path.resolve(resolvedPath)}`
  }

  res.fetchSpec = path.resolve(where, resolvedPath)
  // re-normalize the slashes in saveSpec due to node:path/win32 behavior in windows
  res.saveSpec = res.saveSpec.split('\\').join('/')
  // Ignoring because this only happens in windows
  /* istanbul ignore next */
  if (res.saveSpec.startsWith('file://')) {
    // normalization of \\win32\root paths can cause a double / which we don't want
    res.saveSpec = `file:/${res.saveSpec.slice(7)}`
  }
  return res
}

function fromHostedGit (res, hosted) {
  res.type = 'git'
  res.hosted = hosted
  res.saveSpec = hosted.toString({ noGitPlus: false, noCommittish: false })
  res.fetchSpec = hosted.getDefaultRepresentation() === 'shortcut' ? null : hosted.toString()
  setGitAttrs(res, hosted.committish)
  return res
}

function unsupportedURLType (protocol, spec) {
  const err = new Error(`Unsupported URL Type "${protocol}": ${spec}`)
  err.code = 'EUNSUPPORTEDPROTOCOL'
  return err
}

function fromURL (res) {
  let rawSpec = res.rawSpec
  res.saveSpec = rawSpec
  if (rawSpec.startsWith('git+ssh:')) {
    // git ssh specifiers are overloaded to also use scp-style git
    // specifiers, so we have to parse those out and treat them special.
    // They are NOT true URIs, so we can't hand them to URL.

    // This regex looks for things that look like:
    // git+ssh://git@my.custom.git.com:username/project.git#deadbeef
    // ...and various combinations. The username in the beginning is *required*.
    const matched = rawSpec.match(/^git\+ssh:\/\/([^:#]+:[^#]+(?:\.git)?)(?:#(.*))?$/i)
    // Filter out all-number "usernames" which are really port numbers
    // They can either be :1234 :1234/ or :1234/path but not :12abc
    if (matched && !matched[1].match(isPortNumber)) {
      res.type = 'git'
      setGitAttrs(res, matched[2])
      res.fetchSpec = matched[1]
      return res
    }
  } else if (rawSpec.startsWith('git+file://')) {
    // URL can't handle windows paths
    rawSpec = rawSpec.replace(/\\/g, '/')
  }
  const parsedUrl = new URL(rawSpec)
  // check the protocol, and then see if it's git or not
  switch (parsedUrl.protocol) {
    case 'git:':
    case 'git+http:':
    case 'git+https:':
    case 'git+rsync:':
    case 'git+ftp:':
    case 'git+file:':
    case 'git+ssh:':
      res.type = 'git'
      setGitAttrs(res, parsedUrl.hash.slice(1))
      if (parsedUrl.protocol === 'git+file:' && /^git\+file:\/\/[a-z]:/i.test(rawSpec)) {
        // URL can't handle drive letters on windows file paths, the host can't contain a :
        res.fetchSpec = `git+file://${parsedUrl.host.toLowerCase()}:${parsedUrl.pathname}`
      } else {
        parsedUrl.hash = ''
        res.fetchSpec = parsedUrl.toString()
      }
      if (res.fetchSpec.startsWith('git+')) {
        res.fetchSpec = res.fetchSpec.slice(4)
      }
      break
    case 'http:':
    case 'https:':
      res.type = 'remote'
      res.fetchSpec = res.saveSpec
      break

    default:
      throw unsupportedURLType(parsedUrl.protocol, rawSpec)
  }

  return res
}

// JSR publishes its packages to a registry that speaks the npm protocol, but
// remaps `@<scope>/<name>` to `@jsr/<scope>__<name>`. This mirrors
// pnpm's `jsrToNpmPackageName` so the resulting subSpec is a normal
// registry entry under the `@jsr` scope, and npm's existing
// `@jsr:registry=...` scope-config mechanism handles registry selection.
function jsrToNpmPackageName (jsrPkgName, raw) {
  if (jsrPkgName[0] !== '@') {
    const err = new Error(
      `Package names from JSR must have a scope: ${raw}`
    )
    err.code = 'EMISSINGJSRSCOPE'
    throw err
  }
  const sepIndex = jsrPkgName.indexOf('/')
  if (sepIndex === -1 || sepIndex === jsrPkgName.length - 1) {
    const err = new Error(
      `Invalid JSR package name "${jsrPkgName}" of package "${raw}"`
    )
    err.code = 'EINVALIDJSRNAME'
    throw err
  }
  const scope = jsrPkgName.substring(1, sepIndex)
  const name = jsrPkgName.substring(sepIndex + 1)
  return `@jsr/${scope}__${name}`
}

// Parses the body of a `jsr:` or `github:` alias into { pkgName, versionSelector }.
// Accepted forms (matching pnpm's parsers):
//   <prefix>:@<scope>/<name>
//   <prefix>:@<scope>/<name>@<version_selector>
//   <prefix>:<version_selector>      — only when an alias name is provided
function parseScopedAliasBody (body, aliasName, raw, kind) {
  if (body[0] === '@') {
    const at = body.lastIndexOf('@')
    if (at === 0) {
      return { pkgName: body, versionSelector: null }
    }
    return {
      pkgName: body.substring(0, at),
      versionSelector: body.substring(at + 1),
    }
  }
  if (!aliasName) {
    const err = new Error(
      `${kind} alias "${raw}" is missing a package name`
    )
    err.code = 'EINVALIDALIAS'
    throw err
  }
  return { pkgName: aliasName, versionSelector: body }
}

// Invariants every alias subSpec must satisfy, regardless of prefix: it must
// be a registry dep, it must have a name, and it must not itself be an alias
// (aliases cannot nest).
function validateAliasSubSpec (subSpec) {
  if (subSpec.type === 'alias') {
    throw new Error('nested aliases not supported')
  }
  if (!subSpec.registry) {
    throw new Error('aliases only work for registry deps')
  }
  if (!subSpec.name) {
    throw new Error('aliases must have a name')
  }
}

function fromNpmAlias (res, where) {
  const subSpec = npa(res.rawSpec.substr('npm:'.length), where)
  validateAliasSubSpec(subSpec)
  return subSpec
}

function fromJsrAlias (res, where) {
  const body = res.rawSpec.substr('jsr:'.length)
  const { pkgName, versionSelector } = parseScopedAliasBody(
    body, res.name, res.raw, 'JSR'
  )
  const npmName = jsrToNpmPackageName(pkgName, res.raw)
  const specString = versionSelector
    ? `${npmName}@${versionSelector}`
    : npmName
  const subSpec = npa(specString, where)
  validateAliasSubSpec(subSpec)
  res.jsrName = pkgName
  return subSpec
}

function fromGithubAlias (res, where) {
  const body = res.rawSpec.substr('github:'.length)
  const { pkgName, versionSelector } = parseScopedAliasBody(
    body, res.name, res.raw, 'GitHub'
  )
  // GitHub Packages publishes under the original scoped name (unlike JSR).
  const specString = versionSelector ? `${pkgName}@${versionSelector}` : pkgName
  const subSpec = npa(specString, where)
  validateAliasSubSpec(subSpec)
  return subSpec
}

function fromAlias (res, where) {
  const prefix = aliasPrefix(res.rawSpec)
  let subSpec
  if (prefix === 'jsr:') {
    subSpec = fromJsrAlias(res, where)
  } else if (prefix === 'github:') {
    subSpec = fromGithubAlias(res, where)
  } else {
    subSpec = fromNpmAlias(res, where)
  }

  res.subSpec = subSpec
  res.registry = true
  res.type = 'alias'
  res.aliasType = prefix.slice(0, -1) // 'npm' | 'jsr' | 'github'
  res.saveSpec = null
  res.fetchSpec = null
  return res
}

function fromRegistry (res) {
  res.registry = true
  const spec = res.rawSpec.trim()
  // no save spec for registry components as we save based on the fetched
  // version, not on the argument so this can't compute that.
  res.saveSpec = null
  res.fetchSpec = spec
  const version = semver.valid(spec, true)
  const range = semver.validRange(spec, true)
  if (version) {
    res.type = 'version'
  } else if (range) {
    res.type = 'range'
  } else {
    if (encodeURIComponent(spec) !== spec) {
      throw invalidTagName(spec, res.raw)
    }
    res.type = 'tag'
  }
  return res
}

module.exports = npa
module.exports.resolve = resolve
module.exports.toPurl = toPurl
module.exports.Result = Result
