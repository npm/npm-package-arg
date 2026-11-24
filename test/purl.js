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
    'pkg:npm/%40foo/bar@1.0.0?repository_url=https:%2F%2Fnpm.pkg.github.com'
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

test('toPurl - registry qualifier round trips', function (t) {
  const registries = [
    'https://registry.example.test/npm/?view=public&mode=full',
    'https://registry.example.test/npm/#stable',
    'https://registry.example.test/packages%2Fteam/',
    'https://registry.example.test/a+b/',
    "https://registry.example.test/!'()*/",
    'https://registry.example.test/café/',
    'https://registry.example.test/a b/',
  ]

  for (const registry of registries) {
    for (const name of ['example', '@scope/example']) {
      const purl = new URL(npa.toPurl(name + '@1.2.3', registry))
      t.equal(purl.searchParams.get('repository_url'), registry, 'preserves the registry URL')
      t.same([...purl.searchParams.keys()], ['repository_url'], 'does not add qualifiers')
      t.equal(purl.hash, '', 'does not add a subpath')
    }
  }

  t.equal(
    npa.toPurl('example@1.2.3', "https://registry.example.test/!'()*/"),
    'pkg:npm/example@1.2.3?repository_url=https:%2F%2Fregistry.example.test%2F%21%27%28%29%2A%2F',
    'encodes reserved punctuation while keeping the colon'
  )
  t.end()
})
