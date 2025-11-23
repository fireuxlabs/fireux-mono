/* scripts/fix-display-names.ts
 *
 * Purpose: One-off sanitizer to remove email addresses used as display_name
 * Strategy: For any display_name that contains '@', set display_name to the
 *           substring before '@' (trimmed). Leave others unchanged.
 * Scope: core-users and apps/<appId>/users
 *
 * Usage:
 *   FIREBASE_SERVICE_ACCOUNT_JSON="$(cat path/to/service-account.json)" \
 *   pnpm tsx scripts/fix-display-names.ts --dry-run     # show planned changes
 *   pnpm tsx scripts/fix-display-names.ts               # apply changes
 *   pnpm tsx scripts/fix-display-names.ts --apps misebox-app,niederhorn  # limit apps
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { initializeApp, cert, applicationDefault } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

const args = new Set(process.argv.slice(2))
const DRY_RUN = args.has('--dry-run')

function parseAppsArg(): string[] | null {
  const argStr = process.argv.find((a) => a.startsWith('--apps'))
  if (!argStr) return null
  const parts = argStr.split('=')
  if (parts.length < 2) return null
  return parts[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}
const ONLY_APPS = parseAppsArg()

// ---------- Credential Resolution ----------
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const saJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
const saFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
const conventionalPaths = [
  path.resolve(
    __dirname,
    '../packages/ecosystem/fireux-misebox/config/service-account.json'
  ),
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
      '🛈 No service account provided; using Application Default Credentials (ADC)'
    )
    return applicationDefault()
  } catch (e) {
    console.error('Failed to load Firebase credentials.', e)
    process.exit(1)
  }
}

initializeApp({ credential: loadCredential() })
const db = getFirestore()

function stripEmail(name: any): string | null {
  if (typeof name !== 'string') return null
  const at = name.indexOf('@')
  if (at <= 0) return null
  return name.slice(0, at).trim() || null
}

async function fixCoreUsers() {
  const snap = await db.collection('core-users').get()
  if (snap.empty) return { total: 0, fixed: 0 }
  let fixed = 0
  const toUpdate: Array<{
    ref: FirebaseFirestore.DocumentReference
    data: any
  }> = []
  for (const docSnap of snap.docs) {
    const data = docSnap.data() as any
    const newName = stripEmail(data.display_name)
    if (newName) {
      toUpdate.push({
        ref: docSnap.ref,
        data: {
          display_name: newName,
          updated_at: FieldValue.serverTimestamp(),
        },
      })
      fixed++
    }
  }
  if (!DRY_RUN && toUpdate.length) {
    const CHUNK = 400
    for (let i = 0; i < toUpdate.length; i += CHUNK) {
      const batch = db.batch()
      for (const u of toUpdate.slice(i, i + CHUNK)) batch.update(u.ref, u.data)
      await batch.commit()
    }
  }
  return { total: snap.size, fixed }
}

async function fixAppUsers() {
  const appsSnap = await db.collection('apps').get()
  if (appsSnap.empty) return { apps: 0, fixed: 0 }
  let fixed = 0
  let appsCount = 0
  for (const appDoc of appsSnap.docs) {
    const appId = appDoc.id
    if (ONLY_APPS && !ONLY_APPS.includes(appId)) continue
    const usersCol = db.collection(`apps/${appId}/users`)
    const usersSnap = await usersCol.get()
    if (usersSnap.empty) continue
    appsCount++
    const toUpdate: Array<{
      ref: FirebaseFirestore.DocumentReference
      data: any
    }> = []
    for (const u of usersSnap.docs) {
      const data = u.data() as any
      const newName = stripEmail(data.display_name)
      if (newName) {
        toUpdate.push({
          ref: u.ref,
          data: {
            display_name: newName,
            updated_at: FieldValue.serverTimestamp(),
          },
        })
        fixed++
      }
    }
    if (!DRY_RUN && toUpdate.length) {
      const CHUNK = 400
      for (let i = 0; i < toUpdate.length; i += CHUNK) {
        const batch = db.batch()
        for (const u of toUpdate.slice(i, i + CHUNK))
          batch.update(u.ref, u.data)
        await batch.commit()
      }
    }
  }
  return { apps: appsCount, fixed }
}

async function run() {
  console.log(`\n=== Fix Display Names (strip emails) ===`)
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'REAL RUN'}`)
  if (ONLY_APPS) console.log(`Apps filter: ${ONLY_APPS.join(', ')}`)

  const core = await fixCoreUsers()
  console.log(`Core users: total=${core.total}, fixed=${core.fixed}`)

  const apps = await fixAppUsers()
  console.log(`App users: apps=${apps.apps}, fixed=${apps.fixed}`)

  console.log(`\n✅ Done.`)
}

run().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
