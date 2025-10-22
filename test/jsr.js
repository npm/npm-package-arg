const t = require('tap')
const npa = require('..')

t.test('JSR specifiers', t => {
  const tests = {
    'jsr:@std/testing': {
      name: '@jsr/std__testing',
      escapedName: '@jsr%2fstd__testing',
      scope: '@jsr',
      type: 'range',
      registry: true,
      saveSpec: 'jsr:@std/testing',
      fetchSpec: '*',
      raw: 'jsr:@std/testing',
      rawSpec: '*',
    },

    'jsr:@std/testing@1.0.0': {
      name: '@jsr/std__testing',
      escapedName: '@jsr%2fstd__testing',
      scope: '@jsr',
      type: 'version',
      registry: true,
      saveSpec: 'jsr:@std/testing@1.0.0',
      fetchSpec: '1.0.0',
      raw: 'jsr:@std/testing@1.0.0',
      rawSpec: '1.0.0',
    },

    'jsr:@std/testing@^1.0.0': {
      name: '@jsr/std__testing',
      escapedName: '@jsr%2fstd__testing',
      scope: '@jsr',
      type: 'range',
      registry: true,
      saveSpec: 'jsr:@std/testing@^1.0.0',
      fetchSpec: '^1.0.0',
      raw: 'jsr:@std/testing@^1.0.0',
      rawSpec: '^1.0.0',
    },

    'jsr:@std/testing@~1.2.3': {
      name: '@jsr/std__testing',
      escapedName: '@jsr%2fstd__testing',
      scope: '@jsr',
      type: 'range',
      registry: true,
      saveSpec: 'jsr:@std/testing@~1.2.3',
      fetchSpec: '~1.2.3',
      raw: 'jsr:@std/testing@~1.2.3',
      rawSpec: '~1.2.3',
    },

    'jsr:@std/testing@latest': {
      name: '@jsr/std__testing',
      escapedName: '@jsr%2fstd__testing',
      scope: '@jsr',
      type: 'tag',
      registry: true,
      saveSpec: 'jsr:@std/testing@latest',
      fetchSpec: 'latest',
      raw: 'jsr:@std/testing@latest',
      rawSpec: 'latest',
    },

    'jsr:@sxzz/tsdown': {
      name: '@jsr/sxzz__tsdown',
      escapedName: '@jsr%2fsxzz__tsdown',
      scope: '@jsr',
      type: 'range',
      registry: true,
      saveSpec: 'jsr:@sxzz/tsdown',
      fetchSpec: '*',
      raw: 'jsr:@sxzz/tsdown',
      rawSpec: '*',
    },

    'jsr:@sxzz/tsdown@2.0.0': {
      name: '@jsr/sxzz__tsdown',
      escapedName: '@jsr%2fsxzz__tsdown',
      scope: '@jsr',
      type: 'version',
      registry: true,
      saveSpec: 'jsr:@sxzz/tsdown@2.0.0',
      fetchSpec: '2.0.0',
      raw: 'jsr:@sxzz/tsdown@2.0.0',
      rawSpec: '2.0.0',
    },

    'jsr:@oak/oak@>=12.0.0 <13.0.0': {
      name: '@jsr/oak__oak',
      escapedName: '@jsr%2foak__oak',
      scope: '@jsr',
      type: 'range',
      registry: true,
      saveSpec: 'jsr:@oak/oak@>=12.0.0 <13.0.0',
      fetchSpec: '>=12.0.0 <13.0.0',
      raw: 'jsr:@oak/oak@>=12.0.0 <13.0.0',
      rawSpec: '>=12.0.0 <13.0.0',
    },
  }

  Object.keys(tests).forEach(arg => {
    t.test(arg, t => {
      const res = npa(arg)
      t.ok(res instanceof npa.Result, `${arg} is a result`)
      Object.keys(tests[arg]).forEach(key => {
        t.match(res[key], tests[arg][key], `${arg} [${key}]`)
      })
      t.end()
    })
  })

  t.end()
})

t.test('JSR validation errors', t => {
  t.test('unscoped package name', t => {
    t.throws(
      () => npa('jsr:unscoped'),
      /JSR packages must be scoped/,
      'throws error for unscoped JSR package'
    )
    t.end()
  })

  t.test('scope only, no package name', t => {
    t.throws(
      () => npa('jsr:@scopeonly'),
      /JSR packages must be scoped/,
      'throws error for scope without package name'
    )
    t.end()
  })

  t.test('invalid package name characters', t => {
    t.throws(
      () => npa('jsr:@scope/in valid'),
      /Invalid package name/,
      'throws error for invalid package name with spaces'
    )
    t.end()
  })

  t.test('invalid tag name with special characters', t => {
    t.throws(
      () => npa('jsr:@std/testing@tag with spaces'),
      /Invalid tag name/,
      'throws error for tag with invalid characters'
    )
    t.end()
  })

  t.end()
})

t.test('JSR with Result.toString()', t => {
  const res = npa('jsr:@std/testing@1.0.0')
  t.equal(
    res.toString(),
    '@jsr/std__testing@jsr:@std/testing@1.0.0',
    'toString includes saveSpec'
  )
  t.end()
})

t.test('JSR Result object passthrough', t => {
  const res = npa('jsr:@std/testing')
  const res2 = npa(res)
  t.equal(res, res2, 'passing Result object returns same Result')
  t.end()
})

t.test('JSR case insensitivity', t => {
  const res1 = npa('jsr:@std/testing')
  const res2 = npa('JSR:@std/testing')
  const res3 = npa('JsR:@std/testing')

  t.equal(res1.name, '@jsr/std__testing', 'lowercase jsr: works')
  t.equal(res2.name, '@jsr/std__testing', 'uppercase JSR: works')
  t.equal(res3.name, '@jsr/std__testing', 'mixed case JsR: works')
  t.end()
})
