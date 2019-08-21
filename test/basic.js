var npa = require('../npa.js')
var path = require('path')
var osenv = require('osenv')

require('tap').test('basic', function (t) {
  t.setMaxListeners(999)

  var tests = {
    'foo@1.2': {
      name: 'foo',
      escapedName: 'foo',
      type: 'range',
      saveSpec: null,
      fetchSpec: '1.2',
      raw: 'foo@1.2',
      rawSpec: '1.2'
    },

    'foo@~1.2': {
      name: 'foo',
      escapedName: 'foo',
      type: 'range',
      saveSpec: null,
      fetchSpec: '~1.2',
      raw: 'foo@~1.2',
      rawSpec: '~1.2'
    },

    '@foo/bar': {
      raw: '@foo/bar',
      name: '@foo/bar',
      escapedName: '@foo%2fbar',
      scope: '@foo',
      rawSpec: '',
      saveSpec: null,
      fetchSpec: 'latest',
      type: 'tag'
    },

    '@foo/bar@': {
      raw: '@foo/bar@',
      name: '@foo/bar',
      escapedName: '@foo%2fbar',
      scope: '@foo',
      rawSpec: '',
      saveSpec: null,
      fetchSpec: 'latest',
      type: 'tag'
    },

    '@foo/bar@baz': {
      raw: '@foo/bar@baz',
      name: '@foo/bar',
      escapedName: '@foo%2fbar',
      scope: '@foo',
      rawSpec: 'baz',
      saveSpec: null,
      fetchSpec: 'baz',
      type: 'tag'
    },

    '@f fo o al/ a d s ;f': {
      raw: '@f fo o al/ a d s ;f',
      name: null,
      escapedName: null,
      rawSpec: '@f fo o al/ a d s ;f',
      saveSpec: 'file:@f fo o al/ a d s ;f',
      fetchSpec: '/test/a/b/@f fo o al/ a d s ;f',
      type: 'directory'
    },

    'foo@1.2.3': {
      name: 'foo',
      escapedName: 'foo',
      type: 'version',
      saveSpec: null,
      fetchSpec: '1.2.3',
      raw: 'foo@1.2.3'
    },

    'foo@=v1.2.3': {
      name: 'foo',
      escapedName: 'foo',
      type: 'version',
      saveSpec: null,
      fetchSpec: '=v1.2.3',
      raw: 'foo@=v1.2.3',
      rawSpec: '=v1.2.3'
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
        fetchSpec: 'latest'
      }
    },

    'git+ssh://git@notgithub.com/user/foo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@notgithub.com/user/foo#1.2.3',
      fetchSpec: 'ssh://git@notgithub.com/user/foo',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://git@notgithub.com/user/foo#1.2.3'
    },

    'git+ssh://git@notgithub.com/user/foo': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@notgithub.com/user/foo',
      fetchSpec: 'ssh://git@notgithub.com/user/foo',
      gitCommittish: null,
      raw: 'git+ssh://git@notgithub.com/user/foo'
    },

    'git+ssh://git@notgithub.com:user/foo': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@notgithub.com:user/foo',
      fetchSpec: 'git@notgithub.com:user/foo',
      gitCommittish: null,
      raw: 'git+ssh://git@notgithub.com:user/foo'
    },

    'git+ssh://mydomain.com:foo': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:foo',
      fetchSpec: 'mydomain.com:foo',
      gitCommittish: null,
      raw: 'git+ssh://mydomain.com:foo'
    },

    'git+ssh://git@notgithub.com:user/foo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@notgithub.com:user/foo#1.2.3',
      fetchSpec: 'git@notgithub.com:user/foo',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://git@notgithub.com:user/foo#1.2.3'
    },

    'git+ssh://mydomain.com:foo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:foo#1.2.3',
      fetchSpec: 'mydomain.com:foo',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://mydomain.com:foo#1.2.3'
    },

    'git+ssh://mydomain.com:foo/bar#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:foo/bar#1.2.3',
      fetchSpec: 'mydomain.com:foo/bar',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://mydomain.com:foo/bar#1.2.3'
    },

    'git+ssh://mydomain.com:1234#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:1234#1.2.3',
      fetchSpec: 'ssh://mydomain.com:1234',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://mydomain.com:1234#1.2.3'
    },

    'git+ssh://mydomain.com:1234/hey#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:1234/hey#1.2.3',
      fetchSpec: 'ssh://mydomain.com:1234/hey',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://mydomain.com:1234/hey#1.2.3'
    },

    'git+ssh://mydomain.com:1234/hey': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://mydomain.com:1234/hey',
      fetchSpec: 'ssh://mydomain.com:1234/hey',
      gitCommittish: null,
      raw: 'git+ssh://mydomain.com:1234/hey'
    },

    'git+ssh://username:password@mydomain.com:1234/hey#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://username:password@mydomain.com:1234/hey#1.2.3',
      fetchSpec: 'ssh://username:password@mydomain.com:1234/hey',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://username:password@mydomain.com:1234/hey#1.2.3'
    },

    'git+ssh://git@github.com/user/foo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@github.com/user/foo.git#1.2.3',
      fetchSpec: 'ssh://git@github.com/user/foo.git',
      gitCommittish: '1.2.3',
      raw: 'git+ssh://git@github.com/user/foo#1.2.3'
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
      raw: 'git+ssh://git@notgithub.com/user/foo#semver:^1.2.3'
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
      raw: 'git+ssh://git@notgithub.com:user/foo#semver:^1.2.3'
    },

    'git+ssh://git@github.com/user/foo#semver:^1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@github.com/user/foo.git#semver:^1.2.3',
      fetchSpec: 'ssh://git@github.com/user/foo.git',
      gitCommittish: null,
      gitRange: '^1.2.3',
      raw: 'git+ssh://git@github.com/user/foo#semver:^1.2.3'
    },

    'git+ssh://git@github.com:user/foo#semver:^1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+ssh://git@github.com/user/foo.git#semver:^1.2.3',
      fetchSpec: 'ssh://git@github.com/user/foo.git',
      gitCommittish: null,
      gitRange: '^1.2.3',
      raw: 'git+ssh://git@github.com:user/foo#semver:^1.2.3'
    },

    'user/foo#semver:^1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'github:user/foo#semver:^1.2.3',
      fetchSpec: null,
      gitCommittish: null,
      gitRange: '^1.2.3',
      raw: 'user/foo#semver:^1.2.3'
    },

    'git+file://path/to/repo#1.2.3': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git+file://path/to/repo#1.2.3',
      fetchSpec: 'file://path/to/repo',
      gitCommittish: '1.2.3',
      raw: 'git+file://path/to/repo#1.2.3'
    },

    'git://notgithub.com/user/foo': {
      name: null,
      escapedName: null,
      type: 'git',
      saveSpec: 'git://notgithub.com/user/foo',
      fetchSpec: 'git://notgithub.com/user/foo',
      raw: 'git://notgithub.com/user/foo'
    },

    '@foo/bar@git+ssh://notgithub.com/user/foo': {
      name: '@foo/bar',
      escapedName: '@foo%2fbar',
      scope: '@foo',
      saveSpec: 'git+ssh://notgithub.com/user/foo',
      fetchSpec: 'ssh://notgithub.com/user/foo',
      rawSpec: 'git+ssh://notgithub.com/user/foo',
      raw: '@foo/bar@git+ssh://notgithub.com/user/foo'
    },

    '/path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: path.resolve(__dirname, '/path/to/foo'),
      raw: '/path/to/foo'
    },

    '/path/to/foo.tar': {
      name: null,
      escapedName: null,
      type: 'file',
      saveSpec: 'file:/path/to/foo.tar',
      fetchSpec: path.resolve(__dirname, '/path/to/foo.tar'),
      raw: '/path/to/foo.tar'
    },

    '/path/to/foo.tgz': {
      name: null,
      escapedName: null,
      type: 'file',
      saveSpec: 'file:/path/to/foo.tgz',
      fetchSpec: path.resolve(__dirname, '/path/to/foo.tgz'),
      raw: '/path/to/foo.tgz'
    },
    'file:path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:path/to/foo',
      fetchSpec: '/test/a/b/path/to/foo',
      raw: 'file:path/to/foo'
    },
    'file:path/to/foo.tar.gz': {
      name: null,
      escapedName: null,
      type: 'file',
      saveSpec: 'file:path/to/foo',
      fetchSpec: '/test/a/b/path/to/foo.tar.gz',
      raw: 'file:path/to/foo.tar.gz'
    },

    'file:~/path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:~/path/to/foo',
      fetchSpec: osenv.home().replace(/\\/g, '/') + '/path/to/foo',
      raw: 'file:~/path/to/foo'
    },

    'file:/~/path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:~/path/to/foo',
      fetchSpec: osenv.home().replace(/\\/g, '/') + '/path/to/foo',
      raw: 'file:/~/path/to/foo'
    },

    'file:../path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:../path/to/foo',
      fetchSpec: '/test/a/path/to/foo',
      raw: 'file:../path/to/foo'
    },

    'file:/../path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:../path/to/foo',
      fetchSpec: '/test/a/path/to/foo',
      raw: 'file:/../path/to/foo'
    },

    'file:///path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: '/path/to/foo',
      raw: 'file:///path/to/foo'
    },
    'file:/path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: '/path/to/foo',
      raw: 'file:/path/to/foo'
    },
    'file://path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: '/path/to/foo',
      raw: 'file://path/to/foo'
    },
    'file:////path/to/foo': {
      name: null,
      escapedName: null,
      type: 'directory',
      saveSpec: 'file:/path/to/foo',
      fetchSpec: '/path/to/foo',
      raw: 'file:////path/to/foo'
    },

    'http://insecure.com/foo.tgz': {
      name: null,
      escapedName: null,
      type: 'remote',
      saveSpec: 'http://insecure.com/foo.tgz',
      fetchSpec: 'http://insecure.com/foo.tgz',
      raw: 'http://insecure.com/foo.tgz'
    },

    'https://server.com/foo.tgz': {
      name: null,
      escapedName: null,
      type: 'remote',
      saveSpec: 'https://server.com/foo.tgz',
      fetchSpec: 'https://server.com/foo.tgz',
      raw: 'https://server.com/foo.tgz'
    },

    'foo@latest': {
      name: 'foo',
      escapedName: 'foo',
      type: 'tag',
      saveSpec: null,
      fetchSpec: 'latest',
      raw: 'foo@latest'
    },

    'foo': {
      name: 'foo',
      escapedName: 'foo',
      type: 'tag',
      saveSpec: null,
      fetchSpec: 'latest',
      raw: 'foo'
    }
  }

  Object.keys(tests).forEach(function (arg) {
    var res = npa(arg, '/test/a/b')
    t.ok(res instanceof npa.Result, arg + ' is a result')
    Object.keys(tests[arg]).forEach(function (key) {
      t.has(res[key], tests[arg][key], arg + ' [' + key + ']')
    })
    //    t.has(res, tests[arg], arg + ' matches expectations')
  })

  var objSpec = {name: 'foo', rawSpec: '1.2.3'}
  t.equal(npa(objSpec, '/whatnot').toString(), 'foo@1.2.3', 'parsed object')

  objSpec.where = '/whatnot'
  t.equal(npa(objSpec).toString(), 'foo@1.2.3', 'parsed object w/o where arg')

  t.equal(npa('git+http://foo.com/bar').toString(),
    'git+http://foo.com/bar', 'parsed git toString')

  objSpec = {raw: './foo/bar', where: '/here'}
  t.equal(npa(objSpec).fetchSpec, '/here/foo/bar', '`where` is reused')

  var res = new npa.Result({name: 'bar', rawSpec: './foo/bar'})
  t.equal(res.toString(), 'bar@./foo/bar', 'toString with only rawSpec')
  res = new npa.Result({rawSpec: './x/y'})
  t.equal(res.toString(), './x/y', 'toString with only rawSpec, no name')
  res = new npa.Result({rawSpec: ''})
  t.equal(res.toString(), '', 'toString with nothing')

  objSpec = {raw: './foo/bar', where: '/here'}
  t.equal(npa(objSpec, '/whatnot').fetchSpec, '/whatnot/foo/bar', '`where` arg overrides the one in the spec object')

  t.equal(npa(npa('foo@1.2.3')).toString(), 'foo@1.2.3', 'spec is passthrough')

  var parsedSpec = npa('./foo', './here')
  t.equal(npa(parsedSpec), parsedSpec, 'reused if no where')
  t.equal(npa(parsedSpec, './here'), parsedSpec, 'reused if where matches')
  t.notEqual(npa(parsedSpec, './there'), parsedSpec, 'new instance if where does not match')
  t.notEqual(npa(parsedSpec, './there').fetchSpec, '/there/foo', 'new instance has new where')
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

  t.has(npa.resolve('foo', '^1.2.3', '/test/a/b'), {type: 'range'}, 'npa.resolve')
  t.has(npa.resolve('foo', 'file:foo', '/test/a/b'), {type: 'directory', fetchSpec: '/test/a/b/foo'}, 'npa.resolve file:')
  t.has(npa.resolve('foo', '../foo/bar', '/test/a/b'), {type: 'directory'}, 'npa.resolve no protocol')
  t.has(npa.resolve('foo', 'file:../foo/bar', '/test/a/b'), {type: 'directory'}, 'npa.resolve file protocol')
  t.has(npa.resolve('foo', 'file:../foo/bar.tgz', '/test/a/b'), {type: 'file'}, 'npa.resolve file protocol w/ tgz')
  t.has(npa.resolve(null, '4.0.0', '/test/a/b'), {type: 'version', name: null}, 'npa.resolve with no name')
  t.has(npa.resolve('foo', 'file:abc'), {type: 'directory', raw: 'foo@file:abc'}, 'npa.resolve sets raw right')
  t.has(npa('./path/to/thing/package@1.2.3/'), {name: null, type: 'directory'}, 'npa with path in @ in it')
  t.has(npa('path/to/thing/package@1.2.3'), {name: null, type: 'directory'}, 'npa w/o leading or trailing slash')
  t.end()
})
