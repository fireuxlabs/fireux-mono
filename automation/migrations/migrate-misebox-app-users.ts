/* scripts/migrate-misebox-app-users.ts
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_JSON="$(cat path/to/service-account.json)" \
 *   node -r esbuild-register scripts/migrate-misebox-app-users.ts --dry-run
 *
 *   # real run (no deletions)
 *   node -r esbuild-register scripts/migrate-misebox-app-users.ts
 *
 *   # real run + delete tenant app users after migration
 *   node -r esbuild-register scripts/migrate-misebox-app-users.ts --delete
 *
 *   # include (optional) chef profile upserts (disabled by default now)
 *   node -r esbuild-register scripts/migrate-misebox-app-users.ts --chefs
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

// ---------- Config ----------
const TENANT_APP_ID = 'misebox-app'
const TENANT_USERS_PATH = `apps/${TENANT_APP_ID}/users`
const CORE_USERS_PATH = 'core-users'
const GLOBAL_CHEFS_PATH = 'chefs'

// Args
const args = new Set(process.argv.slice(2))
const DRY_RUN = args.has('--dry-run')
const DO_DELETE = args.has('--delete')
const INCLUDE_CHEFS = args.has('--chefs')

// ---------- Credential Resolution ----------
// Precedence:
//  1. FIREBASE_SERVICE_ACCOUNT_JSON (inline JSON)
//  2. FIREBASE_SERVICE_ACCOUNT_FILE (explicit path)
//  3. Conventional repo path (packages/ecosystem/fireux-misebox/config/service-account.json)
//  4. Application Default Credentials (gcloud / workstation)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
const saFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
const conventionalPaths = [
  path.resolve(
    __dirname,
    '../packages/ecosystem/fireux-misebox/config/service-account.json'
  ),
]

function loadCredential() {
  try {
    if (saJson) {
      console.log('🔐 Using FIREBASE_SERVICE_ACCOUNT_JSON env.')
      return cert(JSON.parse(saJson))
    }
    if (saFile && fs.existsSync(saFile)) {
      console.log(`🔐 Using FIREBASE_SERVICE_ACCOUNT_FILE: ${saFile}`)
      return cert(JSON.parse(fs.readFileSync(saFile, 'utf8')))
    }
    const fallbackPath = conventionalPaths.find((p) => fs.existsSync(p))
    if (fallbackPath) {
      console.log(
        `🔐 Using conventional service account path: ${fallbackPath}`
      )
      return cert(JSON.parse(fs.readFileSync(fallbackPath, 'utf8')))
    }
    console.log(
      '🛈 No service account file/env found; attempting Application Default Credentials (ADC)...'
    )
    return applicationDefault()
  } catch (e: any) {
    console.error(
      'Failed to load Firebase credentials. Provide one of:\n' +
        '  export FIREBASE_SERVICE_ACCOUNT_JSON="$(cat service-account.json)"\n' +
        '  export FIREBASE_SERVICE_ACCOUNT_FILE=./path/service-account.json\n' +
        `  (or place file at ${conventionalPaths[0]})\n` +
        '  or run: gcloud auth application-default login\n'
    )
    throw e
  }
}

initializeApp({ credential: loadCredential() })

const db = getFirestore()

// ---------- Types ----------
interface SlimAppUser {
  uid: string
  email: string
  display_name: string
  handle?: string
  avatar?: string
  created_at?: any
  updated_at?: any
}

// minimal CoreUser merge
function toCoreUserMerge(u: Record<string, any>): Record<string, any> {
  const display = u.display_name || u.handle || u.email || ''
  const userOfValue = TENANT_APP_ID
  const adminIds: string[] = []
  if (u.role === 'admin') adminIds.push(TENANT_APP_ID)
  return {
    email: u.email ?? '',
    display_name: display || undefined,
    avatar: u.avatar || undefined,
    userOf: FieldValue.arrayUnion(userOfValue),
    ...(adminIds.length ? { adminOf: FieldValue.arrayUnion(...adminIds) } : {}),
    created_at: u.created_at ?? FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
    ...(Array.isArray(u.profiles) && u.profiles.length
      ? { profiles: Array.from(new Set<string>(u.profiles)) }
      : {}),
  }
}

// minimal Chef profile upsert
function toChefProfileMerge(u: Record<string, any>): Record<string, any> {
  return {
    uid: u.uid,
    avatarUrl: u.avatar || '',
    bio: u.bio || '',
    updated_at: FieldValue.serverTimestamp(),
  }
}

async function run() {
  console.log(`\n=== Misebox AppUsers Migration ===`)
  console.log(`Tenant users: ${TENANT_USERS_PATH}`)
  console.log(`Core users:   ${CORE_USERS_PATH}`)
  console.log(`Global chefs: ${GLOBAL_CHEFS_PATH}`)
  console.log(
    `Mode: ${DRY_RUN ? 'DRY RUN' : 'REAL RUN'}${DO_DELETE ? ' + DELETE' : ''}`
  )
  console.log(
    `Chefs: ${INCLUDE_CHEFS ? 'ENABLED (--chefs)' : 'DISABLED (skipping chef profiles)'}\n`
  )

  const snap = await db.collection(TENANT_USERS_PATH).get()
  if (snap.empty) {
    console.log('No tenant AppUsers found — nothing to do.')
    return
  }

  // ---------- 1) Backup full JSON ----------
  const exported = {
    exportedAt: new Date().toISOString(),
    collectionPath: TENANT_USERS_PATH,
    total: snap.size,
    users: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
  }
  const outDir = path.resolve('migrations/backups')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(
    outDir,
    `backup-${TENANT_APP_ID}-app-users-${new Date().toISOString().slice(0, 10)}.json`
  )
  fs.writeFileSync(outFile, JSON.stringify(exported, null, 2))
  console.log(`✅ Backup written: ${outFile}`)

  // ---------- 2) Slim backup ----------
  const slim: SlimAppUser[] = exported.users.map((u: any) => ({
    uid: u.uid,
    email: u.email,
    display_name: u.display_name || u.handle || u.email || '',
    handle: u.handle,
    avatar: u.avatar,
    created_at: u.created_at ?? null,
    updated_at: u.updated_at ?? null,
  }))
  const slimFile = path.join(
    outDir,
    `backup-${TENANT_APP_ID}-app-users-slim-${new Date().toISOString().slice(0, 10)}.json`
  )
  fs.writeFileSync(
    slimFile,
    JSON.stringify({ total: slim.length, users: slim }, null, 2)
  )
  console.log(`✅ Slim backup written: ${slimFile}`)

  // ---------- 3) Migrate ----------
  let coreUpserts = 0
  let chefUpserts = 0
  let deletes = 0

  const CHUNK = 400
  const docs = snap.docs

  for (let i = 0; i < docs.length; i += CHUNK) {
    const chunk = docs.slice(i, i + CHUNK)
    const batch = db.batch()

    for (const d of chunk) {
      const data = d.data()
      const uid = data.uid || d.id
      if (!uid) continue

      // core-users upsert
      const coreRef = db.collection(CORE_USERS_PATH).doc(uid)
      if (!DRY_RUN) batch.set(coreRef, toCoreUserMerge(data), { merge: true })
      coreUpserts++

      if (INCLUDE_CHEFS) {
        // chefs upsert when profile suggests
        const hasChefProfile =
          (Array.isArray(data.profiles) && data.profiles.includes('chef')) ||
          typeof data.bio === 'string'

        if (hasChefProfile) {
          const chefRef = db.collection(GLOBAL_CHEFS_PATH).doc(uid)
          if (!DRY_RUN) {
            batch.set(
              chefRef,
              {
                created_at: FieldValue.serverTimestamp(),
                ...toChefProfileMerge(data),
              },
              { merge: true }
            )
          }
          chefUpserts++
        }
      }

      if (DO_DELETE && !DRY_RUN) {
        batch.delete(d.ref)
        deletes++
      }
    }

    if (!DRY_RUN) await batch.commit()
    console.log(
      `Processed ${Math.min(i + CHUNK, docs.length)} / ${docs.length} (core:${coreUpserts}, chefs:${chefUpserts}$${
        DO_DELETE ? `, deleted:${deletes}` : ''
      })`
    )
  }

  console.log(`\n✅ Migration complete.`)
  console.log(`   Core upserts: ${coreUpserts}`)
  if (INCLUDE_CHEFS) console.log(`   Chef upserts: ${chefUpserts}`)
  if (DO_DELETE) console.log(`   Deleted tenant docs: ${deletes}`)
  console.log(`   Tip: verify /dev/core-users and /dev/fireux-misebox pages.`)
}

run().catch((e) => {
  console.error('Migration failed:', e)
  process.exit(1)
})
