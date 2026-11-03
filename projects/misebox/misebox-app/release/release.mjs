import * as shared from '../../../../tools/firebase-release/output.mjs'
import { execFileSync } from 'node:child_process'
import {
  readFile,
  writeFile,
  mkdir,
  access,
  mkdtemp,
  rm,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  composeFirestoreRules,
  parseFirestoreRulesTemplateHeader,
} from '../../../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs'

export const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const projectId = 'misebox-78f9c'
export const databaseId = 'misebox'
export const productionStorageRules =
  '../../../packages/ecosystem/fireux-misebox/src/config/firebase/storage.production.rules'
export const productionRules =
  '../../../packages/ecosystem/fireux-misebox/src/config/firebase/firestore.production.rules'
export const developmentRulesTemplate =
  '../../../packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules'
export const { runtimeInstallPolicy, digest } = shared
const json = async (path) => JSON.parse(await readFile(path, 'utf8'))

export function validateConfig(config) {
  const functions = config.functions
  if (
    !Array.isArray(functions) ||
    functions.length !== 1 ||
    functions[0].source !== '.output/server' ||
    functions[0].codebase !== 'misebox-ssr' ||
    functions[0].runtime !== 'nodejs22' ||
    functions[0].entryPoint !== 'miseboxApp'
  )
    throw new Error('Release must target only the Misebox Node 22 function.')
  if (
    config.hosting?.site !== projectId ||
    config.hosting?.public !== '.output/public'
  )
    throw new Error('Release must target only Misebox Hosting output.')
  if (config.firestore || config.storage || config.database)
    throw new Error(
      'App release must not deploy database or Storage policies implicitly.'
    )
}

// App target and Rules authority remain here; artifact mechanics are shared.
export function prepareManifest(
  manifest,
  runtimeDependencies = manifest.dependencies
) {
  return shared.prepareManifest(
    manifest,
    runtimeDependencies,
    'misebox-app-prod'
  )
}
export function runtimeEnvironment(config) {
  return shared.runtimeEnvironment(config, projectId)
}
export async function prepare(root = appRoot) {
  validateConfig(await json(resolve(root, 'firebase.json')))
  return shared.prepareOutput(root, { projectId })
}
export async function checkOutput(root = appRoot) {
  validateConfig(await json(resolve(root, 'firebase.json')))
  return shared.checkOutput(root, { projectId })
}
export const sealOutput = (root = appRoot) => shared.sealOutput(root)

export function parseRulesPolicyOptions(options = []) {
  if (options.length === 0) return 'production'
  if (
    options.length !== 2 ||
    options[0] !== '--rules-policy' ||
    !['production', 'development'].includes(options[1])
  )
    throw new Error(
      'Use --rules-policy production or --rules-policy development.'
    )
  return options[1]
}

function requireRulesPolicy(policy) {
  if (!['production', 'development'].includes(policy))
    throw new Error('Unknown Misebox Rules policy.')
  return policy
}

function validateDevelopmentTarget(manifest) {
  if (
    manifest.key !== 'misebox' ||
    manifest.projectId !== projectId ||
    manifest.databaseIds.length !== 1 ||
    manifest.databaseIds[0] !== databaseId ||
    manifest.fragments.join(',') !== 'open,development-open,close'
  )
    throw new Error(
      'Development Rules must target only misebox-78f9c / misebox and its reviewed open policy.'
    )
}

export function validateDevelopmentRules({ manifest, content }) {
  validateDevelopmentTarget(manifest)
  const policy = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\s/g, '')
  if (
    policy !==
    "rules_version='2';servicecloud.firestore{match/databases/{database}/documents{match/{document=**}{allowread,write:iftrue;}}}"
  )
    throw new Error(
      'Development Rules do not match the reviewed public read/write policy.'
    )
}

export async function checkRules(root = appRoot, policy = 'production') {
  requireRulesPolicy(policy)
  if (policy === 'development') {
    const template = await readFile(
      resolve(root, developmentRulesTemplate),
      'utf8'
    )
    validateDevelopmentTarget(parseFirestoreRulesTemplateHeader(template))
    const composed = await composeFirestoreRules(template)
    validateDevelopmentRules(composed)
    return composed.content
  }
  const path = resolve(root, productionRules)
  const source = await readFile(path, 'utf8').catch(() => {
    throw new Error(
      'Production Rules are not available. Development-open Rules cannot pass release preflight.'
    )
  })
  validateRulesSource(source)
  return source
}

export function validateRulesSource(source) {
  const policy = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
  if (
    !source.includes('// Production: misebox-78f9c / misebox') ||
    !/rules_version\s*=\s*['"]2['"]/.test(policy) ||
    !/service\s+cloud\.firestore\s*\{/.test(policy) ||
    /development-open/.test(source) ||
    /allow\s+[^:;]+:\s*if\s*(?:\(\s*)*true\b/.test(policy)
  )
    throw new Error(
      'Refusing an unbound or development-open production Rules source.'
    )
}

export async function cloudJson(
  path,
  { run = execFileSync, request = fetch } = {}
) {
  if (!path.startsWith(`projects/${projectId}/`))
    throw new Error('Unexpected live Rules target.')
  let token
  try {
    token = run('gcloud', ['auth', 'print-access-token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim()
  } catch {
    throw new Error(
      'Google Cloud credentials are unavailable; live Rules verification is required.'
    )
  }
  const response = await request(
    `https://firebaserules.googleapis.com/v1/${path}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        'x-goog-user-project': projectId,
      },
      signal: AbortSignal.timeout(30_000),
    }
  )
  if (!response.ok)
    throw new Error(`Live Rules verification failed (HTTP ${response.status}).`)
  return response.json()
}

async function verifyReleasedRules(source, releasePath, read, label) {
  const release = await read(releasePath)
  if (!release.rulesetName?.startsWith(`projects/${projectId}/rulesets/`))
    throw new Error('Unexpected live Rules target.')
  const ruleset = await read(release.rulesetName)
  const files = ruleset.source?.files || []
  if (files.length !== 1 || digest(files[0].content) !== digest(source))
    throw new Error(
      `Live Misebox Rules do not match the reviewed ${label} source. App deployment is blocked.`
    )
  return {
    release: release.name,
    ruleset: release.rulesetName,
    sha256: digest(source),
  }
}

export async function verifyLiveRules(
  source,
  read = cloudJson,
  policy = 'production'
) {
  requireRulesPolicy(policy)
  const proof = await verifyReleasedRules(
    source,
    `projects/${projectId}/releases/cloud.firestore/${databaseId}`,
    read,
    policy
  )
  return { policy, projectId, databaseId, ...proof }
}

export async function checkStorageRules(root = appRoot) {
  const source = await readFile(resolve(root, productionStorageRules), 'utf8')
  const normalized = source.replace(/\/\/[^\n]*/g, '').replace(/\s/g, '')
  if (
    !source.includes(
      '// Production: misebox-78f9c / misebox-78f9c.appspot.com'
    ) ||
    normalized !==
      "rules_version='2';servicefirebase.storage{match/b/{bucket}/o{match/{path=**}{allowread,write:iffalse;}}}"
  ) {
    throw new Error(
      'Production Storage Rules must match the reviewed server-owned policy.'
    )
  }
  return source
}

export async function verifyLiveStorageRules(source, read = cloudJson) {
  const bucketName = 'misebox-78f9c.appspot.com'
  const proof = await verifyReleasedRules(
    source,
    `projects/${projectId}/releases/firebase.storage/${bucketName}`,
    read,
    'production Storage'
  )
  return { projectId, bucketName, ...proof }
}

function run(command, args, options = {}) {
  execFileSync(command, args, { cwd: appRoot, stdio: 'inherit', ...options })
}

function prepareDependencies() {
  shared.installOutput(appRoot)
}

export async function upload(command, root = appRoot, execute = run) {
  if (!['deploy', 'hosting'].includes(command))
    throw new Error('Use deploy or hosting for upload.')
  // A neutral directory keeps the CLI bootstrap outside the App dependency tree.
  const cwd = await mkdtemp(resolve(tmpdir(), 'misebox-upload-'))
  try {
    execute(
      'npx',
      [
        '-y',
        'firebase-tools@latest',
        'deploy',
        '--project',
        projectId,
        '--config',
        resolve(root, 'firebase.json'),
        '--only',
        command === 'hosting'
          ? `hosting:${projectId}`
          : `functions:misebox-ssr,hosting:${projectId}`,
      ],
      { cwd }
    )
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
}

export async function main(command, options = []) {
  const policy = parseRulesPolicyOptions(options)
  if (command === 'build') {
    const config = await json(resolve(appRoot, 'firebase.json'))
    validateConfig(config)
    const target = shared.inspectTarget(config)
    run(process.execPath, [
      resolve(appRoot, '../../../packages/core/fireux-core/build/config.mjs'),
    ])
    run('pnpm', ['exec', 'nuxi', 'build'], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        NUXT_DEV: 'false',
        NITRO_FIREBASE_REGION: target.region,
        APP_DOMAIN: 'https://misebox.app',
      },
    })
    await prepare()
    prepareDependencies()
    await sealOutput()
    await checkOutput()
  } else if (command === 'prepare') {
    await prepare()
    prepareDependencies()
    await sealOutput()
    await checkOutput()
  } else if (['preflight', 'deploy', 'hosting'].includes(command)) {
    await checkOutput()
    const source = await checkRules(appRoot, policy)
    const storageSource =
      policy === 'production' ? await checkStorageRules() : null
    if (policy === 'production') {
      const rulesTests = resolve(appRoot, 'test/firestore.production.test.mjs')
      await access(rulesTests).catch(() => {
        throw new Error(
          'Production allow/deny Rules tests are missing. Release is blocked.'
        )
      })
      run(process.execPath, [
        '--test',
        rulesTests,
        resolve(appRoot, 'test/storage.production.test.mjs'),
      ])
    }
    if (command !== 'preflight') {
      // The selected policy must already be deployed on the exact named database.
      // This command never deploys Rules or repairs a source mismatch.
      const proof = await verifyLiveRules(source, cloudJson, policy)
      if (storageSource)
        proof.storage = await verifyLiveStorageRules(storageSource)
      const evidence = resolve(appRoot, '.output/release')
      await mkdir(evidence, { recursive: true })
      await writeFile(
        resolve(evidence, 'live-rules.json'),
        JSON.stringify(proof, null, 2) + '\n'
      )
      await upload(command)
    }
  } else if (command === 'env') {
    runtimeEnvironment(
      await json(resolve(appRoot, 'server/firebase.runtime-env.json'))
    )
  } else
    throw new Error('Use build, prepare, preflight, deploy, hosting or env.')
  console.log(
    `Misebox ${command}: passed${['preflight', 'deploy', 'hosting'].includes(command) ? ` (Rules policy: ${policy})` : ''}${command === 'preflight' ? ' (local only; live Rules are checked before deployment)' : ''}.`
  )
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv[2], process.argv.slice(3)).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
