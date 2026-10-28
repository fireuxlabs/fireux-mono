import assert from 'node:assert/strict'
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  readFileSync,
} from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import { getAppRegistryEntries } from '../fireux-launcher/apps.mjs'
import { buildIdeFiles } from './sync.mjs'
import { changedFiles, ownerFor, planChecks, testFiles } from './check.mjs'
import { spawnSync } from 'node:child_process'

function fixture(t) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'fireux-ide-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const put = (name, content = '') => {
    mkdirSync(path.dirname(path.join(root, name)), { recursive: true })
    writeFileSync(path.join(root, name), content)
  }
  put(
    'package.json',
    JSON.stringify({
      scripts: {
        'dev:richies': 'pnpm --dir projects/werkbox/richies-reinigung dev',
        'kill:richies': 'node stop.mjs 3004',
      },
    })
  )
  put(
    'projects/werkbox/richies-reinigung/package.json',
    JSON.stringify({ scripts: { dev: 'nuxi dev --port 3004' } })
  )
  put(
    'projects/fireux/blank/package.json',
    JSON.stringify({ scripts: { dev: 'nuxi dev --port=3015' } })
  )
  put('.vscode/workspaces/werkbox.code-workspace', '{}')
  return { root, put }
}

test('app discovery preserves root shortcut aliases and reads current manifest ports', (t) => {
  const { root, put } = fixture(t)
  const apps = getAppRegistryEntries(root)
  const app = apps.find((entry) => entry.key === 'richies')
  assert.equal(app.port, 3004)
  assert.equal(app.killScript, 'kill:richies')
  assert.equal(
    app.directory,
    path.join(root, 'projects/werkbox/richies-reinigung')
  )
  assert.equal(
    apps.find((entry) => entry.key === 'blank').killScript,
    undefined
  )
  put(
    'projects/werkbox/richies-reinigung/package.json',
    JSON.stringify({ scripts: { dev: 'nuxi dev --port 3104' } })
  )
  assert.equal(
    getAppRegistryEntries(root).find((entry) => entry.key === 'richies').port,
    3104
  )
})

test('IDE configuration keeps root settings available and launches manifest-owned commands', (t) => {
  const { root } = fixture(t)
  const files = buildIdeFiles(root, getAppRegistryEntries(root))
  const workspace = JSON.parse(
    files.get('.vscode/workspaces/werkbox.code-workspace')
  )
  assert.deepEqual(workspace.folders, [
    { name: 'werkbox — FireUX Mono', path: '../..' },
  ])
  assert.equal(workspace.settings['files.exclude']['projects/fireux'], true)
  const tasks = JSON.parse(files.get('.vscode/tasks.json')).tasks
  assert.deepEqual(
    tasks.find((entry) => entry.label === 'pnpm dev:richies').args,
    ['--dir', 'projects/werkbox/richies-reinigung', 'dev']
  )
  assert.equal(
    tasks.some((entry) => entry.label === 'pnpm kill:blank'),
    false
  )
  assert.equal(
    tasks.some((entry) => entry.isBackground),
    false
  )
  const launch = JSON.parse(files.get('.vscode/launch.json')).configurations
  const server = launch.find((entry) => entry.name.startsWith('Debug: richies'))
  assert.equal(server.serverReadyAction.action, 'startDebugging')
  assert.ok(
    launch.some(
      (entry) =>
        entry.name === server.serverReadyAction.name &&
        entry.url === 'http://localhost:3004'
    )
  )
})

test('focused checks resolve the nearest package and exclude generated tests', (t) => {
  const { root, put } = fixture(t)
  const file = 'projects/werkbox/richies-reinigung/app/pages/a file.vue'
  put(file)
  put('projects/werkbox/richies-reinigung/test/example.test.mjs')
  put('projects/werkbox/richies-reinigung/node_modules/dependency.test.mjs')
  const owner = ownerFor(`${root}/`, file)
  assert.equal(testFiles(owner).length, 1)
  const commands = planChecks(root, 'check', { files: [file] })
  assert.deepEqual(commands[0].args, ['exec', 'eslint', '--', file])
  assert.ok(commands[1].args.includes('--check'))
  assert.ok(!commands.some((entry) => entry.args.includes('--write')))
  assert.equal(commands.at(-1).cwd, owner)
  assert.deepEqual(commands.at(-1).args, ['exec', 'nuxi', 'typecheck'])
  assert.throws(() => ownerFor(root, os.tmpdir()), /inside this repository/)
  assert.deepEqual(planChecks(root, 'check', { files: [] }), [])
  put('tools/ide/example.test.mjs')
  assert.equal(
    ownerFor(root, 'tools/ide/example.test.mjs'),
    path.join(root, 'tools/ide')
  )
})

test('changed files include staged, unstaged and untracked paths, preserving spaces and skipping deletions', (t) => {
  const { root, put } = fixture(t)
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
  }
  git('init', '-q')
  put('changed file.ts', 'first')
  put('deleted.ts', 'first')
  git('add', '.')
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.test',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '-qm',
    'fixture'
  )
  put('changed file.ts', 'second')
  git('add', 'changed file.ts')
  put('changed file.ts', 'third')
  put('untracked file.vue')
  rmSync(path.join(root, 'deleted.ts'))
  assert.deepEqual(changedFiles(root), [
    'changed file.ts',
    'untracked file.vue',
  ])
})

test('toolbar root discovery uses the current launcher instead of deleted scripts', (t) => {
  const { root, put } = fixture(t)
  put('pnpm-workspace.yaml', 'packages: []')
  put('tools/fireux-launcher/apps.mjs')
  const require = createRequire(import.meta.url)
  const module = { exports: {} }
  const source = readFileSync(
    new URL('../vscode-fireux-toolbar/toolbar-utils.js', import.meta.url),
    'utf8'
  )
  vm.runInNewContext(source, {
    module,
    require: (name) => (name === 'vscode' ? {} : require(name)),
    TextDecoder,
    Buffer,
  })
  assert.equal(
    module.exports.findRepoRoot(path.join(root, 'projects/werkbox')),
    root
  )
})

test('ambiguous App keys and ports fail before generating launch entries', (t) => {
  const { root, put } = fixture(t)
  put(
    'projects/fireux/other/package.json',
    JSON.stringify({ scripts: { dev: 'nuxi dev --port 3004' } })
  )
  assert.throws(() => getAppRegistryEntries(root), /Duplicate App port/)
})
