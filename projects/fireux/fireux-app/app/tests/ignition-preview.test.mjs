import assert from 'node:assert/strict'
import test from 'node:test'
import { parse } from 'vue/compiler-sfc'
import { execFileSync } from 'node:child_process'
import {
  mkdtemp,
  writeFile,
  rm,
  mkdir,
  cp,
  readFile,
  stat,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { prepareIgnitionPreview } from '../../shared/ignition-preview.ts'

const input = {
  id: 'ignition-menu-proof',
  name: 'Menu proof',
  outcome: 'Browse the existing fictional Menu.',
}

test('one deterministic source result retains reviewed purpose, framework owners and preview policy', () => {
  const artifact = prepareIgnitionPreview(input)
  assert.deepEqual(artifact, prepareIgnitionPreview(input))
  assert.equal(artifact.brief.outcome, input.outcome)
  assert.match(artifact.files['app/app.vue'], /AppShell/)
  assert.match(artifact.files['nuxt.config.ts'], /defineFireuxConfig/)
  assert.match(artifact.files['nuxt.config.ts'], /noindexPaths/)
  assert.match(artifact.files['app/pages/index.vue'], /MenuDetailCatalogue/)
  assert.match(
    artifact.files['app/pages/index.vue'],
    /kitchen\/demo\/presentation/
  )
  assert.ok(
    !Object.keys(artifact.files).some((path) =>
      /server|\.env|firebase\.json/.test(path)
    )
  )
  assert.equal(
    JSON.parse(artifact.files['package.json']).dependencies['fireux-ignite'],
    'workspace:*'
  )
})

test('unsupported/path-like identities and invalid briefs fail before source or side effects', () => {
  for (const id of [
    '../escape',
    '/tmp/x',
    'two/apps',
    'UPPER',
    'fireux-app',
    'fireux-template',
  ])
    assert.throws(() => prepareIgnitionPreview({ ...input, id }))
  for (const value of [
    null,
    [],
    { ...input, execute: 'arbitrary' },
    { ...input, outcome: {} },
    { ...input, name: '' },
    { ...input, outcome: 'a'.repeat(2001) },
  ])
    assert.throws(() => prepareIgnitionPreview(value))
})

test('reviewed strings cannot terminate or inject the generated Vue script', () => {
  const text = '</script><script>throw new Error("injected")</script>'
  const artifact = prepareIgnitionPreview({
    ...input,
    name: text,
    outcome: text,
  })
  const source = artifact.files['app/pages/index.vue']
  assert.deepEqual(parse(source).errors, [])
  assert.ok(!source.includes(text))
  assert.match(artifact.files['app/ignition/brief.ts'], /injected/)
})

test('Codex adapter regenerates the same source from a downloaded App artifact', async (t) => {
  const directory = await mkdtemp(resolve(tmpdir(), 'ignition-client-proof-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const path = resolve(directory, 'source.json')
  const artifact = prepareIgnitionPreview(input)
  await writeFile(path, JSON.stringify(artifact))
  const stdout = execFileSync(
    process.execPath,
    ['--experimental-strip-types', 'ignition/prepare.mjs', path],
    { cwd: new URL('../../', import.meta.url), encoding: 'utf8' }
  )
  assert.deepEqual(JSON.parse(stdout), artifact)
  await writeFile(
    path,
    JSON.stringify({
      ...artifact,
      files: { escape: 'untrusted downloaded source' },
    })
  )
  assert.throws(
    () =>
      execFileSync(
        process.execPath,
        ['--experimental-strip-types', 'ignition/prepare.mjs', path],
        { cwd: new URL('../../', import.meta.url), stdio: 'pipe' }
      ),
    /Command failed/
  )
})

test('materialization resumes exact source, preserves edits and removes only a failed new output', async (t) => {
  const root = await mkdtemp(resolve(tmpdir(), 'ignition-materialize-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  const host = resolve(root, 'projects/fireux/fireux-app')
  await mkdir(resolve(host, 'ignition'), { recursive: true })
  await mkdir(resolve(host, 'shared'))
  for (const path of [
    'ignition/prepare.mjs',
    'shared/ignition-preview.ts',
    'package.json',
  ])
    await cp(new URL(`../../${path}`, import.meta.url), resolve(host, path))
  const assets = resolve(
    root,
    'projects/templates/fireux-template/public/img/app'
  )
  await mkdir(assets, { recursive: true })
  await writeFile(resolve(assets, 'logo.svg'), '<svg/>')
  const path = resolve(root, 'brief.json')
  const artifact = prepareIgnitionPreview(input)
  await writeFile(path, JSON.stringify(artifact))
  const run = () =>
    JSON.parse(
      execFileSync(
        process.execPath,
        ['--experimental-strip-types', 'ignition/prepare.mjs', path, '--write'],
        { cwd: host, encoding: 'utf8', stdio: 'pipe' }
      )
    )
  assert.deepEqual(run(), artifact)
  const page = resolve(root, artifact.sourcePath, 'app/pages/index.vue')
  const timestamp = (await stat(page)).mtimeMs
  assert.deepEqual(run(), artifact)
  assert.equal((await stat(page)).mtimeMs, timestamp)
  await writeFile(page, 'operator development')
  assert.throws(run, /Command failed/)
  assert.equal(await readFile(page, 'utf8'), 'operator development')
  await rm(assets, { recursive: true })
  const failed = prepareIgnitionPreview({
    ...input,
    id: 'ignition-failed-preview',
  })
  await writeFile(path, JSON.stringify(failed))
  assert.throws(run, /Command failed/)
  await assert.rejects(stat(resolve(root, failed.sourcePath)), {
    code: 'ENOENT',
  })
})

test('preview edits and disposal suppress obsolete completion through the shared command scope', async () => {
  const { reactive, ref, computed, watch, effectScope, onScopeDispose } =
    await import('vue')
  const { compileFunction } = await import('node:vm')
  const { stripTypeScriptTypes } = await import('node:module')
  const scopeCode = (
    await readFile(
      new URL(
        '../../../../../packages/core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
        import.meta.url
      ),
      'utf8'
    )
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const useCommandScope = compileFunction(
    `${stripTypeScriptTypes(scopeCode)};return useCommandScope`,
    ['watch', 'onScopeDispose']
  )(watch, onScopeDispose)
  const source = (
    await readFile(
      new URL('../components/Ignition/Preview.vue', import.meta.url),
      'utf8'
    )
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const responses = []
  const deps = {
    reactive,
    ref,
    computed,
    watch,
    useCommandScope,
    $fetch: () => new Promise((resolve) => responses.push(resolve)),
  }
  const scope = effectScope()
  const state = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)};return {input,prepare,pending,artifact,error}`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  const old = state.prepare()
  state.input.name = 'New reviewed name'
  const current = state.prepare()
  responses[0]({ input: { name: 'OLD' } })
  await old
  assert.equal(state.artifact.value, null)
  assert.equal(state.pending.value, true)
  responses[1]({ input: { name: 'CURRENT' } })
  await current
  assert.equal(state.artifact.value.input.name, 'CURRENT')
  const disposed = state.prepare()
  scope.stop()
  responses[2]({ input: { name: 'DISPOSED' } })
  await disposed
  assert.equal(state.artifact.value.input.name, 'CURRENT')
})
