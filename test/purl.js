'use strict'
var test = require('tap').test
var npa = require('..')

test('toPurl - valid', function (t) {
  // Unscoped package
  t.equal(npa.toPurl('foo@1.2.3'), 'pkg:npm/foo@1.2.3')

  // Scoped package
  t.equal(
    npa.toPurl('@foo/bar@1.2.3-alpha.1'),
    'pkg:npm/%40foo/bar@1.2.3-alpha.1')

  // Non-default registry
  t.equal(
    npa.toPurl({ name: '@foo/bar', rawSpec: '1.0.0' }, 'https://npm.pkg.github.com'),
    'pkg:npm/%40foo/bar@1.0.0?repository_url=https://npm.pkg.github.com'
  )

  // Default registry
  t.equal(
    npa.toPurl({ name: '@foo/bar', rawSpec: '1.0.0' }, 'https://registry.npmjs.org'),
    'pkg:npm/%40foo/bar@1.0.0'
  )

  t.end()
})

test('toPurl - invalid', function (t) {
  // Invalid version
  t.throws(() => npa.toPurl({ name: 'foo/bar', rawSpec: '1.0.0' }), {
    code: 'EINVALIDPACKAGENAME',
  })

  // Invalid version
  t.throws(() => npa.toPurl('foo@a.b.c'), {
    code: 'EINVALIDPURLTYPE',
  })

  // Invalid type
  t.throws(() => npa.toPurl('git+ssh://git@github.com/user/foo#1.2.3'), {
    code: 'EINVALIDPURLTYPE',
  })

  t.end()
})
