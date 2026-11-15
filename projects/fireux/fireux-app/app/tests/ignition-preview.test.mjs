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
  chmod,
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
  assert.equal(artifact.codexTask.ownerPath, artifact.sourcePath)
  assert.equal(artifact.codexTask.key, `${input.id}-app`)
  assert.equal(
    artifact.codexTask.title,
    `${input.id}-app — develop starting App`
  )
  assert.ok(artifact.codexTask.prompt.includes(artifact.ecosystem.sourcePath))
  assert.ok(artifact.codexTask.prompt.includes(JSON.stringify(input.outcome)))
  assert.ok(
    artifact.codexTask.prompt.includes(
      `${artifact.ecosystem.sourcePath}/docs/infrastructure.md`
    )
  )
  const infrastructure = artifact.ecosystem.files['docs/infrastructure.md']
  assert.match(infrastructure, /Status: unverified/)
  assert.match(infrastructure, /Edition.*Mode.*Location/)
  assert.ok(!infrastructure.includes('STANDARD'))
  assert.ok(!infrastructure.includes('ENTERPRISE'))
  assert.match(artifact.manualSteps.join('\n'), /edition, mode and location/)
  assert.match(
    artifact.codexTask.prompt,
    /Wait for the operator before editing/
  )
  assert.match(artifact.files['app/app.vue'], /FireuxApp/)
  assert.match(artifact.files['nuxt.config.ts'], /defineFireuxEcosystem/)
  assert.match(artifact.files['nuxt.config.ts'], /noindexPaths/)
  assert.match(artifact.files['nuxt.config.ts'], /global/)
  assert.equal(
    JSON.parse(artifact.files['package.json']).dependencies['fireux-ecosystem'],
    'workspace:*'
  )
  assert.ok(!artifact.files['nuxt.config.ts'].includes('fireux-blogs/layer'))
  assert.ok(!artifact.files['nuxt.config.ts'].includes('fireux-products/layer'))
  assert.match(artifact.files['app/pages/pricing/index.vue'], /usePricing/)
  assert.match(
    artifact.files['app/pages/pricing/index.vue'],
    /fireux-app\/runtime\/app\/composables\/pricing\/usePricing/
  )
  assert.equal(
    JSON.parse(artifact.files['package.json']).dependencies['fireux-app'],
    'workspace:*'
  )
  assert.match(
    artifact.ecosystem.files['src/module.ts'],
    /configureFireuxEcosystemModule/
  )
  assert.ok(!artifact.files['package.json'].includes('../fireux-app/.env'))
  assert.match(
    artifact.ecosystem.files['src/config/firebase/ecosystem.config.ts'],
    /name: "Menu proof"/
  )
  assert.match(
    artifact.ecosystem.files['src/config/firebase/ecosystem.config.ts'],
    /description: "Browse the existing fictional Menu\."/
  )
  assert.match(artifact.files['.env.example'], /STRIPE_SECRET_KEY=\n/)
  assert.match(artifact.files['.env.example'], /STRIPE_WEBHOOK_SECRET=\n/)
  assert.ok(
    !artifact.files['.env.example'].includes(
      'NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
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
    'app',
    'ecosystem',
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
  for (const [path, source] of Object.entries(artifact.files)) {
    if (!path.endsWith('.vue')) continue
    assert.deepEqual(parse(source).errors, [])
    assert.ok(!source.includes(text))
  }
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
  await writeFile(
    path,
    JSON.stringify({
      ...artifact,
      codexTask: { ...artifact.codexTask, prompt: 'Unreviewed replacement' },
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
    'ignition/create.mjs',
    'ignition/delivery.mjs',
    'shared/ignition-preview.ts',
    'package.json',
  ])
    await cp(new URL(`../../${path}`, import.meta.url), resolve(host, path))
  await cp(
    new URL('../../../../../package.json', import.meta.url),
    resolve(root, 'package.json')
  )
  await mkdir(resolve(root, 'tools/ide'), { recursive: true })
  await cp(
    new URL('../../../../../tools/ide/codex-task.mjs', import.meta.url),
    resolve(root, 'tools/ide/codex-task.mjs')
  )
  const codex = resolve(root, 'fake-codex.mjs')
  await writeFile(
    codex,
    `#!/usr/bin/env node
import { createInterface } from 'node:readline'
for await (const line of createInterface({ input: process.stdin })) {
  const message = JSON.parse(line)
  if (!('id' in message)) continue
  const result = message.method === 'thread/start'
    ? { thread: { id: 'ignition-integration-thread' } }
    : message.method === 'turn/start'
      ? { turn: { id: 'ignition-integration-turn' } }
      : {}
  process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: message.id, result }) + '\\n')
}
`
  )
  await chmod(codex, 0o755)
  const assets = resolve(
    root,
    'projects/templates/fireux-template/public/img/app'
  )
  await mkdir(assets, { recursive: true })
  await writeFile(resolve(assets, 'logo.svg'), '<svg/>')
  const path = resolve(root, 'brief.json')
  const artifact = prepareIgnitionPreview(input)
  await writeFile(path, JSON.stringify(artifact))
  const run = (binary = codex) =>
    JSON.parse(
      execFileSync(
        process.execPath,
        [
          '--experimental-strip-types',
          '--input-type=module',
          '-e',
          `import {readFile} from 'node:fs/promises'; import {createIgnitionSource} from './ignition/create.mjs'; const artifact=JSON.parse(await readFile(process.argv[1],'utf8')); const result=await createIgnitionSource({root:process.argv[2],input:artifact.input,executable:process.argv[3]}); console.log(JSON.stringify(result)); if(result.codexTaskResult.status==='pending')process.exitCode=1;`,
          path,
          root,
          binary,
        ],
        { cwd: host, encoding: 'utf8', stdio: 'pipe' }
      )
    )
  const first = run()
  const { codexTaskResult: createdTask, ...writtenArtifact } = first
  assert.deepEqual(writtenArtifact, artifact)
  assert.equal(createdTask.status, 'created')
  assert.equal(createdTask.threadId, 'ignition-integration-thread')
  const page = resolve(root, artifact.sourcePath, 'app/pages/index.vue')
  const timestamp = (await stat(page)).mtimeMs
  const { codexTaskResult: existingTask, ...resumedArtifact } = run()
  assert.deepEqual(resumedArtifact, artifact)
  assert.equal(existingTask.status, 'existing')
  assert.equal(existingTask.threadId, createdTask.threadId)
  assert.equal((await stat(page)).mtimeMs, timestamp)
  const pending = prepareIgnitionPreview({
    ...input,
    id: 'ignition-task-pending-proof',
  })
  await writeFile(path, JSON.stringify(pending))
  let failure
  try {
    run(resolve(root, 'unavailable-codex'))
    assert.fail('Unavailable Codex must report a pending task')
  } catch (error) {
    failure = error
  }
  assert.equal(JSON.parse(failure.stdout).codexTaskResult.status, 'pending')
  assert.equal(
    await readFile(resolve(root, pending.sourcePath, 'app/app.vue'), 'utf8'),
    pending.files['app/app.vue']
  )
  assert.equal(run().codexTaskResult.status, 'created')
  await writeFile(path, JSON.stringify(artifact))
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
