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
  const where = '/fixture/root'
  for (const [spec, saveSpec, fetchSpec, type] of [
    ['./path\\backslash', 'file:path\\backslash', '/fixture/root/path\\backslash', 'directory'],
    ['file:./path\\backslash', 'file:path\\backslash', '/fixture/root/path\\backslash', 'directory'],
    ['/fixture/path\\backslash', 'file:/fixture/path\\backslash', '/fixture/path\\backslash', 'directory'],
    ['./path\\one\\two.tgz', 'file:path\\one\\two.tgz', '/fixture/root/path\\one\\two.tgz', 'file'],
    ['./path\\one/two', 'file:path\\one/two', '/fixture/root/path\\one/two', 'directory'],
    ['./path/backslash', 'file:path/backslash', '/fixture/root/path/backslash', 'directory'],
  ]) {
    const actual = npa(spec, where)
    t.same({
      rawSpec: actual.rawSpec,
      saveSpec: actual.saveSpec,
      fetchSpec: actual.fetchSpec,
      type: actual.type,
    }, { rawSpec: spec, saveSpec, fetchSpec, type }, spec)
    t.match(npa(actual.saveSpec, where), { type, fetchSpec }, `round trip ${spec}`)
  }
  t.end()
})
