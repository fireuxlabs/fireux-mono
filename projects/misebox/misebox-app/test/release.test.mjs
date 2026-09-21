import assert from 'node:assert/strict'
import test from 'node:test'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import {
  validateConfig,
  prepareManifest,
  runtimeEnvironment,
  prepare,
  checkOutput,
  checkRules,
  verifyLiveRules,
  projectId,
  validateRulesSource,
  sealOutput,
} from '../release/release.mjs'

const config = {
  functions: [
    {
      source: '.output/server',
      codebase: 'misebox-ssr',
      runtime: 'nodejs22',
      entryPoint: 'miseboxApp',
    },
  ],
  hosting: { site: projectId, public: '.output/public' },
}
const manifest = {
  dependencies: {
    'firebase-admin': '12.7.0',
    'firebase-functions': '6.3.2',
    sharp: '0.35.3',
    '@img/sharp-darwin-arm64': '0.35.3',
  },
}
const environment = { projectId, environment: { FIREUX_AI_MODE: 'app' } }

test('release is pinned to the Misebox app and cannot implicitly deploy Rules or another project', () => {
  validateConfig(config)
  for (const value of [
    { ...config, hosting: { ...config.hosting, site: 'other' } },
    { ...config, functions: [...config.functions, config.functions[0]] },
    { ...config, firestore: { rules: 'development.rules' } },
    { ...config, storage: {} },
  ])
    assert.throws(() => validateConfig(value))
})

test('output keeps runtime dependencies but delegates native binaries to the deploy platform', () => {
  const result = prepareManifest(manifest)
  assert.equal(result.main, 'index.mjs')
  assert.equal(result.engines.node, '22')
  assert.equal(result.dependencies.sharp, '0.35.3')
  assert.equal(result.dependencies['@img/sharp-darwin-arm64'], undefined)
  assert.throws(() =>
    prepareManifest({
      dependencies: { ...manifest.dependencies, core: 'workspace:*' },
    })
  )
  assert.throws(() => prepareManifest({ dependencies: {} }))
})

test('runtime environment validates exact target and rejects injected dotenv lines', () => {
  assert.equal(runtimeEnvironment(environment), 'FIREUX_AI_MODE="app"\n')
  assert.throws(() =>
    runtimeEnvironment({ ...environment, projectId: 'other' })
  )
  assert.throws(() =>
    runtimeEnvironment({
      projectId,
      environment: { KEY: 'value\nINJECTED=true' },
    })
  )
})

test('production gate rejects open rules, missing target and incomplete policies', () => {
  const header =
    '// Production: misebox-78f9c / misebox\nrules_version = "2";\nservice cloud.firestore { '
  validateRulesSource(
    header +
      'match /databases/{database}/documents { match /{document=**} { allow read, write: if false; } } }'
  )
  for (const source of [
    '// Production: misebox-78f9c / misebox',
    header + 'allow read, write: if true; }',
    header + 'allow get, list: if (true); }',
    header + 'allow create, update, delete: if true; }',
    'rules_version = "2"; service cloud.firestore {}',
  ])
    assert.throws(() => validateRulesSource(source))
})

test('output preparation is repeatable and preflight detects stale output/environment', async (t) => {
  const root = await mkdtemp(resolve(tmpdir(), 'misebox-release-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(resolve(root, '.output/server'), { recursive: true })
  await mkdir(resolve(root, '.output/public/_nuxt'), { recursive: true })
  await mkdir(resolve(root, 'server'))
  await writeFile(resolve(root, 'firebase.json'), JSON.stringify(config))
  await writeFile(
    resolve(root, 'server/firebase.runtime-env.json'),
    JSON.stringify(environment)
  )
  await writeFile(
    resolve(root, '.output/server/package.json'),
    JSON.stringify(manifest)
  )
  await writeFile(
    resolve(root, '.output/server/index.mjs'),
    "export { handler as miseboxApp } from './handler.mjs'"
  )
  await prepare(root)
  await writeFile(
    resolve(root, '.output/server/pnpm-lock.yaml'),
    'lockfileVersion: 9.0\n'
  )
  await assert.rejects(checkOutput(root), /lockfile preparation is incomplete/)
  await sealOutput(root)
  await checkOutput(root)
  await writeFile(
    resolve(root, '.output/server/pnpm-lock.yaml'),
    'changed lockfile\n'
  )
  await assert.rejects(
    checkOutput(root),
    /lockfile preparation is incomplete or stale/
  )
  await writeFile(
    resolve(root, '.output/server/pnpm-lock.yaml'),
    'lockfileVersion: 9.0\n'
  )
  const before = await readFile(
    resolve(root, '.output/server/package.json'),
    'utf8'
  )
  await prepare(root)
  await sealOutput(root)
  assert.equal(
    await readFile(resolve(root, '.output/server/package.json'), 'utf8'),
    before
  )
  await writeFile(
    resolve(root, 'server/firebase.runtime-env.json'),
    JSON.stringify({ projectId, environment: { FIREUX_AI_MODE: 'disabled' } })
  )
  await assert.rejects(checkOutput(root), /stale/)
  await assert.rejects(checkRules(root), /Development-open Rules cannot pass/)
})

test('deployment requires exact production Rules on the exact named database', async () => {
  const source = 'rules_version = "2"; // reviewed source'
  const calls = []
  const read = async (path) => {
    calls.push(path)
    return path.includes('/releases/')
      ? { name: path, rulesetName: `projects/${projectId}/rulesets/reviewed` }
      : { source: { files: [{ content: source }] } }
  }
  const proof = await verifyLiveRules(source, read)
  assert.equal(
    calls[0],
    `projects/${projectId}/releases/cloud.firestore/misebox`
  )
  assert.equal(proof.sha256.length, 64)
  await assert.rejects(
    verifyLiveRules(source, async (path) =>
      path.includes('/releases/')
        ? { rulesetName: `projects/${projectId}/rulesets/open` }
        : { source: { files: [{ content: 'allow read, write: if true;' }] } }
    ),
    /do not match/
  )
  await assert.rejects(
    verifyLiveRules(source, async () => ({
      rulesetName: 'projects/other/rulesets/x',
    })),
    /Unexpected/
  )
})
