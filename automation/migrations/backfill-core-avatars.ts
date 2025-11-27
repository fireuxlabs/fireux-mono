#!/usr/bin/env tsx

/**
 * FireUX Core Avatars Backfill Script
 *
 * For Core Users missing an avatar, attempts to:
 *  1) Copy an existing AppUser avatar (URL) into Storage at core-users/{uid}/avatar.{ext}
 *  2) Otherwise sets a static default path '/img/core/defaults/default-thumbnail.png'
 *
 * Usage:
 *   pnpm tsx automation/migrations/backfill-core-avatars.ts <project> [--dry-run]
 * Examples:
 *   pnpm tsx automation/migrations/backfill-core-avatars.ts fireux --dry-run
 *   pnpm tsx automation/migrations/backfill-core-avatars.ts misebox
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import type { Storage } from 'firebase-admin/storage'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(__dirname, '..', '..')

const PROJECTS = {
  fireux: {
    name: 'FireUX',
    serviceAccountPath: resolve(
      repoRoot,
      'projects/fireux/fireux-app/config/service-account.json'
    ),
    projectId: 'fireux-2005',
  },
  misebox: {
    name: 'MiseBox',
    serviceAccountPath: resolve(
      repoRoot,
      'packages/ecosystem/fireux-misebox/config/service-account.json'
    ),
    projectId: 'misebox-78f9c',
  },
  cleanbox: {
    name: 'CleanBox',
    serviceAccountPath: resolve(
      repoRoot,
      'packages/ecosystem/fireux-cleanbox/config/service-account.json'
    ),
    projectId: 'cleanbox-f15bc',
  },
} as const

type ProjectKey = keyof typeof PROJECTS
type ProjectConfig = (typeof PROJECTS)[ProjectKey]
type StorageBucket = ReturnType<Storage['bucket']>

const DEFAULT_AVATAR_STATIC = '/img/core/defaults/default-thumbnail.png'

type BackfillStats = {
  processed: number
  updated: number
  skipped: number
  errors: number
}

function createStats(): BackfillStats {
  return {
    processed: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  }
}

function getDefaultBucketName(projectId: string) {
  return `${projectId}.appspot.com`
}

function inferExtension(contentType?: string) {
  if (!contentType) return 'jpg'
  if (contentType.includes('png')) return 'png'
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg'
  if (contentType.includes('webp')) return 'webp'
  return 'jpg'
}

function buildDownloadUrl(bucket: string, path: string, token: string) {
  const encodedPath = encodeURIComponent(path)
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${token}`
}

function isHttpUrl(s: unknown): s is string {
  return (
    typeof s === 'string' &&
    (s.startsWith('http://') || s.startsWith('https://'))
  )
}

function isTruthyString(s: unknown): s is string {
  return typeof s === 'string' && s.trim().length > 0
}

async function getAppUsersCollection(
  db: FirebaseFirestore.Firestore,
  project: ProjectKey
) {
  const appId = getAppId(project)
  const candidates = [`apps/${appId}/users`, 'app-users', 'users']
  for (const name of candidates) {
    try {
      const snap = await db.collection(name).limit(1).get()
      if (!snap.empty) return name
    } catch {
      // ignore
    }
  }
  return 'app-users'
}

function getAppId(project: ProjectKey) {
  const map: Record<ProjectKey, string> = {
    fireux: 'fireux-app',
    misebox: 'misebox-app',
    cleanbox: 'cleanbox-app',
  }
  return map[project]
}

async function main() {
  const { project, dryRun } = parseArgs()
  const config = PROJECTS[project]

  logRunInfo(config, dryRun)

  const firebase = initFirebase(config)
  const stats = await backfillCoreUsers({
    project,
    dryRun,
    ...firebase,
  })

  reportStats(stats)
  if (stats.errors > 0) process.exit(1)
}

function parseArgs(): { project: ProjectKey; dryRun: boolean } {
  const args = process.argv.slice(2)
  const project = args[0] as ProjectKey
  const dryRun = args.includes('--dry-run')

  if (!project || !PROJECTS[project]) {
    console.log(
      'Usage: pnpm tsx automation/migrations/backfill-core-avatars.ts <project> [--dry-run]'
    )
    console.log(`Projects: ${Object.keys(PROJECTS).join(', ')}`)
    process.exit(1)
  }

  return { project, dryRun }
}

function logRunInfo(config: ProjectConfig, dryRun: boolean) {
  console.log(
    `\n🔧 Backfilling Core Avatars for ${config.name} (${config.projectId})`
  )
  console.log(`📁 Service Account: ${config.serviceAccountPath}`)
  if (dryRun) console.log('🧪 DRY RUN: no writes will be performed')
}

function initFirebase(config: ProjectConfig) {
  const serviceAccount = JSON.parse(
    readFileSync(config.serviceAccountPath, 'utf8')
  )
  const app = initializeApp(
    { credential: cert(serviceAccount), projectId: config.projectId },
    config.projectId
  )
  const db = getFirestore(app)
  const storage = getStorage(app)
  const bucketName = getDefaultBucketName(config.projectId)
  const bucket = storage.bucket(bucketName)

  return { db, bucket, bucketName }
}

async function backfillCoreUsers({
  project,
  dryRun,
  db,
  bucket,
  bucketName,
}: {
  project: ProjectKey
  dryRun: boolean
  db: FirebaseFirestore.Firestore
  bucket: StorageBucket
  bucketName: string
}): Promise<BackfillStats> {
  const stats = createStats()

  const coreSnap = await db.collection('core-users').get()
  const appUsersCollection = await getAppUsersCollection(db, project)
  const appUsersSnap = await db.collection(appUsersCollection).get()
  const appUsersMap = buildAppUsersMap(appUsersSnap)

  console.log(
    `📊 Core Users: ${coreSnap.size}, App Users: ${appUsersSnap.size}`
  )

  for (const doc of coreSnap.docs) {
    await processCoreUser(doc, appUsersMap, {
      bucket,
      bucketName,
      dryRun,
      stats,
    })
  }

  return stats
}

function buildAppUsersMap(
  snap: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
) {
  const map = new Map<string, FirebaseFirestore.DocumentData>()
  for (const doc of snap.docs) {
    map.set(doc.id, doc.data())
  }
  return map
}

async function processCoreUser(
  doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
  appUsersMap: Map<string, FirebaseFirestore.DocumentData>,
  {
    bucket,
    bucketName,
    dryRun,
    stats,
  }: {
    bucket: StorageBucket
    bucketName: string
    dryRun: boolean
    stats: BackfillStats
  }
) {
  stats.processed++

  const coreUser = { id: doc.id, ...(doc.data() as any) }
  const uid = coreUser.id as string
  const displayId = (coreUser.email || uid) as string
  const existing = coreUser.avatar as string | undefined

  if (isTruthyString(existing)) {
    // Already has an avatar — skip unless future requirements call for replacement
    stats.skipped++
    return
  }

  const appUser = appUsersMap.get(uid)
  const candidate = getCandidateAvatar(appUser)
  const copied = await tryCopyAppAvatar(candidate, {
    bucket,
    bucketName,
    dryRun,
    uid,
    label: displayId,
  })

  const newAvatarUrl = copied ?? DEFAULT_AVATAR_STATIC

  if (!dryRun) {
    await doc.ref.update({ avatar: newAvatarUrl })
  }

  stats.updated++
  console.log(`  ✅ ${displayId}: avatar set`)
}

function getCandidateAvatar(
  appUser?: FirebaseFirestore.DocumentData
): string | undefined {
  if (!appUser) return undefined
  return (appUser.avatar ||
    appUser.avatarUrl ||
    appUser.photoURL ||
    appUser.photoUrl) as string | undefined
}

async function tryCopyAppAvatar(
  candidate: string | undefined,
  {
    bucket,
    bucketName,
    dryRun,
    uid,
    label,
  }: {
    bucket: StorageBucket
    bucketName: string
    dryRun: boolean
    uid: string
    label: string
  }
): Promise<string | null> {
  if (!isHttpUrl(candidate)) return null

  try {
    const resp = await fetch(candidate)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const contentType = resp.headers.get('content-type') || undefined
    const ext = inferExtension(contentType)
    const arrayBuf = await resp.arrayBuffer()
    const buffer = Buffer.from(arrayBuf)
    const token = (globalThis.crypto?.randomUUID?.() ||
      Math.random().toString(36).slice(2)) as string
    const path = `core-users/${uid}/avatar.${ext}`

    if (!dryRun) {
      await bucket.file(path).save(buffer, {
        contentType:
          contentType || (ext === 'png' ? 'image/png' : 'image/jpeg'),
        metadata: { metadata: { firebaseStorageDownloadTokens: token } },
        public: false,
        resumable: false,
        validation: false,
      })
    }

    return buildDownloadUrl(bucketName, path, token)
  } catch (err: any) {
    console.warn(`  ⚠️  ${label}: failed to copy app avatar →`, err.message)
    return null
  }
}

function reportStats(stats: BackfillStats) {
  console.log('\n📈 Backfill Summary:')
  console.log(`   Processed: ${stats.processed}`)
  console.log(`   Updated:   ${stats.updated}`)
  console.log(`   Skipped:   ${stats.skipped}`)
  console.log(`   Errors:    ${stats.errors}`)
}

try {
  await main()
} catch (e) {
  console.error('💥 Unhandled error:', e)
  process.exit(1)
}
