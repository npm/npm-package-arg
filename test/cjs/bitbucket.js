var npa = require('../../lib/cjs/')

require('tap').test('basic', function (t) {
  t.setMaxListeners(999)

  var tests = {
    'bitbucket:user/foo-js': {
      name: null,
      type: 'git',
      saveSpec: 'bitbucket:user/foo-js',
      raw: 'bitbucket:user/foo-js'
    },

    'bitbucket:user/foo-js#bar/baz': {
      name: null,
      type: 'git',
      saveSpec: 'bitbucket:user/foo-js#bar/baz',
      raw: 'bitbucket:user/foo-js#bar/baz'
    },

    'bitbucket:user..blerg--/..foo-js# . . . . . some . tags / / /': {
      name: null,
      type: 'git',
      saveSpec: 'bitbucket:user..blerg--/..foo-js# . . . . . some . tags / / /',
      raw: 'bitbucket:user..blerg--/..foo-js# . . . . . some . tags / / /'
    },

    'bitbucket:user/foo-js#bar/baz/bin': {
      name: null,
      type: 'git',
      saveSpec: 'bitbucket:user/foo-js#bar/baz/bin',
      raw: 'bitbucket:user/foo-js#bar/baz/bin'
    },

    'foo@bitbucket:user/foo-js': {
      name: 'foo',
      type: 'git',
      saveSpec: 'bitbucket:user/foo-js',
      raw: 'foo@bitbucket:user/foo-js'
    },

    'git+ssh://git@bitbucket.org/user/foo#1.2.3': {
      name: null,
      type: 'git',
      saveSpec: 'git+ssh://git@bitbucket.org/user/foo.git#1.2.3',
      raw: 'git+ssh://git@bitbucket.org/user/foo#1.2.3'
    },

    'https://bitbucket.org/user/foo.git': {
      name: null,
      type: 'git',
      saveSpec: 'git+https://bitbucket.org/user/foo.git',
      raw: 'https://bitbucket.org/user/foo.git'
    },

    '@foo/bar@git+ssh://bitbucket.org/user/foo': {
      name: '@foo/bar',
      scope: '@foo',
      type: 'git',
      saveSpec: 'git+ssh://git@bitbucket.org/user/foo.git',
      rawSpec: 'git+ssh://bitbucket.org/user/foo',
      raw: '@foo/bar@git+ssh://bitbucket.org/user/foo'
    }
  }

  Object.keys(tests).forEach(function (arg) {
    var res = npa(arg)
    t.ok(res instanceof npa.Result, arg + ' is a result')
    t.has(res, tests[arg], arg + ' matches expectations')
  })

  t.end()
})
