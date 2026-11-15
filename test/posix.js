// redefine process.platform before any requires so that we don't cache a require that got the non-redefined value
const { platform } = process
Object.defineProperty(process, 'platform', { value: 'linux' })

const t = require('tap')
const npa = t.mock('..', { 'node:path': require('node:path/posix') })

t.teardown(() => {
  Object.defineProperty(process, 'platform', { value: platform })
})

// These are purely for coverage
// We need tests that act like linux so that code paths are covered both ways when testing in windows itself.
//
t.test('file spec', t => {
  const actual = npa('./local')
  t.equal(actual.type, 'directory')
  t.equal(actual.raw, './local')
  t.end()
})

t.test('encoded path', t => {
  const actual = npa('./path\\backslash')
  t.equal(actual.rawSpec, './path\\backslash')
  t.end()
})

t.test('file scheme is case insensitive', t => {
  const cases = [
    ['FILE:./Package', '/test/a/b/Package', 'file:Package'],
    ['FiLe:../Package.tgz', '/test/a/Package.tgz', 'file:../Package.tgz'],
    ['FILE:/Packages/Package', '/Packages/Package', 'file:/Packages/Package'],
    ['FiLe:///Packages/Package', '/Packages/Package', 'file:/Packages/Package'],
    ['FILE://../Package', '/test/a/Package', 'file:../Package'],
    ['FILE:./Package %20#', '/test/a/b/Package %20#', 'file:Package %20#'],
  ]

  for (const [rawSpec, fetchSpec, saveSpec] of cases) {
    t.hasStrict(npa(rawSpec, '/test/a/b'), {
      raw: rawSpec,
      rawSpec,
      fetchSpec,
      saveSpec,
      type: rawSpec.endsWith('.tgz') ? 'file' : 'directory',
    }, rawSpec)
  }
  t.end()
})
