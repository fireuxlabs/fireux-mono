import assert from 'node:assert/strict'
import test from 'node:test'
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  cp,
  realpath,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
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
  cloudJson,
  appRoot,
  developmentRulesTemplate,
  parseRulesPolicyOptions,
  validateDevelopmentRules,
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

test('Rules API reads use the pinned Misebox quota project and reject foreign targets', async () => {
  const calls = []
  const dependencies = {
    run(command, args) {
      assert.equal(command, 'gcloud')
      assert.deepEqual(args, ['auth', 'print-access-token'])
      return 'test-token\n'
    },
    async request(url, options) {
      calls.push(url)
      assert.equal(options.headers['x-goog-user-project'], 'misebox-78f9c')
      assert.equal(options.headers.authorization, 'Bearer test-token')
      return { ok: true, json: async () => ({ verified: true }) }
    },
  }
  const path = 'projects/misebox-78f9c/releases/cloud.firestore/misebox'
  assert.deepEqual(await cloudJson(path, dependencies), { verified: true })
  assert.deepEqual(calls, [`https://firebaserules.googleapis.com/v1/${path}`])
  await assert.rejects(
    cloudJson('projects/other/rulesets/x', dependencies),
    /Unexpected/
  )
  assert.equal(calls.length, 1)
})

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

test('development policy requires an explicit exact selection; production remains the default', () => {
  assert.equal(parseRulesPolicyOptions(), 'production')
  assert.equal(
    parseRulesPolicyOptions(['--rules-policy', 'production']),
    'production'
  )
  assert.equal(
    parseRulesPolicyOptions(['--rules-policy', 'development']),
    'development'
  )
  for (const options of [
    ['development'],
    ['--rules-policy'],
    ['--rules-policy', 'open'],
    ['--rules-policy', 'development', '--project', 'other'],
    ['--rules-policy', 'development', '--rules-policy', 'production'],
  ])
    assert.throws(() => parseRulesPolicyOptions(options), /Use --rules-policy/)
})

test('development source reuses the current Core composition and rejects target or effective policy drift', async (t) => {
  const { composeFirestoreRules } = await import(
    '../../../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs'
  )
  const template = await readFile(
    resolve(appRoot, developmentRulesTemplate),
    'utf8'
  )
  const composed = await composeFirestoreRules(template)
  const source = await checkRules(appRoot, 'development')
  assert.equal(source, composed.content)
  validateDevelopmentRules(composed)
  assert.throws(
    () => validateRulesSource(source),
    /development-open production/
  )
  await assert.rejects(checkRules(appRoot, 'open'), /Unknown/)
  for (const manifest of [
    { ...composed.manifest, key: 'other' },
    { ...composed.manifest, projectId: 'other' },
    { ...composed.manifest, databaseIds: ['(default)'] },
    { ...composed.manifest, databaseIds: ['misebox', 'other'] },
    { ...composed.manifest, fragments: ['open', 'owner', 'close'] },
  ])
    assert.throws(
      () => validateDevelopmentRules({ manifest, content: source }),
      /target only/
    )
  for (const content of [
    source.replace('if true;', 'if false;'),
    source.replace('allow read, write', 'allow read'),
    source.replace('match /{document=**}', 'match /users/{uid}'),
    source + '\nfunction unexpected() { return true; }\n',
  ])
    assert.throws(
      () => validateDevelopmentRules({ manifest: composed.manifest, content }),
      /public read\/write policy/
    )

  const repo = await mkdtemp(resolve(tmpdir(), 'misebox-policy-'))
  t.after(() => rm(repo, { recursive: true, force: true }))
  const root = resolve(repo, 'projects/misebox/misebox-app')
  const target = resolve(root, developmentRulesTemplate)
  await mkdir(resolve(target, '..'), { recursive: true })
  await writeFile(target, template)
  assert.equal(await checkRules(root, 'development'), source)
  // A development template cannot satisfy the default production policy.
  await assert.rejects(checkRules(root), /Development-open Rules cannot pass/)
  for (const replacement of [
    template.replace(
      '@fireux-rules-project misebox-78f9c',
      '@fireux-rules-project other'
    ),
    template.replace(
      '@fireux-rules-databases misebox',
      '@fireux-rules-databases misebox,other'
    ),
  ]) {
    await writeFile(target, replacement)
    await assert.rejects(checkRules(root, 'development'), /target only/)
  }
})

test('development upload still requires exact live source on the pinned named database', async () => {
  const source = await checkRules(appRoot, 'development')
  const calls = []
  const read = async (path) => {
    calls.push(path)
    return path.includes('/releases/')
      ? {
          name: path,
          rulesetName: `projects/${projectId}/rulesets/development`,
        }
      : { source: { files: [{ content: source }] } }
  }
  const proof = await verifyLiveRules(source, read, 'development')
  assert.equal(
    calls[0],
    `projects/${projectId}/releases/cloud.firestore/misebox`
  )
  assert.equal(proof.policy, 'development')
  assert.equal(proof.projectId, projectId)
  assert.equal(proof.databaseId, 'misebox')
  assert.equal(proof.sha256.length, 64)
  await assert.rejects(
    verifyLiveRules(
      source,
      async (path) =>
        path.includes('/releases/')
          ? { rulesetName: `projects/${projectId}/rulesets/production` }
          : {
              source: {
                files: [{ content: source.replace('if true;', 'if false;') }],
              },
            },
      'development'
    ),
    /reviewed development source/
  )
  await assert.rejects(
    verifyLiveRules(
      source,
      async () => ({
        rulesetName: 'projects/other/rulesets/development',
      }),
      'development'
    ),
    /Unexpected/
  )
  await assert.rejects(verifyLiveRules(source, read, 'open'), /Unknown/)
})

test('native preflight selects development without running production tests; default production still runs them', async (t) => {
  const repo = await mkdtemp(resolve(tmpdir(), 'misebox-preflight-'))
  t.after(() => rm(repo, { recursive: true, force: true }))
  const root = resolve(repo, 'projects/misebox/misebox-app')
  await mkdir(resolve(root, 'release'), { recursive: true })
  await mkdir(resolve(root, 'test'))
  await cp(
    resolve(appRoot, 'release/release.mjs'),
    resolve(root, 'release/release.mjs')
  )
  const sourceRepo = resolve(appRoot, '../../..')
  const coreRules = 'packages/core/fireux-core/src/config/firebase/rules'
  await cp(resolve(sourceRepo, coreRules), resolve(repo, coreRules), {
    recursive: true,
  })
  const policyRoot = 'packages/ecosystem/fireux-misebox/src/config/firebase'
  await mkdir(resolve(repo, policyRoot), { recursive: true })
  await cp(
    resolve(sourceRepo, policyRoot, 'firestore.template.rules'),
    resolve(repo, policyRoot, 'firestore.template.rules')
  )
  await writeFile(
    resolve(repo, policyRoot, 'firestore.production.rules'),
    '// Production: misebox-78f9c / misebox\nrules_version = "2";\nservice cloud.firestore { match /databases/{database}/documents { match /{document=**} { allow read, write: if false; } } }'
  )
  await writeFile(
    resolve(root, 'test/firestore.production.test.mjs'),
    "console.error('production-suite-ran'); process.exitCode = 17\n"
  )
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
  await sealOutput(root)
  const release = await realpath(resolve(root, 'release/release.mjs'))
  // A real CLI invocation must not inherit the native test runner's child mode.
  const cliEnvironment = { ...process.env }
  delete cliEnvironment.NODE_TEST_CONTEXT
  const development = execFileSync(
    process.execPath,
    [release, 'preflight', '--rules-policy', 'development'],
    { encoding: 'utf8', stdio: 'pipe', env: cliEnvironment }
  )
  assert.match(development, /Rules policy: development/)
  assert.match(development, /local only/)
  assert.throws(
    () =>
      execFileSync(process.execPath, [release, 'preflight'], {
        encoding: 'utf8',
        stdio: 'pipe',
        env: cliEnvironment,
      }),
    (error) =>
      /production-suite-ran/.test(String(error.stdout) + String(error.stderr))
  )
  assert.throws(
    () =>
      execFileSync(
        process.execPath,
        [release, 'preflight', '--rules-policy', 'open'],
        { encoding: 'utf8', stdio: 'pipe', env: cliEnvironment }
      ),
    (error) => /Use --rules-policy/.test(String(error.stderr))
  )
})
