// redefine process.platform before any requires so that we don't cache a require that got the non-redefined value
const { platform } = process
Object.defineProperty(process, 'platform', { value: 'win32' })

const t = require('tap')
const npa = require('..')

t.teardown(() => {
  Object.defineProperty(process, 'platform', { value: platform })
})

const cases = {
  'C:\\x\\y\\z': {
    raw: 'C:\\x\\y\\z',
    scope: null,
    name: null,
    escapedName: null,
    rawSpec: 'C:\\x\\y\\z',
    fetchSpec: 'C:\\x\\y\\z',
    type: 'directory',
  },

  'foo@C:\\x\\y\\z': {
    raw: 'foo@C:\\x\\y\\z',
    scope: null,
    name: 'foo',
    escapedName: 'foo',
    rawSpec: 'C:\\x\\y\\z',
    fetchSpec: 'C:\\x\\y\\z',
    type: 'directory',
  },

  'foo@file:///C:\\x\\y\\z': {
    raw: 'foo@file:///C:\\x\\y\\z',
    scope: null,
    name: 'foo',
    escapedName: 'foo',
    rawSpec: 'file:///C:\\x\\y\\z',
    fetchSpec: 'C:\\x\\y\\z',
    type: 'directory',
  },

  'foo@file://C:\\x\\y\\z': {
    raw: 'foo@file://C:\\x\\y\\z',
    scope: null,
    name: 'foo',
    escapedName: 'foo',
    rawSpec: 'file://C:\\x\\y\\z',
    fetchSpec: 'C:\\x\\y\\z',
    type: 'directory',
  },

  'file:///C:\\x\\y\\z': {
    raw: 'file:///C:\\x\\y\\z',
    scope: null,
    name: null,
    escapedName: null,
    rawSpec: 'file:///C:\\x\\y\\z',
    fetchSpec: 'C:\\x\\y\\z',
    type: 'directory',
  },

  'file://C:\\x\\y\\z': {
    raw: 'file://C:\\x\\y\\z',
    scope: null,
    name: null,
    escapedName: null,
    rawSpec: 'file://C:\\x\\y\\z',
    fetchSpec: 'C:\\x\\y\\z',
    type: 'directory',
  },

  'foo@/foo/bar/baz': {
    raw: 'foo@/foo/bar/baz',
    scope: null,
    name: 'foo',
    escapedName: 'foo',
    rawSpec: '/foo/bar/baz',
    fetchSpec: 'C:\\foo\\bar\\baz',
    type: 'directory',
  },

  'foo@git+file://C:\\x\\y\\z': {
    type: 'git',
    registry: null,
    where: null,
    raw: 'foo@git+file://C:\\x\\y\\z',
    name: 'foo',
    escapedName: 'foo',
    scope: null,
    rawSpec: 'git+file://C:\\x\\y\\z',
    saveSpec: 'git+file://C:\\x\\y\\z',
    fetchSpec: 'file://c:/x/y/z',
    gitRange: null,
    gitCommittish: null,
    hosted: null,
  },
}

t.test('parse a windows path', function (t) {
  Object.keys(cases).forEach(function (c) {
    t.test(c, t => {
      const expect = cases[c]
      const actual = npa(c, 'C:\\test\\path')
      t.has(actual, expect, c)
      t.end()
    })
  })
  t.end()
})

t.test('Git file protocol prefixes are case-insensitive', t => {
  for (const scheme of ['git+file:', 'GIT+FILE:', 'git+FILE:']) {
    for (const location of ['C:\\Owner\\Repo', 'C:/Owner/Repo']) {
      const spec = `${scheme}//${location}#Release`
      const input = `fixture@${spec}`
      t.test(input, t => {
        const res = npa(input)
        t.same({
          name: res.name,
          type: res.type,
          rawSpec: res.rawSpec,
          saveSpec: res.saveSpec,
          fetchSpec: res.fetchSpec,
          gitCommittish: res.gitCommittish,
        }, {
          name: 'fixture',
          type: 'git',
          rawSpec: spec,
          saveSpec: spec,
          fetchSpec: 'file://c:/Owner/Repo',
          gitCommittish: 'Release',
        })
        t.end()
      })
    }
  }
  t.end()
})
