const t = require('tap')
const npa = require('..')

// Parsing shape for each alias form. Follows the table-style used by
// test/github.js and test/basic.js.
t.test('alias parsing', t => {
  const tests = {
    // --- npm: alias (existing behavior, regression-fenced) ---
    'foo@npm:bar@1.0.0': {
      name: 'foo',
      type: 'alias',
      aliasType: 'npm',
      registry: true,
      rawSpec: 'npm:bar@1.0.0',
      saveSpec: null,
      fetchSpec: null,
      subSpec: {
        registry: true,
        name: 'bar',
        type: 'version',
        fetchSpec: '1.0.0',
      },
    },

    // --- jsr: alias ---
    // Scoped name + version — JSR remaps @<scope>/<name> to
    // @jsr/<scope>__<name> so the @jsr:registry scope-config routes the
    // fetch to the JSR npm-compat registry.
    'foo@jsr:@scope/name@1.0.0': {
      name: 'foo',
      type: 'alias',
      aliasType: 'jsr',
      registry: true,
      rawSpec: 'jsr:@scope/name@1.0.0',
      saveSpec: null,
      fetchSpec: null,
      jsrName: '@scope/name',
      subSpec: {
        registry: true,
        name: '@jsr/scope__name',
        scope: '@jsr',
        type: 'version',
        fetchSpec: '1.0.0',
      },
    },

    // Scoped name only — defaults to `*` range.
    'foo@jsr:@scope/name': {
      type: 'alias',
      aliasType: 'jsr',
      jsrName: '@scope/name',
      subSpec: {
        name: '@jsr/scope__name',
        type: 'range',
        fetchSpec: '*',
      },
    },

    // Bare-version form — uses the alias name as the JSR package name.
    '@scope/foo@jsr:^1.0.0': {
      name: '@scope/foo',
      type: 'alias',
      aliasType: 'jsr',
      jsrName: '@scope/foo',
      subSpec: {
        name: '@jsr/scope__foo',
        type: 'range',
        fetchSpec: '^1.0.0',
      },
    },

    // Standalone spec without an alias name on the left.
    'jsr:@scope/name@1.0.0': {
      type: 'alias',
      aliasType: 'jsr',
      jsrName: '@scope/name',
      subSpec: {
        name: '@jsr/scope__name',
        fetchSpec: '1.0.0',
      },
    },

    // --- github: alias ---
    // Scoped name + version — GitHub Packages keeps the original scoped
    // name (unlike JSR, which remaps).
    'foo@github:@owner/name@1.0.0': {
      name: 'foo',
      type: 'alias',
      aliasType: 'github',
      registry: true,
      rawSpec: 'github:@owner/name@1.0.0',
      saveSpec: null,
      fetchSpec: null,
      subSpec: {
        registry: true,
        name: '@owner/name',
        scope: '@owner',
        type: 'version',
        fetchSpec: '1.0.0',
      },
    },

    'foo@github:@owner/name': {
      type: 'alias',
      aliasType: 'github',
      subSpec: {
        name: '@owner/name',
        type: 'range',
        fetchSpec: '*',
      },
    },

    '@scope/foo@github:^1.0.0': {
      name: '@scope/foo',
      type: 'alias',
      aliasType: 'github',
      subSpec: {
        name: '@scope/foo',
        type: 'range',
        fetchSpec: '^1.0.0',
      },
    },

    'github:@owner/name@1.0.0': {
      type: 'alias',
      aliasType: 'github',
      subSpec: {
        name: '@owner/name',
        fetchSpec: '1.0.0',
      },
    },

    // --- github: git-shortcut compatibility ---
    // `github:<owner>/<repo>` is hosted-git-info's GitHub shortcut and must
    // stay on the git path, not the alias path.
    'foo@github:owner/repo': {
      name: 'foo',
      type: 'git',
      aliasType: undefined,
    },

    'foo@github:owner/repo#main': {
      name: 'foo',
      type: 'git',
      gitCommittish: 'main',
      aliasType: undefined,
    },

    'foo@github:owner/repo#semver:^1.0.0': {
      name: 'foo',
      type: 'git',
      gitRange: '^1.0.0',
      aliasType: undefined,
    },

    // A scoped alias name does not rescue a body that is clearly a git
    // shortcut (contains a slash).
    '@scope/foo@github:owner/repo': {
      name: '@scope/foo',
      type: 'git',
      aliasType: undefined,
    },

    // Bare-version body with an unscoped alias is ambiguous, so we do NOT
    // claim it as a github alias. It falls through to other resolvers —
    // here hosted-git-info happens to accept `^1.0.0` as a committish.
    'foo@github:^1.0.0': {
      type: 'git',
      aliasType: undefined,
    },
  }

  Object.keys(tests).forEach(arg => {
    t.test(arg, t => {
      const res = npa(arg)
      t.ok(res instanceof npa.Result, `${arg} is a Result`)
      t.match(res, tests[arg], `${arg} matches expectations`)
      // All non-hosted results serialize through toJSON cleanly.
      t.doesNotThrow(() => JSON.stringify(res), 'toJSON works')
      t.end()
    })
  })

  t.end()
})

t.test('alias errors', t => {
  // --- JSR errors ---
  t.throws(() => npa('foo@jsr:1.0.0'),
    { code: 'EMISSINGJSRSCOPE' },
    'unscoped alias + bare version: jsr pkg name must be scoped')
  t.throws(() => npa('foo@jsr:foo@1.0.0'),
    { code: 'EMISSINGJSRSCOPE' },
    'unscoped pkg name in jsr body is rejected')
  t.throws(() => npa('jsr:@foo'),
    { code: 'EINVALIDJSRNAME' },
    'scope without name is rejected')
  t.throws(() => npa('jsr:@foo@^1.0.0'),
    { code: 'EINVALIDJSRNAME' },
    'scope-only pkg name with version is rejected')

  // --- Alias invariants apply to all prefixes ---
  // Aliases cannot nest regardless of which alias prefix is in play.
  t.throws(() => npa('foo@npm:bar@npm:baz'),
    { message: 'nested aliases not supported' },
    'npm:npm nesting is rejected (existing behavior)')
  t.throws(() => npa('foo@jsr:@scope/name@npm:bar@1'),
    { message: 'nested aliases not supported' },
    'jsr body that re-parses to an alias is rejected')
  t.throws(() => npa('foo@github:@owner/name@npm:bar@1'),
    { message: 'nested aliases not supported' },
    'github body that re-parses to an alias is rejected')

  // Aliases must resolve to registry deps — a file/git/url version selector
  // is not permitted inside the body.
  t.throws(() => npa('foo@npm:foo/bar'),
    { message: 'aliases only work for registry deps' },
    'npm alias body must be a registry spec (existing behavior)')
  t.throws(() => npa('foo@jsr:@scope/name@file:./x'),
    { message: 'aliases only work for registry deps' },
    'jsr alias body must be a registry spec')
  t.throws(() => npa('foo@github:@owner/name@git+ssh://x.com/y'),
    { message: 'aliases only work for registry deps' },
    'github alias body must be a registry spec')

  // Aliases without any name on either side cannot resolve.
  t.throws(() => npa('foo@npm:'),
    { message: 'aliases must have a name' },
    'empty npm alias body (existing behavior)')

  t.end()
})

t.test('case-insensitive alias prefixes', t => {
  t.equal(npa('foo@NPM:bar@1.0.0').aliasType, 'npm')
  t.equal(npa('foo@JSR:@scope/name@1.0.0').aliasType, 'jsr')
  t.equal(npa('foo@GITHUB:@owner/name@1.0.0').aliasType, 'github')
  // Casing doesn't rescue `github:owner/repo` from the git-shortcut path —
  // the compatibility rule applies regardless of prefix casing.
  t.equal(npa('foo@GITHUB:owner/repo').type, 'git')
  t.end()
})

t.test('aliasType is undefined on non-alias results', t => {
  // New field on Result; must not leak onto specifiers that aren't aliases,
  // since downstream code (e.g. arborist save logic) branches on it.
  t.equal(npa('foo@1.0.0').aliasType, undefined, 'version')
  t.equal(npa('foo@^1.0.0').aliasType, undefined, 'range')
  t.equal(npa('foo@latest').aliasType, undefined, 'tag')
  t.equal(npa('github:owner/repo').aliasType, undefined, 'git shortcut')
  t.equal(npa('https://x.com/f.tgz').aliasType, undefined, 'remote')
  t.end()
})

t.test('toString on alias results round-trips the rawSpec', t => {
  // saveSpec and fetchSpec are null on aliases, so toString falls back to
  // rawSpec. This matters because arborist/pacote display the spec to
  // users via toString in a few places.
  t.equal(npa('foo@npm:bar@1.0.0').toString(), 'foo@npm:bar@1.0.0')
  t.equal(npa('foo@jsr:@scope/name@1.0.0').toString(), 'foo@jsr:@scope/name@1.0.0')
  t.equal(npa('foo@github:@owner/name@1.0.0').toString(), 'foo@github:@owner/name@1.0.0')
  t.end()
})
