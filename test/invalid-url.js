const npa = require('../')
const t = require('tap')
t.throws(() => npa('foo@gopher://goodluckwiththat'), {
  code: 'EUNSUPPORTEDPROTOCOL'
})
