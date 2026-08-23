#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: plan or explicitly apply non-destructive canonical User, Ecosystem, Project, local metadata projection, AppUser, and App onboarding repairs across registered ecosystems.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { APP_REGISTRY } from './_lib/app-registry.mjs'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillCreate } from './_lib/firestore-mutations/mcp-skill-create.mjs'
import { mcpSkillDelete } from './_lib/firestore-mutations/mcp-skill-delete.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const ALLOWED_ARGS = new Set([
  'all',
  'apply',
  'backup',
  'confirm',
  'ecosystem',
  'family',
  'help',
  'report',
  'service-account',
  'summary',
])
const LEGACY_APP_FIELDS = [
  'app_name',
  'app_short_name',
  'avatar_url',
  'cover_url',
  'logo_url',
  'thumbnail_url',
  'wordmark_dark_url',
  'wordmark_light_url',
  'wordmark_url',
]
const LEGACY_MEMBERSHIP_FIELDS = [
  'console_enabled',
  'console_targets',
  'notifications',
  'profiles',
  'workspace_enabled',
  'workspace_targets',
]
const ECOSYSTEM_META_FIELDS = [
  'project_id',
  'status',
  'name',
  'description',
  'image_url',
  'website_url',
  'database_id',
  'updated',
]
const PROJECT_META_FIELDS = [
  'status',
  'name',
  'description',
  'image_url',
  'database_id',
  'updated',
]

const args = parseArgs(process.argv.slice(2))
for (const key of Object.keys(args)) {
  if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option: --${key}`)
}

if (args.help) {
  console.log(`
Audit and align safe User/Ecosystem/Project/App onboarding invariants.

Dry run:
  pnpm align:onboarding -- --all --report /private/tmp/onboarding-plan.json
  pnpm align:onboarding -- --all --family ecosystem --summary
  pnpm align:onboarding -- --all --family project --summary
  pnpm align:onboarding -- --ecosystem misebox --summary

Explicit apply:
  pnpm align:onboarding -- --all --apply --confirm <planSha256> \\
    --backup /private/tmp/onboarding-preimage.json

Safe repairs only: missing User presentation defaults, canonical EcosystemMeta,
ProjectMeta projections, AppUser lifecycle defaults, and redundant legacy
fields. The command never creates legal acceptance, Users, canonical
Ecosystems, App memberships, canonical Apps, admin roles, Auth identities, or
Storage objects.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const apply = args.apply === true
const family = text(args.family) || 'all'
if (!['all', 'user', 'ecosystem', 'project', 'app'].includes(family)) {
  throw new Error('--family must be all, user, ecosystem, project, or app.')
}
const requestedEcosystem = text(args.ecosystem)
if (args.all !== true && !requestedEcosystem) {
  throw new Error('Choose --all or --ecosystem <key>.')
}
if (args.all === true && requestedEcosystem) {
  throw new Error('--all and --ecosystem are mutually exclusive.')
}
const reportPath = optionalTmpPath('report', args.report)
const backupPath = apply ? requiredTmpPath('backup', args.backup) : ''

const configs = discoverEcosystemConfigs()
const selected = configs.filter(
  (config) => !requestedEcosystem || config.ecosystemKey === requestedEcosystem
)
if (!selected.length)
  throw new Error('No matching registered ecosystem target.')

const sessions = []
try {
  for (const config of selected) sessions.push(await openSession(config))
  const plan = await buildPlan(sessions)
  if (reportPath) {
    plan.reportArtifact = await writeProtectedJsonArtifact({
      path: reportPath,
      payload: plan,
    })
  }

  if (!apply) {
    console.log(JSON.stringify(args.summary ? summarize(plan) : plan, null, 2))
    process.exit(0)
  }
  if (text(args.confirm) !== plan.planSha256) {
    throw new Error(`Apply requires --confirm ${plan.planSha256}.`)
  }
  if (plan.blockers.length) {
    throw new Error(
      `Apply blocked by ${plan.blockers.length} unsafe finding(s).`
    )
  }

  await assertPreconditions(sessions, plan.operations)
  const backup = await capturePreimage(sessions, plan)
  const backupArtifact = await writeProtectedJsonArtifact({
    path: backupPath,
    payload: backup,
  })
  await applyOperations(sessions, plan.operations)
  const verification = await verifyOperations(sessions, plan.operations)
  if (verification.length) {
    throw new Error(
      `Post-write verification failed for ${verification.length} operation(s). Backup: ${backupArtifact.path}`
    )
  }
  console.log(
    JSON.stringify(
      {
        mode: 'apply',
        planSha256: plan.planSha256,
        operations: plan.operations.length,
        backupArtifact,
        postWriteVerified: true,
        unresolved: plan.issues.length,
      },
      null,
      2
    )
  )
} finally {
  await Promise.all(sessions.map((session) => deleteApp(session.app)))
}

function text(value) {
  return String(value ?? '').trim()
}

function optionalTmpPath(key, value) {
  if (value === undefined || value === '') return ''
  return requiredTmpPath(key, value)
}

function requiredTmpPath(key, value) {
  const resolved = path.resolve(text(value))
  if (!value || !resolved.startsWith('/private/tmp/')) {
    throw new Error(`--${key} must be a new path under /private/tmp/.`)
  }
  return resolved
}

function readLiteral(source, key) {
  return (
    source.match(new RegExp(`\\b${key}\\s*:\\s*'([^']*)'`))?.[1] ||
    source.match(new RegExp(`\\b${key}\\s*:\\s*"([^"]*)"`))?.[1] ||
    ''
  ).trim()
}

function discoverEcosystemConfigs() {
  const byKey = new Map()
  for (const entry of Object.values(APP_REGISTRY)) {
    const ecosystemKey = text(entry.ecosystem)
    if (!ecosystemKey || byKey.has(ecosystemKey)) continue
    const sourceFile = path.join(
      process.cwd(),
      'packages',
      'ecosystem',
      `fireux-${ecosystemKey}`,
      'src',
      'config',
      'firebase',
      'ecosystem.config.ts'
    )
    const source = readFileSync(sourceFile, 'utf8')
    const projectId = readLiteral(source, 'projectId')
    const databaseId = readLiteral(source, 'databaseId')
    const storageBucket = readLiteral(source, 'storageBucket')
    const sourceName = readLiteral(source, 'name')
    const sourceDescription = readLiteral(source, 'description')
    if (!projectId || !databaseId) {
      throw new Error(`Incomplete ecosystem Firebase target: ${sourceFile}`)
    }
    byKey.set(ecosystemKey, {
      ecosystemKey,
      projectId,
      identityDatabaseId: databaseId,
      storageBucket,
      sourceName,
      sourceDescription,
      apps: Object.values(APP_REGISTRY)
        .filter((app) => app.ecosystem === ecosystemKey)
        .map((app) => ({ ...app })),
    })
  }
  return [...byKey.values()].sort((a, b) =>
    a.ecosystemKey.localeCompare(b.ecosystemKey)
  )
}

async function openSession(config) {
  const resolved = await resolveFirebaseAdminCredential({
    args,
    scope: config.ecosystemKey,
    projectId: config.projectId,
  })
  const app = initializeApp(
    {
      credential: resolved.credential,
      projectId: config.projectId,
      ...(config.storageBucket ? { storageBucket: config.storageBucket } : {}),
    },
    `onboarding-align-${config.ecosystemKey}-${Date.now()}`
  )
  return { ...config, app }
}

function stableValue(value) {
  if (value == null || typeof value !== 'object') return value
  if (typeof value.toDate === 'function') {
    return { __timestamp: value.toDate().toISOString() }
  }
  if (Array.isArray(value)) return value.map(stableValue)
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, stableValue(entry)])
  )
}

function stableJson(value) {
  return JSON.stringify(stableValue(value))
}

function sha256(value) {
  return createHash('sha256').update(stableJson(value)).digest('hex')
}

function canonicalAvatarOwned(avatar, uid) {
  const value = text(avatar)
  if (!value.startsWith('https://')) return false
  try {
    return decodeURIComponent(value).includes(`users/${uid}/avatar/current`)
  } catch {
    return false
  }
}

function appSiteUrl(entry) {
  const source = readFileSync(
    path.resolve(entry.workspace, 'nuxt.config.ts'),
    'utf8'
  )
  const configured = readLiteral(source, 'siteUrl')
  if (configured) return configured
  const env = readFileSync(path.resolve(entry.workspace, '.env'), 'utf8')
  const domain = text(env.match(/^APP_DOMAIN\s*=\s*(.+)$/m)?.[1]).replace(
    /^['"]|['"]$/g,
    ''
  )
  if (!domain) return ''
  return /^[a-z][a-z\d+.-]*:\/\//i.test(domain) ? domain : `https://${domain}`
}

function publicHttpsUrl(value) {
  const candidate = text(value)
  if (!candidate.startsWith('https://')) return ''
  try {
    const url = new URL(candidate)
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
      ? ''
      : url.toString().replace(/\/$/, '')
  } catch {
    return ''
  }
}

function appPublicSiteUrl(entry) {
  const authored = publicHttpsUrl(appSiteUrl(entry))
  if (authored) return authored

  const firebaseConfig = JSON.parse(
    readFileSync(path.resolve(entry.workspace, 'firebase.json'), 'utf8')
  )
  const hosting = Array.isArray(firebaseConfig.hosting)
    ? firebaseConfig.hosting[0]
    : firebaseConfig.hosting
  const site = text(hosting?.site)
  return site ? `https://${site}.web.app` : ''
}

function appSource(entry) {
  const source = readFileSync(
    path.resolve(entry.workspace, 'nuxt.config.ts'),
    'utf8'
  )
  const selfJoin = source.match(/\bselfJoinEnabled\s*:\s*(true|false)/)?.[1]
  return {
    project_id: readLiteral(source, 'projectId'),
    ecosystem_id: readLiteral(source, 'ecosystemId'),
    role: readLiteral(source, 'role'),
    name: readLiteral(source, 'name'),
    short_name: readLiteral(source, 'shortName'),
    self_join_enabled: selfJoin === 'true',
  }
}

function operation(session, databaseId, collectionPath, snapshot, input) {
  return {
    ecosystem: session.ecosystemKey,
    projectId: session.projectId,
    databaseId,
    collectionPath,
    id: snapshot.id,
    verb: input.verb,
    set: stableValue(input.set || {}),
    deleteFields: [...new Set(input.deleteFields || [])].sort(),
    preconditionSha256: sha256(snapshot.exists ? snapshot.data() : null),
  }
}

function issue(session, code, path, detail = '') {
  return {
    ecosystem: session.ecosystemKey,
    projectId: session.projectId,
    code,
    path,
    ...(detail ? { detail } : {}),
  }
}

async function buildPlan(sessions) {
  const operations = []
  const issues = []
  const blockers = []

  for (const session of sessions) {
    if (family === 'all' || family === 'user') {
      await planUsers(session, operations, issues, blockers)
    }
    if (family === 'all' || family === 'ecosystem') {
      await planEcosystem(session, operations, issues, blockers)
    }
    if (family === 'all' || family === 'app') {
      await planApps(session, operations, issues, blockers)
    }
  }
  if (family === 'all' || family === 'project') {
    await planProjects(sessions, operations, issues, blockers)
  }
  operations.sort((a, b) =>
    `${a.projectId}/${a.databaseId}/${a.collectionPath}/${a.id}`.localeCompare(
      `${b.projectId}/${b.databaseId}/${b.collectionPath}/${b.id}`
    )
  )
  const operationKeys = operations.map(
    (entry) =>
      `${entry.projectId}/${entry.databaseId}/${entry.collectionPath}/${entry.id}`
  )
  if (new Set(operationKeys).size !== operationKeys.length) {
    const duplicates = operationKeys.filter(
      (key, index) => operationKeys.indexOf(key) !== index
    )
    throw new Error(
      `Planner produced duplicate mutation targets: ${[
        ...new Set(duplicates),
      ].join(', ')}`
    )
  }
  const planSha256 = sha256(operations)
  return {
    format: 'fireux-user-ecosystem-project-app-onboarding-alignment/1',
    mode: 'dry-run',
    family,
    generatedAt: new Date().toISOString(),
    targets: sessions.map((session) => ({
      ecosystem: session.ecosystemKey,
      projectId: session.projectId,
      identityDatabaseId: session.identityDatabaseId,
    })),
    planSha256,
    operations,
    issues,
    blockers,
  }
}

async function planEcosystem(session, operations, issues, blockers) {
  const canonicalDb = getFirestore(session.app, session.identityDatabaseId)
  const defaultDb = getFirestore(session.app)
  const globalApp = session.apps.find((entry) => entry.role === 'global')
  if (!globalApp) {
    blockers.push(
      issue(session, 'ECOSYSTEM_GLOBAL_APP_SOURCE_MISSING', 'ecosystems')
    )
    return
  }
  const authoredApp = appSource(globalApp)
  const ecosystemId = text(authoredApp.ecosystem_id) || session.ecosystemKey
  const ecosystemProjectId = ecosystemId
  const globalAppDb = getFirestore(session.app, text(globalApp.databaseId))
  const globalCanonicalApp = await globalAppDb
    .collection('apps')
    .doc(globalApp.appId)
    .get()
  const canonical = await canonicalDb
    .collection('ecosystems')
    .doc(ecosystemId)
    .get()
  const meta = await defaultDb.collection('ecosystem').doc(ecosystemId).get()
  const legacy = await defaultDb.collection('ecosystems').doc(ecosystemId).get()

  if (legacy.exists) {
    issues.push(
      issue(
        session,
        'LEGACY_ECOSYSTEM_DIRECTORY_PRESENT',
        legacy.ref.path,
        'FireUX aggregation and local EcosystemMeta have different ownership; review before deletion.'
      )
    )
  }
  if (!canonical.exists) {
    issues.push(
      issue(session, 'ECOSYSTEM_INITIALIZATION_REQUIRED', canonical.ref.path)
    )
    if (!meta.exists) {
      issues.push(
        issue(
          session,
          'ECOSYSTEM_META_BLOCKED_BY_MISSING_ECOSYSTEM',
          meta.ref.path
        )
      )
    }
    return
  }

  const data = canonical.data() || {}
  const set = {}
  const deleteFields = []
  const appData = globalCanonicalApp.data() || {}
  const appMedia = appData.media || {}
  const presentationSource = {
    name:
      text(appData.name) ||
      text(globalApp.name) ||
      text(session.sourceName),
    description:
      (ecosystemId !== session.ecosystemKey
        ? text(session.sourceDescription)
        : '') ||
      text(appData.description) ||
      text(session.sourceDescription),
    image_url: text(appMedia.logo_url),
    website_url: appPublicSiteUrl(globalApp),
  }
  if (!text(data.project_id)) set.project_id = ecosystemProjectId
  else if (text(data.project_id) !== ecosystemProjectId) {
    blockers.push(
      issue(
        session,
        'ECOSYSTEM_PROJECT_AUTHORITY_REQUIRES_REVIEW',
        canonical.ref.path,
        `stored=${text(data.project_id)} source=${ecosystemProjectId}`
      )
    )
  }
  if ('id' in data) {
    if (text(data.id) && text(data.id) !== canonical.id) {
      blockers.push(issue(session, 'ECOSYSTEM_ID_CONFLICT', canonical.ref.path))
    } else deleteFields.push('id')
  }
  if ('slug' in data) deleteFields.push('slug')
  if (!text(data.website_url) && text(data.source_url)) {
    set.website_url = text(data.source_url)
  }
  if ('source_url' in data) deleteFields.push('source_url')
  const logicalRename = ecosystemId !== session.ecosystemKey
  for (const field of [
    'status',
    'name',
    'description',
    'image_url',
    'website_url',
  ]) {
    const value = field in set ? set[field] : data[field]
    const sourceValue = presentationSource[field]
    if (
      field !== 'status' &&
      sourceValue &&
      (!text(value) || (logicalRename && text(value) !== sourceValue))
    ) {
      set[field] = sourceValue
      continue
    }
    if (!text(value)) {
      issues.push(
        issue(
          session,
          'ECOSYSTEM_PRESENTATION_INCOMPLETE',
          canonical.ref.path,
          field
        )
      )
    }
  }
  if (Object.keys(set).length || deleteFields.length) {
    operations.push(
      operation(session, session.identityDatabaseId, 'ecosystems', canonical, {
        verb: 'update',
        set,
        deleteFields,
      })
    )
  }

  const nextData = { ...data, ...set }
  for (const field of deleteFields) delete nextData[field]
  const canonicalMeta = {
    project_id: text(nextData.project_id),
    status: text(nextData.status),
    name: text(nextData.name),
    description: text(nextData.description),
    image_url: text(nextData.image_url),
    website_url: text(nextData.website_url),
    database_id: session.identityDatabaseId,
    updated: stableValue(nextData.updated || {}),
  }
  if (!meta.exists) {
    operations.push(
      operation(session, '(default)', 'ecosystem', meta, {
        verb: 'create',
        set: canonicalMeta,
      })
    )
    return
  }
  const metaData = meta.data() || {}
  const metaSet = Object.fromEntries(
    Object.entries(canonicalMeta).filter(
      ([field, value]) => stableJson(metaData[field]) !== stableJson(value)
    )
  )
  const metaDelete = Object.keys(metaData).filter(
    (field) => field === 'id' || !ECOSYSTEM_META_FIELDS.includes(field)
  )
  if (Object.keys(metaSet).length || metaDelete.length) {
    operations.push(
      operation(session, '(default)', 'ecosystem', meta, {
        verb: 'update',
        set: metaSet,
        deleteFields: metaDelete,
      })
    )
  }
}

async function planProjects(sessions, operations, issues, blockers) {
  const controlSession = sessions.find(
    (session) => session.ecosystemKey === 'fireux'
  )
  if (!controlSession) {
    blockers.push({
      ecosystem: 'fireux',
      projectId: '',
      code: 'PROJECT_CONTROL_SESSION_MISSING',
      path: 'projects',
    })
    return
  }
  const controlDb = getFirestore(
    controlSession.app,
    controlSession.identityDatabaseId
  )

  for (const session of sessions) {
    const globalApp = session.apps.find((entry) => entry.role === 'global')
    if (!globalApp) {
      blockers.push(
        issue(session, 'PROJECT_GLOBAL_APP_SOURCE_MISSING', 'projects')
      )
      continue
    }
    const authoredApp = appSource(globalApp)
    const projectId = session.ecosystemKey
    const ecosystemId = text(authoredApp.ecosystem_id) || session.ecosystemKey
    const ecosystem = await getFirestore(
      session.app,
      session.identityDatabaseId
    )
      .collection('ecosystems')
      .doc(ecosystemId)
      .get()
    const canonical = await controlDb
      .collection('projects')
      .doc(projectId)
      .get()
    const meta = await getFirestore(session.app)
      .collection('project')
      .doc(projectId)
      .get()

    if (!ecosystem.exists) {
      blockers.push(
        issue(
          session,
          'PROJECT_ECOSYSTEM_AUTHORITY_MISSING',
          ecosystem.ref.path
        )
      )
      continue
    }
    if (!canonical.exists) {
      blockers.push(
        issue(
          session,
          'PROJECT_INITIALIZATION_REQUIRED',
          canonical.ref.path,
          'Canonical Project creation is an explicit control-plane operation.'
        )
      )
      continue
    }

    const ecosystemData = ecosystem.data() || {}
    const canonicalData = canonical.data() || {}
    const expected = {
      status:
        text(ecosystemData.status) === 'active' ||
        text(ecosystemData.status) === 'archived'
          ? text(ecosystemData.status)
          : 'inactive',
      name: text(ecosystemData.name),
      description: text(ecosystemData.description),
      image_url: publicHttpsUrl(ecosystemData.image_url),
    }
    const set = {}
    for (const [field, value] of Object.entries(expected)) {
      const requiredIdentity = field === 'status'
      if (
        (requiredIdentity || text(value)) &&
        stableJson(canonicalData[field]) !== stableJson(value)
      ) {
        set[field] = value
      }
      if (field !== 'id' && !text(value)) {
        issues.push(
          issue(
            session,
            'PROJECT_PRESENTATION_INCOMPLETE',
            canonical.ref.path,
            field === 'image_url' && text(ecosystemData.image_url)
              ? `image_url source is not a deployable HTTPS URL: ${text(ecosystemData.image_url)}`
              : field
          )
        )
      }
    }
    const deleteFields = []
    if ('id' in canonicalData) {
      if (text(canonicalData.id) && text(canonicalData.id) !== projectId) {
        blockers.push(
          issue(
            session,
            'PROJECT_ID_CONFLICT',
            canonical.ref.path,
            `stored=${text(canonicalData.id)} path=${projectId}`
          )
        )
        continue
      }
      deleteFields.push('id')
    }
    if (Object.keys(set).length || deleteFields.length) {
      operations.push(
        operation(
          controlSession,
          controlSession.identityDatabaseId,
          'projects',
          canonical,
          { verb: 'update', set, deleteFields }
        )
      )
    }

    const nextCanonical = { ...canonicalData, ...set }
    delete nextCanonical.id
    const canonicalMeta = {
      status: text(nextCanonical.status),
      name: text(nextCanonical.name),
      description: text(nextCanonical.description),
      image_url: text(nextCanonical.image_url),
      database_id: session.identityDatabaseId,
      updated: stableValue(nextCanonical.updated || {}),
    }
    if (!meta.exists) {
      operations.push(
        operation(session, '(default)', 'project', meta, {
          verb: 'create',
          set: canonicalMeta,
        })
      )
      continue
    }
    const metaData = meta.data() || {}
    const metaSet = Object.fromEntries(
      Object.entries(canonicalMeta).filter(
        ([field, value]) => stableJson(metaData[field]) !== stableJson(value)
      )
    )
    const metaDelete = Object.keys(metaData).filter(
      (field) => !PROJECT_META_FIELDS.includes(field)
    )
    if (Object.keys(metaSet).length || metaDelete.length) {
      operations.push(
        operation(session, '(default)', 'project', meta, {
          verb: 'update',
          set: metaSet,
          deleteFields: metaDelete,
        })
      )
    }
  }
}

async function listAuthUsers(app) {
  const users = []
  let pageToken
  do {
    const page = await getAuth(app).listUsers(1000, pageToken)
    users.push(...page.users)
    pageToken = page.pageToken
  } while (pageToken)
  return users
}

async function planUsers(session, operations, issues, blockers) {
  const db = getFirestore(session.app, session.identityDatabaseId)
  const [usersSnapshot, authUsers] = await Promise.all([
    db.collection('users').get(),
    listAuthUsers(session.app),
  ])
  const authIds = new Set(authUsers.map((user) => user.uid))
  const userIds = new Set(usersSnapshot.docs.map((user) => user.id))

  for (const authUser of authUsers) {
    if (!userIds.has(authUser.uid)) {
      issues.push(
        issue(
          session,
          'AUTH_USER_ONBOARDING_INCOMPLETE',
          `users/${authUser.uid}`
        )
      )
    }
  }

  for (const user of usersSnapshot.docs) {
    const data = user.data()
    const set = {}
    const deleteFields = []
    if (typeof data.bio !== 'string') set.bio = ''
    if (typeof data.display_name !== 'string' || !data.display_name.trim()) {
      const legacy = text(data.displayName)
      if (legacy) set.display_name = legacy
      else
        blockers.push(
          issue(session, 'USER_DISPLAY_NAME_REQUIRES_REVIEW', user.ref.path)
        )
    }
    if ('displayName' in data) deleteFields.push('displayName')
    if ('id' in data) {
      if (text(data.id) && text(data.id) !== user.id) {
        blockers.push(issue(session, 'USER_ID_CONFLICT', user.ref.path))
      } else deleteFields.push('id')
    }
    if (!canonicalAvatarOwned(data.avatar, user.id)) {
      issues.push(issue(session, 'USER_AVATAR_REHOME_REQUIRED', user.ref.path))
    }
    const account = await user.ref.collection('private').doc('account').get()
    if (!account.exists) {
      issues.push(issue(session, 'USER_ACCOUNT_MISSING', account.ref.path))
    } else {
      const terms = account.get('terms') || {}
      if (!text(terms.version) || terms.accepted_at == null) {
        issues.push(
          issue(session, 'USER_TERMS_ACTION_REQUIRED', account.ref.path)
        )
      }
    }
    if (!authIds.has(user.id)) {
      issues.push(issue(session, 'USER_AUTH_IDENTITY_MISSING', user.ref.path))
    }
    if (Object.keys(set).length || deleteFields.length) {
      operations.push(
        operation(session, session.identityDatabaseId, 'users', user, {
          verb: 'update',
          set,
          deleteFields,
        })
      )
    }
  }
}

async function planApps(session, operations, issues, blockers) {
  const defaultDb = getFirestore(session.app)
  for (const entry of session.apps) {
    const databaseId = text(entry.databaseId)
    const db = getFirestore(session.app, databaseId)
    const app = await db.collection('apps').doc(entry.appId).get()
    const [legacyMeta, retiredMeta] = await Promise.all([
      defaultDb.collection('apps').doc(entry.appId).get(),
      defaultDb.collection('app-directory').doc(entry.appId).get(),
    ])
    if (!app.exists) {
      issues.push(issue(session, 'APP_INITIALIZATION_REQUIRED', app.ref.path))
      continue
    }

    const data = app.data() || {}
    const authored = appSource(entry)
    const appSet = {}
    const deleteFields = []
    for (const field of ['project_id', 'role']) {
      if (text(data[field]) !== authored[field]) {
        blockers.push(
          issue(session, 'APP_AUTHORITY_REQUIRES_REVIEW', app.ref.path, field)
        )
      }
    }
    for (const field of ['name', 'short_name', 'self_join_enabled']) {
      if (data[field] !== authored[field]) appSet[field] = authored[field]
    }
    if (authored.ecosystem_id) {
      if (text(data.ecosystem_id) !== authored.ecosystem_id) {
        appSet.ecosystem_id = authored.ecosystem_id
      }
    } else if ('ecosystem_id' in data) {
      deleteFields.push('ecosystem_id')
    }
    if ('id' in data) {
      if (text(data.id) && text(data.id) !== app.id) {
        blockers.push(issue(session, 'APP_ID_CONFLICT', app.ref.path))
      } else deleteFields.push('id')
    }
    for (const field of LEGACY_APP_FIELDS)
      if (field in data) deleteFields.push(field)
    if (data.created && typeof data.created === 'object' && 'app_id' in data.created) {
      deleteFields.push('created.app_id')
    }
    if (Object.keys(appSet).length || deleteFields.length) {
      operations.push(
        operation(session, databaseId, 'apps', app, {
          verb: 'update',
          set: appSet,
          deleteFields,
        })
      )
    }
    const nextData = { ...data, ...appSet }
    for (const field of deleteFields) delete nextData[field]

    const memberships = await app.ref.collection('users').get()
    let adminCount = 0
    for (const membership of memberships.docs) {
      const value = membership.data()
      if (value.role === 'admin' || value.role === 'dev') adminCount += 1
      const set = {}
      const remove = []
      if (
        value.role !== 'admin' &&
        value.role !== 'user' &&
        value.role !== 'dev'
      ) {
        blockers.push(
          issue(session, 'APP_USER_ROLE_REQUIRES_REVIEW', membership.ref.path)
        )
        continue
      }
      if (value.subscription !== 'free' && value.subscription !== 'premium') {
        blockers.push(
          issue(
            session,
            'APP_USER_SUBSCRIPTION_REQUIRES_REVIEW',
            membership.ref.path
          )
        )
        continue
      }
      if (
        !['pending', 'completed', 'skipped'].includes(value.onboarding_status)
      ) {
        set.onboarding_status = 'pending'
      }
      for (const field of LEGACY_MEMBERSHIP_FIELDS)
        if (field in value) remove.push(field)
      if (
        value.created &&
        typeof value.created === 'object' &&
        'app_id' in value.created
      ) {
        remove.push('created.app_id')
      }
      if (Object.keys(set).length || remove.length) {
        operations.push(
          operation(session, databaseId, `apps/${app.id}/users`, membership, {
            verb: 'update',
            set,
            deleteFields: remove,
          })
        )
      }
    }
    if (nextData.status === 'active' && adminCount === 0) {
      issues.push(issue(session, 'ACTIVE_APP_ADMIN_REQUIRED', app.ref.path))
    }

    for (const meta of [legacyMeta, retiredMeta]) {
      if (!meta.exists) continue
      operations.push(
        operation(session, '(default)', meta.ref.parent.path, meta, {
          verb: 'delete',
        })
      )
    }
  }
}

function summarize(plan) {
  const byCode = (items) =>
    Object.fromEntries(
      [...new Set(items.map((entry) => entry.code))]
        .sort()
        .map((code) => [
          code,
          items.filter((entry) => entry.code === code).length,
        ])
    )
  return {
    mode: plan.mode,
    family: plan.family,
    planSha256: plan.planSha256,
    targets: plan.targets.length,
    operations: plan.operations.length,
    issues: byCode(plan.issues),
    blockers: byCode(plan.blockers),
  }
}

function sessionFor(sessions, operation) {
  const session = sessions.find(
    (candidate) => candidate.projectId === operation.projectId
  )
  if (!session) throw new Error(`Missing session for ${operation.projectId}.`)
  return session
}

function databaseFor(session, databaseId) {
  return databaseId === '(default)'
    ? getFirestore(session.app)
    : getFirestore(session.app, databaseId)
}

async function currentSnapshot(session, operation) {
  return databaseFor(session, operation.databaseId)
    .collection(operation.collectionPath)
    .doc(operation.id)
    .get()
}

async function assertPreconditions(sessions, operations) {
  for (const entry of operations) {
    const snapshot = await currentSnapshot(sessionFor(sessions, entry), entry)
    const currentHash = sha256(snapshot.exists ? snapshot.data() : null)
    if (currentHash !== entry.preconditionSha256) {
      throw new Error(`Stale plan target: ${snapshot.ref.path}`)
    }
  }
}

async function capturePreimage(sessions, plan) {
  const documents = []
  for (const entry of plan.operations) {
    const snapshot = await currentSnapshot(sessionFor(sessions, entry), entry)
    documents.push({
      projectId: entry.projectId,
      databaseId: entry.databaseId,
      path: snapshot.ref.path,
      exists: snapshot.exists,
      data: snapshot.exists ? stableValue(snapshot.data()) : null,
    })
  }
  return {
    format: 'fireux-user-ecosystem-project-app-onboarding-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256: plan.planSha256,
    documents,
  }
}

function mutationTarget(entry) {
  return defineFirestoreMutationTarget({
    key: `onboarding.${entry.ecosystem}.${entry.collectionPath}`,
    lane: 'mcp-skill',
    verbs: ['create', 'update', 'delete'],
    database:
      entry.databaseId === '(default)'
        ? { kind: 'default' }
        : { kind: 'named', databaseId: entry.databaseId },
    collectionPath: entry.collectionPath,
  })
}

function materialize(value) {
  if (value == null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(materialize)
  if (typeof value.__timestamp === 'string') {
    return new Date(value.__timestamp)
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [key, materialize(entry)])
  )
}

async function applyOperations(sessions, operations) {
  for (const entry of operations) {
    const session = sessionFor(sessions, entry)
    const target = mutationTarget(entry)
    const patch = materialize(entry.set)
    for (const field of entry.deleteFields) patch[field] = FieldValue.delete()
    if (entry.verb === 'create') {
      await mcpSkillCreate(session.app, target, entry.id, patch)
    } else if (entry.verb === 'delete') {
      await mcpSkillDelete(session.app, target, entry.id)
    } else {
      await mcpSkillUpdate(session.app, target, entry.id, patch)
    }
  }
}

function valueAtPath(source, field) {
  return field.split('.').reduce((value, key) => value?.[key], source)
}

async function verifyOperations(sessions, operations) {
  const failures = []
  for (const entry of operations) {
    const snapshot = await currentSnapshot(sessionFor(sessions, entry), entry)
    const data = snapshot.data() || {}
    if (entry.verb === 'delete') {
      if (snapshot.exists) failures.push({ path: snapshot.ref.path, reason: 'not-deleted' })
      continue
    }
    if (!snapshot.exists) {
      failures.push({ path: snapshot.ref.path, reason: 'missing' })
      continue
    }
    for (const [field, expected] of Object.entries(entry.set)) {
      if (stableJson(valueAtPath(data, field)) !== stableJson(expected)) {
        failures.push({ path: snapshot.ref.path, field, reason: 'value' })
      }
    }
    for (const field of entry.deleteFields) {
      if (valueAtPath(data, field) !== undefined) {
        failures.push({ path: snapshot.ref.path, field, reason: 'not-deleted' })
      }
    }
  }
  return failures
}
