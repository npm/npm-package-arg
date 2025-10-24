// redefine process.platform before any requires so that we don't cache a require that got the non-redefined value
const { platform } = process
Object.defineProperty(process, 'platform', { value: 'linux' })

const t = require('tap')
const npa = require('..')

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
