#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-08
// usage_note: plan or explicitly copy legacy User avatars into their canonical owned Firebase Storage paths without deleting source objects.

import { createHash, randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import sharp from 'sharp'
import { APP_REGISTRY } from './_lib/app-registry.mjs'
import { parseArgs } from './_lib/args.mjs'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { mcpSkillUpdate } from './_lib/firestore-mutations/mcp-skill-update.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'
import { defineFirestoreMutationTarget } from '../packages/core/fireux-core/src/runtime/utils/firestore-mutations/target-definition.ts'

const ALLOWED_ARGS = new Set([
  'all',
  'apply',
  'backup',
  'confirm',
  'ecosystem',
  'help',
  'report',
  'service-account',
  'summary',
])
const MAX_AVATAR_BYTES = 12 * 1024 * 1024
const CORE_FALLBACK = path.resolve(
  'packages/core/fireux-core/src/runtime/public/img/core/defaults/default-avatar.png'
)

const args = parseArgs(process.argv.slice(2))
for (const key of Object.keys(args)) {
  if (!ALLOWED_ARGS.has(key)) throw new Error(`Unknown option: --${key}`)
}
if (args.help) {
  console.log(`
Copy legacy User avatars to users/{uid}/avatar/current.

Dry run:
  pnpm align:user-avatars -- --all --summary
  pnpm align:user-avatars -- --ecosystem misebox --report /private/tmp/avatar-plan.json

Explicit apply:
  pnpm align:user-avatars -- --all --apply --confirm <planSha256> \\
    --backup /private/tmp/avatar-preimage.json

The source object is retained. Apply writes a protected preimage, verifies
source bytes, uploads the exact bytes to the owned path, updates only the
canonical User avatar field, and verifies both Storage and Firestore.

${firebaseAdminCredentialHelp()}
`)
  process.exit(0)
}

const apply = args.apply === true
const requestedEcosystem = text(args.ecosystem)
if (args.all !== true && !requestedEcosystem) {
  throw new Error('Choose --all or --ecosystem <key>.')
}
if (args.all === true && requestedEcosystem) {
  throw new Error('--all and --ecosystem are mutually exclusive.')
}
const reportPath = optionalTmpPath('report', args.report)
const backupPath = apply ? requiredTmpPath('backup', args.backup) : ''
const configs = discoverEcosystemConfigs().filter(
  (config) => !requestedEcosystem || config.ecosystemKey === requestedEcosystem
)
if (!configs.length) throw new Error('No matching ecosystem target.')

const sessions = []
try {
  for (const config of configs) sessions.push(await openSession(config))
  const { plan, sources } = await buildPlan(sessions)
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
      `Apply blocked by ${plan.blockers.length} avatar finding(s).`
    )
  }
  await assertCurrent(sessions, plan.operations, sources)
  const backup = await capturePreimage(sessions, plan)
  const backupArtifact = await writeProtectedJsonArtifact({
    path: backupPath,
    payload: backup,
  })
  await applyOperations(sessions, plan.operations, sources)
  const failures = await verifyOperations(sessions, plan.operations)
  if (failures.length) {
    throw new Error(
      `Avatar verification failed for ${failures.length} User(s). Backup: ${backupArtifact.path}`
    )
  }
  console.log(
    JSON.stringify(
      {
        mode: 'apply',
        planSha256: plan.planSha256,
        avatars: plan.operations.length,
        backupArtifact,
        postWriteVerified: true,
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

function requiredTmpPath(key, value) {
  const resolved = path.resolve(text(value))
  if (!value || !resolved.startsWith('/private/tmp/')) {
    throw new Error(`--${key} must be a new path under /private/tmp/.`)
  }
  return resolved
}

function optionalTmpPath(key, value) {
  return value === undefined || value === '' ? '' : requiredTmpPath(key, value)
}

function readLiteral(source, key) {
  return (
    source.match(new RegExp(`\\b${key}\\s*:\\s*'([^']*)'`))?.[1] ||
    source.match(new RegExp(`\\b${key}\\s*:\\s*"([^"]*)"`))?.[1] ||
    ''
  ).trim()
}

function discoverEcosystemConfigs() {
  const keys = [
    ...new Set(Object.values(APP_REGISTRY).map((app) => app.ecosystem)),
  ]
  return keys.sort().map((ecosystemKey) => {
    const source = readFileSync(
      path.resolve(
        'packages',
        'ecosystem',
        `fireux-${ecosystemKey}`,
        'src',
        'config',
        'firebase',
        'ecosystem.config.ts'
      ),
      'utf8'
    )
    return {
      ecosystemKey,
      projectId: readLiteral(source, 'projectId'),
      identityDatabaseId: readLiteral(source, 'databaseId'),
      storageBucket: readLiteral(source, 'storageBucket'),
    }
  })
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
      storageBucket: config.storageBucket,
    },
    `avatar-align-${config.ecosystemKey}-${Date.now()}`
  )
  return { ...config, app }
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function canonicalAvatarOwned(value, uid) {
  const avatar = text(value)
  if (!avatar.startsWith('https://')) return false
  try {
    return decodeURIComponent(avatar).includes(`users/${uid}/avatar/current`)
  } catch {
    return false
  }
}

function fallbackPath(ecosystemKey) {
  const ecosystem = path.resolve(
    'packages',
    'ecosystem',
    `fireux-${ecosystemKey}`,
    'src',
    'runtime',
    'public',
    'img',
    'ecosystem',
    'avatar.png'
  )
  return existsSync(ecosystem) ? ecosystem : CORE_FALLBACK
}

async function sourceBytes(session, avatar) {
  if (text(avatar).startsWith('https://')) {
    const response = await fetch(avatar, { redirect: 'follow' })
    if (!response.ok)
      throw new Error(`Avatar source returned ${response.status}.`)
    return { kind: 'https', bytes: Buffer.from(await response.arrayBuffer()) }
  }
  return {
    kind: 'fallback',
    bytes: readFileSync(fallbackPath(session.ecosystemKey)),
  }
}

async function validateImage(bytes) {
  if (!bytes.length || bytes.length > MAX_AVATAR_BYTES) {
    throw new Error('Avatar source size is outside the safe boundary.')
  }
  const metadata = await sharp(bytes).metadata()
  if (!metadata.width || !metadata.height || !metadata.format) {
    throw new Error('Avatar source is not a readable image.')
  }
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    contentType:
      metadata.format === 'jpeg' ? 'image/jpeg' : `image/${metadata.format}`,
  }
}

async function buildPlan(sessions) {
  const operations = []
  const blockers = []
  const sources = new Map()
  for (const session of sessions) {
    const bucket = getStorage(session.app).bucket(session.storageBucket)
    const [bucketExists] = await bucket.exists().catch(() => [false])
    const users = await getFirestore(session.app, session.identityDatabaseId)
      .collection('users')
      .get()
    for (const user of users.docs) {
      const avatar = text(user.get('avatar'))
      if (canonicalAvatarOwned(avatar, user.id)) continue
      const key = `${session.projectId}/${user.id}`
      if (!bucketExists) {
        blockers.push({
          ecosystem: session.ecosystemKey,
          code: 'STORAGE_BUCKET_REQUIRED',
          target: user.ref.path,
        })
        continue
      }
      try {
        const source = await sourceBytes(session, avatar)
        const image = await validateImage(source.bytes)
        sources.set(key, source.bytes)
        operations.push({
          ecosystem: session.ecosystemKey,
          projectId: session.projectId,
          databaseId: session.identityDatabaseId,
          storageBucket: session.storageBucket,
          userId: user.id,
          userPath: user.ref.path,
          objectPath: `users/${user.id}/avatar/current`,
          sourceKind: source.kind,
          sourceSha256: sha256(source.bytes),
          sourceBytes: source.bytes.length,
          image,
          previousAvatarSha256: sha256(avatar),
        })
      } catch (error) {
        blockers.push({
          ecosystem: session.ecosystemKey,
          code: 'AVATAR_SOURCE_UNREADABLE',
          target: user.ref.path,
          detail: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }
  operations.sort((a, b) =>
    `${a.projectId}/${a.userId}`.localeCompare(`${b.projectId}/${b.userId}`)
  )
  const planSha256 = sha256(JSON.stringify(operations))
  return {
    plan: {
      format: 'fireux-user-avatar-alignment/1',
      mode: 'dry-run',
      generatedAt: new Date().toISOString(),
      planSha256,
      operations,
      blockers,
    },
    sources,
  }
}

function summarize(plan) {
  const blockerCounts = Object.fromEntries(
    [...new Set(plan.blockers.map((item) => item.code))]
      .sort()
      .map((code) => [
        code,
        plan.blockers.filter((item) => item.code === code).length,
      ])
  )
  return {
    mode: plan.mode,
    planSha256: plan.planSha256,
    avatars: plan.operations.length,
    sourceKinds: Object.fromEntries(
      ['https', 'fallback'].map((kind) => [
        kind,
        plan.operations.filter((item) => item.sourceKind === kind).length,
      ])
    ),
    blockers: blockerCounts,
  }
}

function sessionFor(sessions, operation) {
  const session = sessions.find(
    (item) => item.projectId === operation.projectId
  )
  if (!session) throw new Error(`Missing session for ${operation.projectId}.`)
  return session
}

async function assertCurrent(sessions, operations, sources) {
  for (const operation of operations) {
    const session = sessionFor(sessions, operation)
    const user = await getFirestore(session.app, operation.databaseId)
      .collection('users')
      .doc(operation.userId)
      .get()
    if (
      !user.exists ||
      sha256(text(user.get('avatar'))) !== operation.previousAvatarSha256
    ) {
      throw new Error(`Avatar plan is stale: ${operation.userPath}`)
    }
    const bytes = sources.get(`${operation.projectId}/${operation.userId}`)
    if (!bytes || sha256(bytes) !== operation.sourceSha256) {
      throw new Error(`Avatar source changed: ${operation.userPath}`)
    }
  }
}

async function capturePreimage(sessions, plan) {
  const users = []
  for (const operation of plan.operations) {
    const session = sessionFor(sessions, operation)
    const file = getStorage(session.app)
      .bucket(operation.storageBucket)
      .file(operation.objectPath)
    const [exists] = await file.exists()
    const previousObject = exists ? (await file.download())[0] : null
    users.push({
      projectId: operation.projectId,
      databaseId: operation.databaseId,
      userId: operation.userId,
      previousAvatarSha256: operation.previousAvatarSha256,
      objectPath: operation.objectPath,
      previousObjectBase64: previousObject?.toString('base64') || null,
    })
  }
  return {
    format: 'fireux-user-avatar-preimage/1',
    capturedAt: new Date().toISOString(),
    planSha256: plan.planSha256,
    users,
  }
}

function userTarget(operation) {
  return defineFirestoreMutationTarget({
    key: `onboarding.${operation.ecosystem}.users`,
    lane: 'mcp-skill',
    verbs: ['update'],
    database: { kind: 'named', databaseId: operation.databaseId },
    collectionPath: 'users',
  })
}

function downloadUrl(bucket, objectPath, token) {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`
}

async function applyOperations(sessions, operations, sources) {
  for (const operation of operations) {
    const session = sessionFor(sessions, operation)
    const bytes = sources.get(`${operation.projectId}/${operation.userId}`)
    const token = randomUUID()
    await getStorage(session.app)
      .bucket(operation.storageBucket)
      .file(operation.objectPath)
      .save(bytes, {
        resumable: false,
        metadata: {
          contentType: operation.image.contentType,
          cacheControl: 'public,max-age=31536000,immutable',
          metadata: { firebaseStorageDownloadTokens: token },
        },
      })
    await mcpSkillUpdate(session.app, userTarget(operation), operation.userId, {
      avatar: downloadUrl(operation.storageBucket, operation.objectPath, token),
    })
  }
}

async function verifyOperations(sessions, operations) {
  const failures = []
  for (const operation of operations) {
    const session = sessionFor(sessions, operation)
    const user = await getFirestore(session.app, operation.databaseId)
      .collection('users')
      .doc(operation.userId)
      .get()
    const file = getStorage(session.app)
      .bucket(operation.storageBucket)
      .file(operation.objectPath)
    const bytes = (await file.download())[0]
    if (
      !canonicalAvatarOwned(user.get('avatar'), operation.userId) ||
      sha256(bytes) !== operation.sourceSha256
    ) {
      failures.push(operation.userPath)
    }
  }
  return failures
}
