import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  composeFirestoreRules,
  parseFirestoreRulesTemplateHeader,
} from '../../../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs'

export const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const projectId = 'misebox-78f9c'
export const databaseId = 'misebox'
export const productionRules =
  '../../../packages/ecosystem/fireux-misebox/src/config/firebase/firestore.production.rules'
export const developmentRulesTemplate =
  '../../../packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules'
const json = async (path) => JSON.parse(await readFile(path, 'utf8'))
export const digest = (value) =>
  createHash('sha256').update(value).digest('hex')

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

export function prepareManifest(manifest) {
  const dependencies = { ...manifest.dependencies }
  for (const [name, version] of Object.entries(dependencies)) {
    if (
      typeof version !== 'string' ||
      /^(workspace:|link:|file:)/.test(version)
    )
      throw new Error(`Non-portable production dependency: ${name}`)
    // Sharp/esbuild select Linux binaries during the Cloud Build install.
    // Nitro may have traced the build machine's native package into dependencies.
    if (name.startsWith('@img/') || name.startsWith('@esbuild/'))
      delete dependencies[name]
  }
  for (const name of ['firebase-admin', 'firebase-functions']) {
    if (!dependencies[name])
      throw new Error(`Missing production dependency: ${name}`)
  }
  return {
    name: 'misebox-app-prod',
    private: true,
    type: 'module',
    main: 'index.mjs',
    engines: { node: '22' },
    dependencies,
  }
}

export function runtimeEnvironment(config) {
  if (
    config.projectId !== projectId ||
    !config.environment ||
    typeof config.environment !== 'object'
  )
    throw new Error('Runtime environment must target Misebox.')
  return (
    Object.entries(config.environment)
      .map(([name, value]) => {
        if (
          !/^[A-Z][A-Z0-9_]*$/.test(name) ||
          typeof value !== 'string' ||
          /[\r\n\0]/.test(value)
        )
          throw new Error(`Invalid runtime environment entry: ${name}`)
        return `${name}=${JSON.stringify(value)}`
      })
      .join('\n') + '\n'
  )
}

export async function prepare(root = appRoot) {
  validateConfig(await json(resolve(root, 'firebase.json')))
  const output = resolve(root, '.output/server')
  const entry = await readFile(resolve(output, 'index.mjs'), 'utf8')
  if (
    !/\bas miseboxApp\b|\bexport\s+(?:const|function)\s+miseboxApp\b/.test(
      entry
    )
  )
    throw new Error(
      'Build output does not export miseboxApp. Run build:release first.'
    )
  const manifest = prepareManifest(await json(resolve(output, 'package.json')))
  const environment = runtimeEnvironment(
    await json(resolve(root, 'server/firebase.runtime-env.json'))
  )
  await writeFile(
    resolve(output, 'package.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  )
  await writeFile(resolve(output, `.env.${projectId}`), environment, {
    mode: 0o600,
  })
  await writeFile(
    resolve(output, 'pnpm-workspace.yaml'),
    "packages:\n  - '.'\n"
  )
  await writeFile(
    resolve(output, 'fireux-release.json'),
    JSON.stringify(
      {
        projectId,
        entry: digest(entry),
        manifest: digest(JSON.stringify(manifest)),
        environment: digest(environment),
      },
      null,
      2
    ) + '\n'
  )
  return manifest
}

export async function checkOutput(root = appRoot) {
  validateConfig(await json(resolve(root, 'firebase.json')))
  const output = resolve(root, '.output/server')
  const marker = await json(resolve(output, 'fireux-release.json'))
  const lockfile = await readFile(resolve(output, 'pnpm-lock.yaml'), 'utf8')
  if (!marker.lockfile || marker.lockfile !== digest(lockfile))
    throw new Error('Production lockfile preparation is incomplete or stale.')
  const manifest = await json(resolve(output, 'package.json'))
  const entry = await readFile(resolve(output, 'index.mjs'), 'utf8')
  const environment = await readFile(
    resolve(output, `.env.${projectId}`),
    'utf8'
  )
  if (
    marker.projectId !== projectId ||
    marker.entry !== digest(entry) ||
    marker.manifest !== digest(JSON.stringify(manifest)) ||
    marker.environment !== digest(environment) ||
    environment !==
      runtimeEnvironment(
        await json(resolve(root, 'server/firebase.runtime-env.json'))
      )
  )
    throw new Error(
      'Prepared output changed or is stale. Run prepare:firebase-output again.'
    )
  if (JSON.stringify(prepareManifest(manifest)) !== JSON.stringify(manifest))
    throw new Error('Production manifest is not portable.')
  await access(resolve(root, '.output/public/_nuxt'))
}

export async function sealOutput(root = appRoot) {
  const output = resolve(root, '.output/server')
  const marker = await json(resolve(output, 'fireux-release.json'))
  marker.lockfile = digest(
    await readFile(resolve(output, 'pnpm-lock.yaml'), 'utf8')
  )
  await writeFile(
    resolve(output, 'fireux-release.json'),
    JSON.stringify(marker, null, 2) + '\n'
  )
}

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

export async function verifyLiveRules(
  source,
  read = cloudJson,
  policy = 'production'
) {
  requireRulesPolicy(policy)
  const release = await read(
    `projects/${projectId}/releases/cloud.firestore/${databaseId}`
  )
  if (!release.rulesetName?.startsWith(`projects/${projectId}/rulesets/`))
    throw new Error('Unexpected live Rules target.')
  const ruleset = await read(release.rulesetName)
  const files = ruleset.source?.files || []
  if (files.length !== 1 || digest(files[0].content) !== digest(source))
    throw new Error(
      `Live Misebox Rules do not match the reviewed ${policy} source. App deployment is blocked.`
    )
  return {
    policy,
    projectId,
    databaseId,
    release: release.name,
    ruleset: release.rulesetName,
    sha256: digest(source),
  }
}

function run(command, args, options = {}) {
  execFileSync(command, args, { cwd: appRoot, stdio: 'inherit', ...options })
}

function prepareLockfile() {
  run('pnpm', [
    '--dir',
    '.output/server',
    'install',
    '--lockfile-only',
    '--ignore-workspace',
    '--ignore-scripts',
    '--fetch-retries=0',
    '--fetch-timeout=15000',
  ])
}

export async function main(command, options = []) {
  const policy = parseRulesPolicyOptions(options)
  if (command === 'build') {
    run('pnpm', ['exec', 'nuxi', 'build'], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        APP_DOMAIN: 'https://misebox.app',
      },
    })
    await prepare()
    prepareLockfile()
    await sealOutput()
  } else if (command === 'prepare') {
    await prepare()
    prepareLockfile()
    await sealOutput()
  } else if (['preflight', 'deploy', 'hosting'].includes(command)) {
    await checkOutput()
    const source = await checkRules(appRoot, policy)
    if (policy === 'production') {
      const rulesTests = resolve(appRoot, 'test/firestore.production.test.mjs')
      await access(rulesTests).catch(() => {
        throw new Error(
          'Production allow/deny Rules tests are missing. Release is blocked.'
        )
      })
      run(process.execPath, ['--test', rulesTests])
    }
    if (command !== 'preflight') {
      // The selected policy must already be deployed on the exact named database.
      // This command never deploys Rules or repairs a source mismatch.
      const proof = await verifyLiveRules(source, cloudJson, policy)
      const evidence = resolve(appRoot, '.output/release')
      await mkdir(evidence, { recursive: true })
      await writeFile(
        resolve(evidence, 'live-rules.json'),
        JSON.stringify(proof, null, 2) + '\n'
      )
      run('firebase', [
        'deploy',
        '--project',
        projectId,
        '--config',
        'firebase.json',
        '--only',
        command === 'hosting'
          ? `hosting:${projectId}`
          : `functions:misebox-ssr,hosting:${projectId}`,
      ])
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
