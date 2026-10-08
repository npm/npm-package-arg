const t = require('tap')
const HostedGit = require('hosted-git-info')

const trackHosted = t => {
  const calls = []
  const npa = t.mock('..', {
    'hosted-git-info': {
      fromUrl: (...args) => {
        calls.push(args[0])
        return HostedGit.fromUrl(...args)
      },
    },
  })
  return { npa, calls }
}

t.test('registry specifiers do not need hosted Git parsing', t => {
  const { npa, calls } = trackHosted(t)
  const specs = [
    [undefined, 'range'], ['', 'range'], ['*', 'range'], ['1.2.3', 'version'],
    ['v1.2.3', 'version'], ['=1.2.3', 'version'], ['1.2.3-beta.1+build.2', 'version'],
    ['^1.2.3', 'range'], ['~1.2.3', 'range'], ['1.2', 'range'], ['1.x', 'range'],
    ['>=1.0.0 <2.0.0', 'range'], ['1.0.0 || 2.0.0', 'range'],
    ['latest', 'tag'], ['next', 'tag'], ['release-2026', 'tag'],
  ]
  for (const [spec, type] of specs) {
    t.has(npa.resolve('fixture', spec), {
      type,
      registry: true,
      fetchSpec: spec || '',
    }, String(spec))
  }
  t.has(npa('fixture'), { type: 'range', fetchSpec: '*' })
  t.has(npa('@scope/fixture@'), { type: 'range', fetchSpec: '*' })
  t.has(npa('fixture@npm:other@^1.2.3'), {
    type: 'alias',
    subSpec: { type: 'range', fetchSpec: '^1.2.3' },
  })
  t.throws(() => npa('fixture@bad tag'), { code: 'EINVALIDTAGNAME' })
  t.throws(() => npa('fixture@>=^4'), { code: 'EINVALIDTAGNAME' })
  t.same(calls, [], 'ordinary registry inputs bypass hosted Git parsing')
  t.end()
})

t.test('hosted Git specifiers still reach the hosted parser', t => {
  const { npa, calls } = trackHosted(t)
  const specs = [
    'owner/repository', 'owner/repository#semver:^1.2.3', 'foo#bar/baz',
    'github:owner/repository', 'bitbucket:owner/repository', 'gitlab:owner/repository',
    'gist:abcdef', 'git@gist.github.com:abcdef',
    'git@github.com:owner/repository', 'git@github.com/owner/repository',
    'git+ssh://git@github.com/owner/repository.git#main',
    'https://github.com/owner/repository.git',
  ]
  for (const spec of specs) {
    t.has(npa.resolve('fixture', spec), { type: 'git' }, spec)
  }
  t.same(calls, specs)
  t.end()
})

t.test('custom hosted providers can parse an SSH host without a path', t => {
  const CustomHostedGit = t.mock('hosted-git-info', {})
  const hosts = require('hosted-git-info/lib/hosts.js')
  CustomHostedGit.addHost('custom', {
    ...hosts.gist,
    domain: 'custom.invalid',
    protocols: ['git+ssh:'],
    extract: () => ({ user: 'fixture', project: 'repository', committish: '' }),
  })
  const npa = t.mock('..', { 'hosted-git-info': CustomHostedGit })
  t.has(npa.resolve('fixture', 'git@custom.invalid'), {
    type: 'git',
    hosted: { type: 'custom', domain: 'custom.invalid', project: 'repository' },
    saveSpec: 'git+ssh://git@custom.invalid/repository.git',
  })
  t.end()
})
