global.FAKE_WINDOWS = true

const npa = require('../npa.js')
const t = require('tap')

t.on('bailout', () => process.exit(1))

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
    const expect = cases[c]
    const actual = npa(c, 'C:\\test\\path')
    t.has(actual, expect, c)
  })
  t.end()
})
