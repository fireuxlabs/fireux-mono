/* scripts/2025-10-migrate-apps.ts
 * Normalize the Firestore `apps` collection to the canonical FireUX dataset.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import type { App } from '../../packages/core/fireux-core/src/runtime/models/core/app.model'

type TargetApp = Pick<
  App,
  | 'id'
  | 'app_name'
  | 'app_short_name'
  | 'role'
  | 'ecosystem'
  | 'admin_ids'
  | 'creator_id'
>

const TARGET_APPS: TargetApp[] = [
  {
    id: 'misebox-app',
    app_name: 'Misebox',
    app_short_name: 'Misebox',
    role: 'global',
    ecosystem: 'misebox',
    admin_ids: ['jMK33p5XlhYS8rBCEf8qUiogfMg2'],
    creator_id: 'jMK33p5XlhYS8rBCEf8qUiogfMg2',
  },
  {
    id: 'niederhorn',
    app_name: 'Niederhorn',
    app_short_name: 'Niederhorn',
    role: 'tenant',
    ecosystem: 'misebox',
    admin_ids: ['DcTtAdfyfkNBTDIzreoL0Oq6TYw2'],
    creator_id: 'DcTtAdfyfkNBTDIzreoL0Oq6TYw2',
  },
]

const rawArgs = process.argv.slice(2)
const argSet = new Set(rawArgs)

const apply = argSet.has('--apply')
const dryRun = !apply

function readOption(key: string): string | undefined {
  const prefix = `${key}=`
  const found = rawArgs.find((arg) => arg.startsWith(prefix))
  return found ? found.slice(prefix.length) : undefined
}

const serviceAccountFromArg = readOption('--service-account')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const defaultServiceAccountPath = resolve(
  __dirname,
  '../packages/ecosystem/fireux-misebox/config/service-account.json'
)

function initFirestore() {
  if (getApps().length === 0) {
    const envJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    const envFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE
    if (envJson) {
      initializeApp({ credential: cert(JSON.parse(envJson)) })
    } else if (envFile && existsSync(envFile)) {
      const svc = JSON.parse(readFileSync(envFile, 'utf8'))
      initializeApp({ credential: cert(svc) })
    } else if (serviceAccountFromArg && existsSync(serviceAccountFromArg)) {
      const svc = JSON.parse(readFileSync(serviceAccountFromArg, 'utf8'))
      initializeApp({ credential: cert(svc) })
    } else if (existsSync(defaultServiceAccountPath)) {
      const svc = JSON.parse(readFileSync(defaultServiceAccountPath, 'utf8'))
      initializeApp({ credential: cert(svc) })
    } else {
      initializeApp({ credential: applicationDefault() })
    }
  }

  return getFirestore()
}

function logPlan(
  toUpsert: { app: TargetApp; exists: boolean }[],
  toDelete: string[]
) {
  if (toUpsert.length > 0) {
    console.log(`\nApps to upsert (${toUpsert.length}):`)
    for (const { app, exists } of toUpsert) {
      const action = exists ? 'update' : 'create'
      console.log(
        `  - ${app.id} (${action}) :: fields => ${Object.keys(app).join(', ')}`
      )
    }
  } else {
    console.log('\nNo app upserts required.')
  }

  if (toDelete.length > 0) {
    console.log(`\nApps to delete (${toDelete.length}):`)
    for (const id of toDelete) {
      console.log(`  - ${id}`)
    }
  } else {
    console.log('\nNo app deletions required.')
  }
}

async function migrate() {
  console.log('🔥 FireUX apps migration')
  console.log('────────────────────────')
  console.log(
    apply ? '⚠️  APPLY mode: writes will be committed.' : '🧪 Dry run.'
  )

  const db = initFirestore()
  const snapshot = await db.collection('apps').get()

  const existingIds = new Set(snapshot.docs.map((doc) => doc.id))
  const targetIds = new Set(TARGET_APPS.map((app) => app.id))

  const toUpsert = TARGET_APPS.map((app) => ({
    app,
    exists: existingIds.has(app.id),
  }))
  const toDelete = Array.from(existingIds).filter((id) => !targetIds.has(id))

  logPlan(toUpsert, toDelete)

  if (dryRun) {
    console.log('\nDry run complete. Re-run with --apply to write changes.')
    return
  }

  for (const id of toDelete) {
    await db.collection('apps').doc(id).delete()
    console.log(`🗑️  Deleted app ${id}`)
  }

  for (const { app } of toUpsert) {
    await db.collection('apps').doc(app.id).set(app, { merge: false })
    console.log(`✅ Upserted app ${app.id}`)
  }

  console.log('\nMigration complete.')
}

migrate().catch((error) => {
  console.error('\n❌ Migration failed:', error)
  process.exitCode = 1
})
