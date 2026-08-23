#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-23
// usage_note: backup-first canonical User/AppUser role and subscription migration across every registered App database.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { APP_REGISTRY } from './_lib/app-registry.mjs'
import { parseArgs } from './_lib/args.mjs'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const args = parseArgs(process.argv.slice(2))
const allowedArgs = new Set(['apply', 'backup', 'confirm', 'help', 'report'])
for (const key of Object.keys(args)) {
  if (!allowedArgs.has(key)) throw new Error(`Unknown option: --${key}`)
}

if (args.help) {
  console.log(`
Dry run:
  node scripts/migrate-user-app-user-canon.mjs --report /private/tmp/user-app-user-plan.json

Apply reviewed plan:
  node scripts/migrate-user-app-user-canon.mjs --apply --confirm <planSha256> \\
    --backup /private/tmp/user-app-user-preimage.json
`)
  process.exit(0)
}

const USER_FIELDS = ['avatar', 'bio', 'display_name', 'handle']
const APP_USER_FIELDS = [
  'created',
  'onboarding_status',
  'role',
  'subscription',
  'updated',
]
const MISEBOX_FREE_DEVELOPER_OVERRIDE = {
  projectId: 'misebox-78f9c',
  databaseId: 'misebox',
  appId: 'misebox-app',
  userId: 'jMK33p5XlhYS8rBCEf8qUiogfMg2',
  subscription: 'free',
  reason: 'Reviewed decision: design and test the normal Free Kitchen experience first.',
}

const text = (value) => String(value ?? '').trim()
const literal = (source, key) =>
  text(
    source.match(new RegExp(`\\b${key}\\s*:\\s*'([^']*)'`))?.[1] ||
      source.match(new RegExp(`\\b${key}\\s*:\\s*"([^"]*)"`))?.[1]
  )

function requiredTmpPath(key, value) {
  const resolved = path.resolve(text(value))
  if (!value || !resolved.startsWith('/private/tmp/')) {
    throw new Error(`--${key} must be a new path under /private/tmp/.`)
  }
  return resolved
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

const stableJson = (value) => JSON.stringify(stableValue(value))
const sha256 = (value) =>
  createHash('sha256').update(stableJson(value)).digest('hex')

function ecosystemTargets() {
  const targets = new Map()
  for (const app of Object.values(APP_REGISTRY)) {
    const ecosystem = text(app.ecosystem)
    if (!targets.has(ecosystem)) {
      const source = readFileSync(
        path.resolve(
          'packages/ecosystem',
          `fireux-${ecosystem}`,
          'src/config/firebase/ecosystem.config.ts'
        ),
        'utf8'
      )
      targets.set(ecosystem, {
        ecosystem,
        projectId: literal(source, 'projectId'),
        identityDatabaseId: literal(source, 'databaseId'),
        apps: [],
      })
    }
    let developerId = ''
    try {
      const env = readFileSync(path.resolve(app.workspace, '.env'), 'utf8')
      developerId = text(env.match(/^DEVELOPER_(?:ID|UID)=(.+)$/m)?.[1]).replace(
        /^['"]|['"]$/g,
        ''
      )
    } catch {}
    targets.get(ecosystem).apps.push({
      key: app.key,
      appId: app.appId,
      databaseId: app.databaseId,
      developerId,
    })
  }
  return [...targets.values()].sort((a, b) =>
    a.ecosystem.localeCompare(b.ecosystem)
  )
}

async function openSessions() {
  const sessions = []
  for (const target of ecosystemTargets()) {
    const resolved = await resolveFirebaseAdminCredential({
      scope: target.ecosystem,
      projectId: target.projectId,
    })
    const app = initializeApp(
      { credential: resolved.credential, projectId: target.projectId },
      `user-app-user-canon-${target.ecosystem}-${Date.now()}`
    )
    sessions.push({ ...target, app })
  }
  return sessions
}

function operation(session, databaseId, collectionPath, snapshot, set, remove) {
  return {
    ecosystem: session.ecosystem,
    projectId: session.projectId,
    databaseId,
    collectionPath,
    id: snapshot.id,
    set,
    remove: [...new Set(remove)].sort(),
    preconditionSha256: sha256(snapshot.data()),
  }
}

function hasOverride(session, app, membership) {
  return (
    session.projectId === MISEBOX_FREE_DEVELOPER_OVERRIDE.projectId &&
    app.databaseId === MISEBOX_FREE_DEVELOPER_OVERRIDE.databaseId &&
    app.appId === MISEBOX_FREE_DEVELOPER_OVERRIDE.appId &&
    membership.id === MISEBOX_FREE_DEVELOPER_OVERRIDE.userId
  )
}

async function buildPlan(sessions) {
  const operations = []
  const blockers = []
  const counts = { users: 0, appUsers: 0, developers: 0, subscriptions: { free: 0, premium: 0 } }

  for (const session of sessions) {
    const identityDb = getFirestore(session.app, session.identityDatabaseId)
    const users = await identityDb.collection('users').get()
    for (const user of users.docs) {
      counts.users += 1
      const value = user.data()
      const missing = USER_FIELDS.filter((field) => typeof value[field] !== 'string')
      const unknown = Object.keys(value).filter(
        (field) => !USER_FIELDS.includes(field) && !['created', 'updated'].includes(field)
      )
      if (missing.length || unknown.length) {
        blockers.push({
          projectId: session.projectId,
          databaseId: session.identityDatabaseId,
          path: user.ref.path,
          missing,
          unknown,
        })
        continue
      }
      const remove = ['created', 'updated'].filter((field) => field in value)
      if (remove.length) {
        operations.push(
          operation(session, session.identityDatabaseId, 'users', user, {}, remove)
        )
      }
    }

    for (const app of session.apps) {
      const db = getFirestore(session.app, app.databaseId)
      const memberships = await db
        .collection('apps')
        .doc(app.appId)
        .collection('users')
        .get()
      for (const membership of memberships.docs) {
        counts.appUsers += 1
        const value = membership.data()
        const configuredDeveloper =
          Boolean(app.developerId) && membership.id === app.developerId
        const role = configuredDeveloper ? 'dev' : value.role
        const subscription = hasOverride(session, app, membership)
          ? 'free'
          : value.subscription === 'free' || value.subscription === 'premium'
            ? value.subscription
            : value.is_premium === true
              ? 'premium'
              : value.is_premium === false
                ? 'free'
                : ''
        const allowedBefore = [...APP_USER_FIELDS, 'is_premium']
        const unknown = Object.keys(value).filter(
          (field) => !allowedBefore.includes(field)
        )
        const validStamps =
          value.created && typeof value.created === 'object' &&
          value.updated && typeof value.updated === 'object'
        if (
          !['user', 'admin', 'dev'].includes(role) ||
          !['free', 'premium'].includes(subscription) ||
          !['pending', 'completed', 'skipped'].includes(value.onboarding_status) ||
          !validStamps ||
          unknown.length
        ) {
          blockers.push({
            projectId: session.projectId,
            databaseId: app.databaseId,
            path: membership.ref.path,
            role,
            subscription,
            onboarding_status: value.onboarding_status ?? null,
            validStamps: Boolean(validStamps),
            unknown,
          })
          continue
        }
        if (role === 'dev') counts.developers += 1
        counts.subscriptions[subscription] += 1
        const set = {}
        if (value.role !== role) set.role = role
        if (value.subscription !== subscription) set.subscription = subscription
        const remove = 'is_premium' in value ? ['is_premium'] : []
        if (Object.keys(set).length || remove.length) {
          operations.push(
            operation(
              session,
              app.databaseId,
              `apps/${app.appId}/users`,
              membership,
              set,
              remove
            )
          )
        }
      }
    }
  }

  const planBody = {
    format: 'fireux-user-app-user-canon-plan/1',
    targets: sessions.map((session) => ({
      ecosystem: session.ecosystem,
      projectId: session.projectId,
      identityDatabaseId: session.identityDatabaseId,
      appDatabases: [...new Set(session.apps.map((app) => app.databaseId))].sort(),
    })),
    override: MISEBOX_FREE_DEVELOPER_OVERRIDE,
    counts,
    blockers,
    operations,
  }
  return { ...planBody, planSha256: sha256(planBody) }
}

function sessionFor(sessions, entry) {
  const session = sessions.find((value) => value.projectId === entry.projectId)
  if (!session) throw new Error(`Missing session for ${entry.projectId}.`)
  return session
}

function snapshotFor(sessions, entry) {
  const session = sessionFor(sessions, entry)
  return getFirestore(session.app, entry.databaseId)
    .collection(entry.collectionPath)
    .doc(entry.id)
    .get()
}

async function assertPreconditions(sessions, operations) {
  for (const entry of operations) {
    const snapshot = await snapshotFor(sessions, entry)
    if (!snapshot.exists || sha256(snapshot.data()) !== entry.preconditionSha256) {
      throw new Error(`Stale migration target: ${entry.collectionPath}/${entry.id}`)
    }
  }
}

async function capturePreimage(sessions, plan) {
  const documents = []
  for (const entry of plan.operations) {
    const snapshot = await snapshotFor(sessions, entry)
    documents.push({
      projectId: entry.projectId,
      databaseId: entry.databaseId,
      path: snapshot.ref.path,
      data: stableValue(snapshot.data()),
    })
  }
  return {
    format: 'fireux-user-app-user-canon-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256: plan.planSha256,
    override: MISEBOX_FREE_DEVELOPER_OVERRIDE,
    documents,
  }
}

function mutationTarget(entry) {
  return defineFirestoreMutationTarget({
    key: `user-app-user-canon.${entry.ecosystem}.${entry.collectionPath}`,
    lane: 'mcp-skill',
    verbs: ['update'],
    database: { kind: 'named', databaseId: entry.databaseId },
    collectionPath: entry.collectionPath,
  })
}

async function applyOperations(sessions, operations) {
  for (const entry of operations) {
    const patch = { ...entry.set }
    for (const field of entry.remove) patch[field] = FieldValue.delete()
    await mcpSkillUpdate(
      sessionFor(sessions, entry).app,
      mutationTarget(entry),
      entry.id,
      patch
    )
  }
}

async function verify(sessions) {
  const failures = []
  for (const session of sessions) {
    const users = await getFirestore(session.app, session.identityDatabaseId)
      .collection('users')
      .get()
    for (const user of users.docs) {
      const fields = Object.keys(user.data()).sort()
      if (stableJson(fields) !== stableJson([...USER_FIELDS].sort())) {
        failures.push({ projectId: session.projectId, databaseId: session.identityDatabaseId, path: user.ref.path, fields })
      }
    }
    for (const app of session.apps) {
      const memberships = await getFirestore(session.app, app.databaseId)
        .collection('apps')
        .doc(app.appId)
        .collection('users')
        .get()
      for (const membership of memberships.docs) {
        const value = membership.data()
        const fields = Object.keys(value).sort()
        if (
          stableJson(fields) !== stableJson([...APP_USER_FIELDS].sort()) ||
          !['user', 'admin', 'dev'].includes(value.role) ||
          !['free', 'premium'].includes(value.subscription)
        ) {
          failures.push({ projectId: session.projectId, databaseId: app.databaseId, path: membership.ref.path, fields, role: value.role, subscription: value.subscription })
        }
      }
    }
  }
  return failures
}

const sessions = await openSessions()
try {
  const plan = await buildPlan(sessions)
  if (args.report) {
    plan.reportArtifact = await writeProtectedJsonArtifact({
      path: requiredTmpPath('report', args.report),
      payload: plan,
    })
  }
  if (!args.apply) {
    console.log(JSON.stringify(plan, null, 2))
    process.exitCode = plan.blockers.length ? 1 : 0
  } else {
    if (plan.blockers.length) throw new Error('Migration has unresolved blockers.')
    if (text(args.confirm) !== plan.planSha256) {
      throw new Error(`Apply requires --confirm ${plan.planSha256}.`)
    }
    await assertPreconditions(sessions, plan.operations)
    const backupArtifact = await writeProtectedJsonArtifact({
      path: requiredTmpPath('backup', args.backup),
      payload: await capturePreimage(sessions, plan),
    })
    await applyOperations(sessions, plan.operations)
    const failures = await verify(sessions)
    if (failures.length) {
      throw new Error(`Post-write verification failed: ${JSON.stringify(failures)}`)
    }
    console.log(JSON.stringify({ mode: 'apply', planSha256: plan.planSha256, counts: plan.counts, operations: plan.operations.length, backupArtifact, verified: true }, null, 2))
  }
} finally {
  await Promise.all(sessions.map((session) => deleteApp(session.app)))
}
