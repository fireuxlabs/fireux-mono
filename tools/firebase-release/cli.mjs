import { execFileSync } from 'node:child_process'
import { readFile, mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises'
import { resolve, relative } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import {
  inspectTarget,
  prepareOutput,
  checkOutput,
  installOutput,
  sealOutput,
  runtimeEnvironment,
  digest,
} from './output.mjs'
import {
  composeFirestoreRules,
  parseFirestoreRulesTemplateHeader,
} from '../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs'

const json = async (path) => JSON.parse(await readFile(path, 'utf8'))
export function parseArguments(args) {
  const [command, ...rest] = args
  if (
    !['build', 'prepare', 'preflight', 'env', 'deploy', 'hosting'].includes(
      command
    )
  )
    throw Error('Use build, prepare, preflight, env, deploy or hosting.')
  const flags = {}
  for (let i = 0; i < rest.length; i += 2) {
    const key = rest[i]?.replace(/^--/, '')
    if (
      ![
        'project',
        'config',
        'rules-template',
        'rules-databases',
        'rules-policy',
        'app-domain',
      ].includes(key) ||
      !rest[i + 1] ||
      flags[key]
    )
      throw Error('Unknown, duplicate or incomplete release option.')
    flags[key] = rest[i + 1]
  }
  if (!/^[a-z][a-z0-9-]+$/.test(flags.project || ''))
    throw Error('An explicit App-owned --project is required.')
  if (
    flags['rules-policy'] &&
    !['development', 'production'].includes(flags['rules-policy'])
  )
    throw Error('Use --rules-policy development or production.')
  return { command, flags }
}
export function buildEnvironment(origin, environment = process.env, region) {
  let domain
  try {
    domain = new URL(origin || '')
  } catch {
    throw Error('Build requires an explicit public HTTPS --app-domain origin.')
  }
  if (
    domain.protocol !== 'https:' ||
    domain.username ||
    domain.password ||
    domain.pathname !== '/' ||
    domain.search ||
    domain.hash ||
    domain.hostname.endsWith('localhost')
  )
    throw Error('Build requires an explicit public HTTPS --app-domain origin.')
  return {
    ...environment,
    NODE_ENV: 'production',
    NUXT_DEV: 'false',
    APP_DOMAIN: domain.origin,
    ...(region ? { NITRO_FIREBASE_REGION: region } : {}),
  }
}
export async function readDevelopmentPolicy(root, flags) {
  if ((flags['rules-policy'] || 'production') !== 'development')
    throw Error(
      'Production needs an App-owned release entrypoint with its reviewed Rules and tests. Development is never an implicit fallback.'
    )
  if (!flags['rules-template'])
    throw Error(
      'An App-owned --rules-template is required for development release.'
    )
  const template = await readFile(
    resolve(root, flags['rules-template']),
    'utf8'
  )
  const target = parseFirestoreRulesTemplateHeader(template)
  if (
    target.projectId !== flags.project ||
    !target.databaseIds.length ||
    target.fragments.join(',') !== 'open,development-open,close'
  )
    throw Error(
      'Rules template does not match this explicit project and accepted development policy.'
    )
  const composed = await composeFirestoreRules(template)
  const normalized = composed.content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\s/g, '')
  if (
    normalized !==
    "rules_version='2';servicecloud.firestore{match/databases/{database}/documents{match/{document=**}{allowread,write:iftrue;}}}"
  )
    throw Error('Rules differ from the reviewed development policy.')
  const databases = flags['rules-databases']?.split(',') || [
    ...target.databaseIds,
  ]
  if (
    !databases.length ||
    new Set(databases).size !== databases.length ||
    databases.some((id) => !/^[a-z0-9][a-z0-9-]*$/.test(id)) ||
    target.databaseIds.some((id) => !databases.includes(id))
  )
    throw Error(
      'App Rules database scope must include its Ecosystem template targets with unique explicit database IDs.'
    )
  return { source: composed.content, databases }
}
export async function verifyLivePolicy(
  projectId,
  policy,
  request = fetch,
  token
) {
  const read = async (path) => {
    const response = await request(
      `https://firebaserules.googleapis.com/v1/projects/${projectId}/${path}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          'x-goog-user-project': projectId,
        },
        signal: AbortSignal.timeout(30000),
      }
    )
    if (!response.ok)
      throw Error(`Live Rules verification failed (${response.status}).`)
    return response.json()
  }
  const proof = []
  for (const database of policy.databases) {
    const release = await read(
      `releases/cloud.firestore/${encodeURIComponent(database)}`
    )
    if (!release.rulesetName?.startsWith(`projects/${projectId}/rulesets/`))
      throw Error('Unexpected Rules project.')
    const rules = await read(
      release.rulesetName.slice(`projects/${projectId}/`.length)
    )
    if (
      rules.source?.files?.length !== 1 ||
      digest(rules.source.files[0].content) !== digest(policy.source)
    )
      throw Error(`Live Rules mismatch for ${database}; no upload performed.`)
    proof.push({
      database,
      release: release.name,
      ruleset: release.rulesetName,
      sha256: digest(policy.source),
    })
  }
  return proof
}
export async function upload(
  root,
  project,
  target,
  hostingOnly,
  run = execFileSync
) {
  const cwd = await mkdtemp(resolve(tmpdir(), 'fireux-upload-'))
  try {
    run(
      'npx',
      [
        '-y',
        'firebase-tools@latest',
        'deploy',
        '--project',
        project,
        '--config',
        resolve(root, 'firebase.json'),
        '--only',
        hostingOnly
          ? `hosting:${target.projectSite}`
          : `functions:${target.codebase},hosting:${target.projectSite}`,
      ],
      { cwd, stdio: 'inherit' }
    )
  } finally {
    await rm(cwd, { recursive: true, force: true })
  }
}
export async function main(args, root = process.cwd()) {
  const { command, flags } = parseArguments(args)
  const configFile = flags.config || 'firebase.json'
  if (relative(root, resolve(root, configFile)).startsWith('..'))
    throw Error('Firebase configuration must belong to this App.')
  const target = inspectTarget(await json(resolve(root, configFile)))
  const options = { projectId: flags.project, configFile }
  if (command === 'env') {
    runtimeEnvironment(
      await json(resolve(root, 'server/firebase.runtime-env.json')),
      flags.project
    )
  } else if (command === 'build' || command === 'prepare') {
    if (command === 'build') {
      const environment = buildEnvironment(
        flags['app-domain'],
        process.env,
        target.region
      )
      runtimeEnvironment(
        await json(resolve(root, 'server/firebase.runtime-env.json')),
        flags.project
      )
      execFileSync(
        process.execPath,
        [
          fileURLToPath(
            new URL(
              '../../packages/core/fireux-core/build/config.mjs',
              import.meta.url
            )
          ),
        ],
        { stdio: 'inherit' }
      )
      execFileSync('pnpm', ['exec', 'nuxi', 'build'], {
        cwd: root,
        stdio: 'inherit',
        env: environment,
      })
    }
    await prepareOutput(root, options)
    installOutput(root)
    await sealOutput(root)
    await checkOutput(root, options)
  } else {
    await checkOutput(root, options)
    const policy = await readDevelopmentPolicy(root, flags)
    if (command !== 'preflight') {
      const token = execFileSync('gcloud', ['auth', 'print-access-token'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim()
      const proof = await verifyLivePolicy(flags.project, policy, fetch, token)
      await mkdir(resolve(root, '.output/release'), { recursive: true })
      await writeFile(
        resolve(root, '.output/release/live-rules.json'),
        JSON.stringify(
          { projectId: flags.project, policy: 'development', proof },
          null,
          2
        ) + '\n'
      )
      if (configFile !== 'firebase.json')
        throw Error('Upload requires the App-owned firebase.json filename.')
      await upload(root, flags.project, target, command === 'hosting')
    }
  }
  console.log(
    `Firebase ${command}: passed for ${flags.project}${command === 'preflight' ? ' (local only; upload verifies live Rules)' : ''}.`
  )
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
