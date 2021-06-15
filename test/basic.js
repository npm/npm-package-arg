const path = require('path').posix
const os = require('os')

const normalizePath = p => p && p.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/')

const cwd = normalizePath(process.cwd())
process.cwd = () => cwd
const normalizePaths = spec => {
  spec.saveSpec = normalizePath(spec.saveSpec)
  spec.fetchSpec = normalizePath(spec.fetchSpec)
  return spec
}

const t = require('tap')
const npa = t.mock('../npa.js', { path })
t.on('bailout', () => process.exit(1))

t.test('basic', function (t) {
  t.setMaxListeners(999)

  const tests = {
    'foo@1.2': {
      name: 'foo',
      escapedName: 'foo',
      type: 'range',
      saveSpec: null,
      fetchSpec: '1.2',
      raw: 'foo@1.2',
      rawSpec: '1.2',
    },

    'foo@~1.2': {
      name: 'foo',
      escapedName: 'foo',
      type: 'range',
      saveSpec: null,
      fetchSpec: '~1.2',
      raw: 'foo@~1.2',
      rawSpec: '~1.2',
    },

    '@foo/bar': {
      raw: '@foo/bar',
      name: '@foo/bar',
      escapedName: '@foo%2fbar',
      scope: '@foo',
      rawSpec: '',
      saveSpec: null,
      fetchSpec: 'latest',
      type: 'tag',
    },

    '@foo/bar@': {
      raw: '@foo/bar@',
      name: '@foo/bar',
      escapedName: '@foo%2fbar',
      scope: '@foo',
      rawSpec: '',
      saveSpec: null,
      fetchSpec: 'latest',
      type: 'tag',
    },

    '@foo/bar@baz': {
      raw: '@foo/bar@baz',
      name: '@foo/bar',
      escapedName: '@foo%2fbar',
      scope: '@foo',
      rawSpec: 'baz',
      saveSpec: null,
      fetchSpec: 'baz',
      type: 'tag',
    },

    '@f fo o al/ a d s ;f': {
      raw: '@f fo o al/ a d s ;f',
      name: null,
      escapedName: null,
      rawSpec: '@f fo o al/ a d s ;f',
      saveSpec: 'file:@f fo o al/ a d s ;f',
      fetchSpec: '/test/a/b/@f fo o al/ a d s ;f',
      type: 'directory',
    },

    'foo@1.2.3': {
      name: 'foo',
      escapedName: 'foo',
      type: 'version',
      saveSpec: null,
      fetchSpec: '1.2.3',
      raw: 'foo@1.2.3',
    },

    'foo@=v1.2.3': {
      name: 'foo',
      escapedName: 'foo',
      type: 'version',
      saveSpec: null,
      fetchSpec: '=v1.2.3',
      raw: 'foo@=v1.2.3',
      rawSpec: '=v1.2.3',
    },

    'foo@npm:bar': {
      name: 'foo',
      escapedName: 'foo',
      type: 'alias',
      saveSpec: null,
      fetchSpec: null,
      raw: 'foo@npm:bar',
      rawSpec: 'npm:bar',
      subSpec: {
        registry: true,
        name: 'bar',
        escapedName: 'bar',
        type: 'tag',
        raw: 'bar',
        rawSpec: '',
        saveSpec: null,
        fetchSpec: 'latest',
      },
    },

    'git+ssh://git@notgithub.com/user/foo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@notgithub.com/user/foo#1.2.3',
      fetchSpec: 'ssh://git@notgithub.com/user/foo',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://git@notgithub.com/user/foo#1.2.3',
    },

    'git+ssh://git@notgithub.com/user/foo': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@notgithub.com/user/foo',
      fetchSpec: 'ssh://git@notgithub.com/user/foo',
      gitCommittish: null,
      raw: 'git+ssh://git@notgithub.com/user/foo',
    },

    'git+ssh://git@notgithub.com:user/foo': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@notgithub.com:user/foo',
      fetchSpec: 'git@notgithub.com:user/foo',
      gitCommittish: null,
      raw: 'git+ssh://git@notgithub.com:user/foo',
    },

    'git+ssh://mydomain.com:foo': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:foo',
      fetchSpec: 'mydomain.com:foo',
      gitCommittish: null,
      raw: 'git+ssh://mydomain.com:foo',
    },

    'git+ssh://git@notgithub.com:user/foo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@notgithub.com:user/foo#1.2.3',
      fetchSpec: 'git@notgithub.com:user/foo',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://git@notgithub.com:user/foo#1.2.3',
    },

    'git+ssh://mydomain.com:foo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:foo#1.2.3',
      fetchSpec: 'mydomain.com:foo',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://mydomain.com:foo#1.2.3',
    },

    'git+ssh://mydomain.com:foo/bar#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:foo/bar#1.2.3',
      fetchSpec: 'mydomain.com:foo/bar',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://mydomain.com:foo/bar#1.2.3',
    },

    'git+ssh://mydomain.com:1234#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:1234#1.2.3',
      fetchSpec: 'ssh://mydomain.com:1234',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://mydomain.com:1234#1.2.3',
    },

    'git+ssh://mydomain.com:1234/hey#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:1234/hey#1.2.3',
      fetchSpec: 'ssh://mydomain.com:1234/hey',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://mydomain.com:1234/hey#1.2.3',
    },

    'git+ssh://mydomain.com:1234/hey': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:1234/hey',
      fetchSpec: 'ssh://mydomain.com:1234/hey',
      gitCommittish: null,
      raw: 'git+ssh://mydomain.com:1234/hey',
    },

    'git+ssh://username:password@mydomain.com:1234/hey#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://username:password@mydomain.com:1234/hey#1.2.3',
      fetchSpec: 'ssh://username:password@mydomain.com:1234/hey',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://username:password@mydomain.com:1234/hey#1.2.3',
    },

    'git+ssh://git@github.com/user/foo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@github.com/user/foo.git#1.2.3',
      fetchSpec: 'ssh://git@github.com/user/foo.git',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://git@github.com/user/foo#1.2.3',
    },

    'git+ssh://git@notgithub.com/user/foo#semver:^1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      hosted: null,
      saveSpec: 'git+ssh://git@notgithub.com/user/foo#semver:^1.2.3',
      fetchSpec: 'ssh://git@notgithub.com/user/foo',
      gitCommittish: null,
      gitRange: '^1.2.3',
      raw: 'git+ssh://git@notgithub.com/user/foo#semver:^1.2.3',
    },

    'git+ssh://git@notgithub.com:user/foo#semver:^1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      hosted: null,
      saveSpec: 'git+ssh://git@notgithub.com:user/foo#semver:^1.2.3',
      fetchSpec: 'git@notgithub.com:user/foo',
      gitCommittish: null,
      gitRange: '^1.2.3',
      raw: 'git+ssh://git@notgithub.com:user/foo#semver:^1.2.3',
    },

    'git+ssh://git@github.com/user/foo#semver:^1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@github.com/user/foo.git#semver:^1.2.3',
      fetchSpec: 'ssh://git@github.com/user/foo.git',
      gitCommittish: null,
      gitRange: '^1.2.3',
      raw: 'git+ssh://git@github.com/user/foo#semver:^1.2.3',
    },

    'git+ssh://git@github.com:user/foo#semver:^1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@github.com/user/foo.git#semver:^1.2.3',
      fetchSpec: 'ssh://git@github.com/user/foo.git',
      gitCommittish: null,
      gitRange: '^1.2.3',
      raw: 'git+ssh://git@github.com:user/foo#semver:^1.2.3',
    },

    'user/foo#semver:^1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'github:user/foo#semver:^1.2.3',
      fetchSpec: null,
      gitCommittish: null,
      gitRange: '^1.2.3',
      raw: 'user/foo#semver:^1.2.3',
    },

    'git+file://path/to/repo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+file://path/to/repo#1.2.3',
      fetchSpec: 'file://path/to/repo',
      gitCommittish: '1.2.3',
      raw: 'git+file://path/to/repo#1.2.3',
    },

    'git://notgithub.com/user/foo': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git://notgithub.com/user/foo',
      fetchSpec: 'git://notgithub.com/user/foo',
      raw: 'git://notgithub.com/user/foo',
    },

    '@foo/bar@git+ssh://notgithub.com/user/foo': {
      name: '@foo/bar',
      escapedName: '@foo%2fbar',
      scope: '@foo',
      saveSpec: 'git+ssh://notgithub.com/user/foo',
      fetchSpec: 'ssh://notgithub.com/user/foo',
      rawSpec: 'git+ssh://notgithub.com/user/foo',
      raw: '@foo/bar@git+ssh://notgithub.com/user/foo',
    },

    'git@npm:not-git': {
      name: 'git',
      type: 'alias',
      subSpec: {
        type: 'tag',
        registry: true,
        name: 'not-git',
        fetchSpec: 'latest',
      },
      raw: 'git@npm:not-git',
    },

    'not-git@hostname.com:some/repo': {
      name: null,
      type: 'git',
      saveSpec: 'git+ssh://not-git@hostname.com:some/repo',
      fetchSpec: 'not-git@hostname.com:some/repo',
      raw: 'not-git@hostname.com:some/repo',
    },

    '/path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: '/path/to/foo',
      raw: '/path/to/foo',
    },

    '/path/to/foo.tar': {
      name: null,
      escapedName: null,
      type: 'file',
      saveSpec: 'file:/path/to/foo.tar',
      fetchSpec: '/path/to/foo.tar',
      raw: '/path/to/foo.tar',
    },

    '/path/to/foo.tgz': {
      name: null,
      escapedName: null,
      type: 'file',
      saveSpec: 'file:/path/to/foo.tgz',
      fetchSpec: '/path/to/foo.tgz',
      raw: '/path/to/foo.tgz',
    },
    'file:path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:path/to/foo',
      fetchSpec: '/test/a/b/path/to/foo',
      raw: 'file:path/to/foo',
    },
    'file:path/to/foo.tar.gz': {
      name: null,
      escapedName: null,
      type: 'file',
      saveSpec: 'file:path/to/foo',
      fetchSpec: '/test/a/b/path/to/foo.tar.gz',
      raw: 'file:path/to/foo.tar.gz',
    },

    'file:~/path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:~/path/to/foo',
      fetchSpec: normalizePath(path.join(os.homedir(), '/path/to/foo')),
      raw: 'file:~/path/to/foo',
    },

    'file:/~/path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:~/path/to/foo',
      fetchSpec: normalizePath(path.join(os.homedir(), '/path/to/foo')),
      raw: 'file:/~/path/to/foo',
    },

    'file:/~path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/~path/to/foo',
      fetchSpec: '/~path/to/foo',
      raw: 'file:/~path/to/foo',
    },

    'file:/.path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/.path/to/foo',
      fetchSpec: '/.path/to/foo',
      raw: 'file:/.path/to/foo',
    },

    'file:../path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:../path/to/foo',
      fetchSpec: '/test/a/path/to/foo',
      raw: 'file:../path/to/foo',
    },

    'file:/../path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:../path/to/foo',
      fetchSpec: '/test/a/path/to/foo',
      raw: 'file:/../path/to/foo',
    },

    'file:///path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: '/path/to/foo',
      raw: 'file:///path/to/foo',
    },
    'file:/path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: '/path/to/foo',
      raw: 'file:/path/to/foo',
    },
    'file://path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: '/path/to/foo',
      raw: 'file://path/to/foo',
    },
    'file:////path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: '/path/to/foo',
      raw: 'file:////path/to/foo',
    },

    'file://.': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:',
      raw: 'file://.',
    },

    'http://insecure.com/foo.tgz': {
      name: null,
      escapedName: null,
      type: 'remote',
      saveSpec: 'http://insecure.com/foo.tgz',
      fetchSpec: 'http://insecure.com/foo.tgz',
      raw: 'http://insecure.com/foo.tgz',
    },

    'https://server.com/foo.tgz': {
      name: null,
      escapedName: null,
      type: 'remote',
      saveSpec: 'https://server.com/foo.tgz',
      fetchSpec: 'https://server.com/foo.tgz',
      raw: 'https://server.com/foo.tgz',
    },

    'foo@latest': {
      name: 'foo',
      escapedName: 'foo',
      type: 'tag',
      saveSpec: null,
      fetchSpec: 'latest',
      raw: 'foo@latest',
    },

    foo: {
      name: 'foo',
      escapedName: 'foo',
      type: 'tag',
      saveSpec: null,
      fetchSpec: 'latest',
      raw: 'foo',
    },

    'foo@ 1.2 ': {
      name: 'foo',
      escapedName: 'foo',
      type: 'range',
      saveSpec: null,
      fetchSpec: '1.2',
      raw: 'foo@ 1.2 ',
      rawSpec: ' 1.2 ',
    },

    'foo@ 1.2.3 ': {
      name: 'foo',
      escapedName: 'foo',
      type: 'version',
      saveSpec: null,
      fetchSpec: '1.2.3',
      raw: 'foo@ 1.2.3 ',
      rawSpec: ' 1.2.3 ',
    },

    'foo@1.2.3 ': {
      name: 'foo',
      escapedName: 'foo',
      type: 'version',
      saveSpec: null,
      fetchSpec: '1.2.3',
      raw: 'foo@1.2.3 ',
      rawSpec: '1.2.3 ',
    },

    'foo@ 1.2.3': {
      name: 'foo',
      escapedName: 'foo',
      type: 'version',
      saveSpec: null,
      fetchSpec: '1.2.3',
      raw: 'foo@ 1.2.3',
      rawSpec: ' 1.2.3',
    },
  }

  Object.keys(tests).forEach(function (arg) {
    const res = normalizePaths(npa(arg, '/test/a/b'))
    t.ok(res instanceof npa.Result, arg + ' is a result')
    Object.keys(tests[arg]).forEach(function (key) {
      t.match(res[key], tests[arg][key], arg + ' [' + key + ']')
    })
  })

  let objSpec = { name: 'foo', rawSpec: '1.2.3' }
  t.equal(npa(objSpec, '/whatnot').toString(), 'foo@1.2.3', 'parsed object')

  objSpec.where = '/whatnot'
  t.equal(npa(objSpec).toString(), 'foo@1.2.3', 'parsed object w/o where arg')

  t.equal(npa('git+http://foo.com/bar').toString(),
    'git+http://foo.com/bar', 'parsed git toString')

  objSpec = { raw: './foo/bar', where: '/here' }
  t.equal(normalizePath(npa(objSpec).fetchSpec), '/here/foo/bar', '`where` is reused')

  let res = new npa.Result({ name: 'bar', rawSpec: './foo/bar' })
  t.equal(res.toString(), 'bar@./foo/bar', 'toString with only rawSpec')
  res = new npa.Result({ rawSpec: './x/y' })
  t.equal(normalizePath(res.toString()), './x/y', 'toString with only rawSpec, no name')
  res = new npa.Result({ rawSpec: '' })
  t.equal(res.toString(), '', 'toString with nothing')

  objSpec = { raw: './foo/bar', where: '/here' }
  t.equal(
    normalizePath(npa(objSpec, '/whatnot').fetchSpec),
    '/whatnot/foo/bar',
    '`where` arg overrides the one in the spec object'
  )

  t.equal(npa(npa('foo@1.2.3')).toString(), 'foo@1.2.3', 'spec is passthrough')

  const parsedSpec = npa('./foo', './here')
  t.equal(npa(parsedSpec), parsedSpec, 'reused if no where')
  t.equal(npa(parsedSpec, './here'), parsedSpec, 'reused if where matches')
  t.not(npa(parsedSpec, './there'), parsedSpec, 'new instance if where does not match')
  t.not(npa(parsedSpec, './there').fetchSpec, '/there/foo', 'new instance has new where')
  // Completely unreasonable invalid garbage throws an error
  t.throws(function () {
    t.comment(npa('this is not a \0 valid package name or url'))
  })

  t.throws(function () {
    npa('gopher://yea right')
  }, 'Unsupported URL Type: gopher://yea right')

  t.throws(function () {
    npa.resolve('invalid/name', '1.0.0')
  }, 'Invalid names throw errrors')

  t.throws(() => {
    npa('foo@npm:bar@npm:baz')
  }, 'nested aliases not supported')

  t.throws(() => {
    npa('foo@npm:foo/bar')
  }, 'aliases only work for registry deps')

  t.has(npa.resolve('foo', '^1.2.3', '/test/a/b'), {
    type: 'range',
  }, 'npa.resolve')
  t.has(normalizePaths(npa.resolve('foo', 'file:foo', '/test/a/b')), {
    type: 'directory',
    fetchSpec: '/test/a/b/foo',
  }, 'npa.resolve file:')
  t.has(npa.resolve('foo', '../foo/bar', '/test/a/b'), {
    type: 'directory',
  }, 'npa.resolve no protocol')
  t.has(npa.resolve('foo', 'file:../foo/bar', '/test/a/b'), {
    type: 'directory',
  }, 'npa.resolve file protocol')
  t.has(npa.resolve('foo', 'file:../foo/bar.tgz', '/test/a/b'), {
    type: 'file',
  }, 'npa.resolve file protocol w/ tgz')
  t.has(npa.resolve(null, '4.0.0', '/test/a/b'), {
    type: 'version',
    name: null,
  }, 'npa.resolve with no name')
  t.has(npa.resolve('foo', 'file:abc'), {
    type: 'directory',
    raw: 'foo@file:abc',
  }, 'npa.resolve sets raw right')
  t.has(npa('./path/to/thing/package@1.2.3/'), {
    name: null,
    type: 'directory',
  }, 'npa with path in @ in it')
  t.has(npa('path/to/thing/package@1.2.3'), {
    name: null,
    type: 'directory',
  }, 'npa w/o leading or trailing slash')
  t.end()
})

t.test('strict 8909 compliance mode', t => {
  t.teardown(() => process.env.NPM_PACKAGE_ARG_8909_STRICT = '0')
  process.env.NPM_PACKAGE_ARG_8909_STRICT = '1'

  t.throws(() => npa('file://.'), {
    message: 'Invalid file: URL, must be absolute if // present',
    raw: 'file://.',
  })

  t.throws(() => npa('file://some/relative/path'), {
    message: 'Invalid file: URL, must be absolute if // present',
    raw: 'file://some/relative/path',
  })

  // I cannot for the life of me figure out how to make new URL('file:...')
  // actually fail to parse.  it seems like it accepts any garbage you can
  // throw at it.  However, because it theoretically CAN throw, here's a test.
  t.throws(() => {
    const npa = t.mock('../npa.js', {
      url: {
        URL: class {
          constructor () {
            throw new Error('thansk i haet it')
          }
        },
      },
    })
    npa('file:thansk i haet it')
  }, {
    message: 'Invalid file: URL, must comply with RFC 8909',
  })

  t.end()
})
