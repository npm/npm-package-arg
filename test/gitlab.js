var npa = require('../npa.js')

require('tap').test('basic', function (t) {
  t.setMaxListeners(999)

  var tests = {
    'gitlab:user/foo-js': {
      name: null,
      type: 'git',
      raw: 'gitlab:user/foo-js'
    },

    'gitlab:user/foo-js#bar/baz': {
      name: null,
      type: 'git',
      raw: 'gitlab:user/foo-js#bar/baz'
    },

    'gitlab:user..blerg--/..foo-js# . . . . . some . tags / / /': {
      name: null,
      type: 'git',
      saveSpec: 'gitlab:user..blerg--/..foo-js# . . . . . some . tags / / /',
      raw: 'gitlab:user..blerg--/..foo-js# . . . . . some . tags / / /'
    },

    'gitlab:user/foo-js#bar/baz/bin': {
      name: null,
      type: 'git',
      saveSpec: 'gitlab:user/foo-js#bar/baz/bin',
      raw: 'gitlab:user/foo-js#bar/baz/bin'
    },

    'foo@gitlab:user/foo-js': {
      name: 'foo',
      type: 'git',
      saveSpec: 'gitlab:user/foo-js',
      raw: 'foo@gitlab:user/foo-js'
    },

    'git+ssh://git@gitlab.com/user/foo#1.2.3': {
      name: null,
      type: 'git',
      saveSpec: 'git+ssh://git@gitlab.com/user/foo.git#1.2.3',
      raw: 'git+ssh://git@gitlab.com/user/foo#1.2.3'
    },

    'https://gitlab.com/user/foo.git': {
      name: null,
      type: 'git',
      saveSpec: 'git+https://gitlab.com/user/foo.git',
      raw: 'https://gitlab.com/user/foo.git'
    },

    '@foo/bar@git+ssh://gitlab.com/user/foo': {
      name: '@foo/bar',
      scope: '@foo',
      type: 'git',
      saveSpec: 'git+ssh://git@gitlab.com/user/foo.git',
      rawSpec: 'git+ssh://gitlab.com/user/foo',
      raw: '@foo/bar@git+ssh://gitlab.com/user/foo'
    }
  }

  Object.keys(tests).forEach(function (arg) {
    var res = npa(arg)
    t.ok(res instanceof npa.Result, arg + ' is a result')
    t.has(JSON.parse(JSON.stringify(res)), tests[arg], arg + ' matches expectations')
  })

  t.end()
})
