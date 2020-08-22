var npa = require('../../lib/cjs/')
const t = require('tap')
t.throws(() => npa('foo@gopher://goodluckwiththat'), {
  code: 'EUNSUPPORTEDPROTOCOL'
})
