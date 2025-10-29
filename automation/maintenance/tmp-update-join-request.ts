#!/usr/bin/env tsx

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cert, deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')

async function main() {
  const serviceAccountPath = path.join(
    repoRoot,
    'packages',
    'tenants',
    'fireux-misebox',
    'config',
    'service-account.json'
  )

  const credential = cert(
    JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'))
  )

  const app = initializeApp(
    { credential, projectId: 'misebox-78f9c' },
    `tmp-update-join-request-${Date.now()}`
  )

  try {
    const db = getFirestore(app)
    await db
      .collection('apps')
      .doc('niederhorn')
      .set({ join_requests: ['rEssOnUA8wVHdNKE2JETqWAdwdm1'] }, { merge: true })

    console.log('join_requests updated for apps/niederhorn')
  } finally {
    await deleteApp(app).catch(() => undefined)
  }
}

await main()
