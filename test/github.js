var npa = require('../npa.js')

require('tap').test('basic', function (t) {
  t.setMaxListeners(999)

  var tests = {
    'user/foo-js': {
      name: null,
      type: 'git',
      saveSpec: 'github:user/foo-js',
      raw: 'user/foo-js'
    },

    'user/foo-js#bar/baz': {
      name: null,
      type: 'git',
      saveSpec: 'github:user/foo-js#bar/baz',
      raw: 'user/foo-js#bar/baz'
    },

    'user..blerg--/..foo-js# . . . . . some . tags / / /': {
      name: null,
      type: 'git',
      saveSpec: 'github:user..blerg--/..foo-js# . . . . . some . tags / / /',
      raw: 'user..blerg--/..foo-js# . . . . . some . tags / / /'
    },

    'user/foo-js#bar/baz/bin': {
      name: null,
      type: 'git',
      raw: 'user/foo-js#bar/baz/bin'
    },

    'foo@user/foo-js': {
      name: 'foo',
      type: 'git',
      saveSpec: 'github:user/foo-js',
      raw: 'foo@user/foo-js'
    },

    'github:user/foo-js': {
      name: null,
      type: 'git',
      saveSpec: 'github:user/foo-js',
      raw: 'github:user/foo-js'
    },

    'git+ssh://git@github.com/user/foo#1.2.3': {
      name: null,
      type: 'git',
      saveSpec: 'git+ssh://git@github.com/user/foo.git#1.2.3',
      raw: 'git+ssh://git@github.com/user/foo#1.2.3'
    },

    'git+ssh://git@github.com:user/foo#1.2.3': {
      name: null,
      type: 'git',
      saveSpec: 'git+ssh://git@github.com/user/foo.git#1.2.3',
      raw: 'git+ssh://git@github.com:user/foo#1.2.3'
    },

    'git://github.com/user/foo': {
      name: null,
      type: 'git',
      saveSpec: 'git://github.com/user/foo.git',
      raw: 'git://github.com/user/foo'
    },

    'https://github.com/user/foo.git': {
      name: null,
      type: 'git',
      saveSpec: 'git+https://github.com/user/foo.git',
      raw: 'https://github.com/user/foo.git'
    },

    '@foo/bar@git+ssh://github.com/user/foo': {
      name: '@foo/bar',
      scope: '@foo',
      type: 'git',
      saveSpec: 'git+ssh://git@github.com/user/foo.git',
      rawSpec: 'git+ssh://github.com/user/foo',
      raw: '@foo/bar@git+ssh://github.com/user/foo'
    },

    'foo@bar/foo': {
      name: 'foo',
      type: 'git',
      saveSpec: 'github:bar/foo',
      raw: 'foo@bar/foo'
    }
  }

  Object.keys(tests).forEach(function (arg) {
    var res = npa(arg)
    t.ok(res instanceof npa.Result, arg + ' is a result')
    t.has(res, tests[arg], arg + ' matches expectations')
  })

  t.end()
})
