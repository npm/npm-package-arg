const npa = require('..')
const t = require('tap')
const path = require('node:path')
t.throws(() => npa('foo@gopher://goodluckwiththat'), {
  code: 'EUNSUPPORTEDPROTOCOL',
})

t.test('unsupported schemes use the full URI scheme grammar', t => {
  for (const scheme of [
    'custom',
    'custom1',
    'custom-transport',
    'custom.transport',
    'custom+transport',
    'Custom1+transport.v2',
  ]) {
    const spec = `${scheme}://example.test/pkg.tgz`
    const expected = {
      code: 'EUNSUPPORTEDPROTOCOL',
      message: `Unsupported URL Type "${scheme.toLowerCase()}:": ${spec}`,
    }
    t.throws(() => npa(spec), expected, spec)
    t.throws(() => npa(`@fixture/pkg@${spec}`), expected, `scoped ${spec}`)
    t.throws(() => npa.resolve('fixture', spec), expected, `resolve ${spec}`)
  }
  t.end()
})

t.test('explicit local paths with scheme characters remain local', t => {
  for (const [location, type] of [
    ['custom-transport:folder/pkg.tgz', 'file'],
    ['custom+transport:folder/pkg', 'directory'],
  ]) {
    for (const prefix of ['./', 'file:']) {
      const spec = `${prefix}${location}`
      const res = npa(spec)
      t.same({ type: res.type, fetchSpec: res.fetchSpec }, {
        type,
        fetchSpec: path.resolve(location),
      }, spec)
    }
  }
  t.end()
})
