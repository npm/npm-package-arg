global.FAKE_WINDOWS = true

var npa = require('../npa.js')
var test = require('tap').test

var cases = {
  'C:\\x\\y\\z': {
    raw: 'C:\\x\\y\\z',
    scope: null,
    name: null,
    escapedName: null,
    rawSpec: 'C:\\x\\y\\z',
    fetchSpec: 'C:/x/y/z',
    type: 'directory'
  },
  'foo@C:\\x\\y\\z': {
    raw: 'foo@C:\\x\\y\\z',
    scope: null,
    name: 'foo',
    escapedName: 'foo',
    rawSpec: 'C:\\x\\y\\z',
    fetchSpec: 'C:/x/y/z',
    type: 'directory'
  },
  'foo@file:///C:\\x\\y\\z': {
    raw: 'foo@file:///C:\\x\\y\\z',
    scope: null,
    name: 'foo',
    escapedName: 'foo',
    rawSpec: 'file:///C:\\x\\y\\z',
    fetchSpec: 'C:/x/y/z',
    type: 'directory'
  },
  'foo@file://C:\\x\\y\\z': {
    raw: 'foo@file://C:\\x\\y\\z',
    scope: null,
    name: 'foo',
    escapedName: 'foo',
    rawSpec: 'file://C:\\x\\y\\z',
    fetchSpec: 'C:/x/y/z',
    type: 'directory'
  },
  'file:///C:\\x\\y\\z': {
    raw: 'file:///C:\\x\\y\\z',
    scope: null,
    name: null,
    escapedName: null,
    rawSpec: 'file:///C:\\x\\y\\z',
    fetchSpec: 'C:/x/y/z',
    type: 'directory'
  },
  'file://C:\\x\\y\\z': {
    raw: 'file://C:\\x\\y\\z',
    scope: null,
    name: null,
    escapedName: null,
    rawSpec: 'file://C:\\x\\y\\z',
    fetchSpec: 'C:/x/y/z',
    type: 'directory'
  },
  'foo@/foo/bar/baz': {
    raw: 'foo@/foo/bar/baz',
    scope: null,
    name: 'foo',
    escapedName: 'foo',
    rawSpec: '/foo/bar/baz',
    fetchSpec: '/foo/bar/baz',
    type: 'directory'
  }
}

test('parse a windows path', function (t) {
  Object.keys(cases).forEach(function (c) {
    var expect = cases[c]
    var actual = npa(c)
    t.has(actual, expect, c)
  })
  t.end()
})
