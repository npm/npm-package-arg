const t = require('tap')

const platform = Object.getOwnPropertyDescriptor(process, 'platform')
Object.defineProperty(process, 'platform', { ...platform, value: 'linux' })
t.teardown(() => Object.defineProperty(process, 'platform', platform))

const npa = require('..')

t.on('bailout', () => process.exit(1))

// this is only for coverage in windows
t.hasStrict(npa('foo@1.2'), {
  name: 'foo',
  escapedName: 'foo',
  type: 'range',
  saveSpec: null,
  fetchSpec: '1.2',
  raw: 'foo@1.2',
  rawSpec: '1.2',
})

t.hasStrict(npa('file:/path/to/foo'), {
  type: 'directory',
  saveSpec: 'file:/path/to/foo',
  fetchSpec: '/path/to/foo',
  raw: 'file:/path/to/foo',
})
