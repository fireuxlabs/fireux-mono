#!/usr/bin/env node
/*
  Normalize Professional experience month casing to 3-letter format (Jan/Feb/Mar).

  Auth (one required):
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - Or Google ADC (gcloud): application-default login

  Required env:
    - FIREBASE_PROJECT_ID (or GCLOUD_PROJECT)
*/

import { applicationDefault, cert, initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT
if (!projectId) {
  console.error('Missing FIREBASE_PROJECT_ID (or GCLOUD_PROJECT).')
  process.exit(1)
}

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const json = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    return cert(json)
  }

  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }

  return applicationDefault()
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_ALIASES = new Map([
  ['jan', 'Jan'], ['january', 'Jan'],
  ['feb', 'Feb'], ['february', 'Feb'],
  ['mar', 'Mar'], ['march', 'Mar'],
  ['apr', 'Apr'], ['april', 'Apr'],
  ['may', 'May'],
  ['jun', 'Jun'], ['june', 'Jun'],
  ['jul', 'Jul'], ['july', 'Jul'],
  ['aug', 'Aug'], ['august', 'Aug'],
  ['sep', 'Sep'], ['sept', 'Sep'], ['september', 'Sep'],
  ['oct', 'Oct'], ['october', 'Oct'],
  ['nov', 'Nov'], ['november', 'Nov'],
  ['dec', 'Dec'], ['december', 'Dec'],
])

function toShortMonth(value) {
  if (value == null) return ''
  if (typeof value === 'number' && Number.isFinite(value)) {
    const idx = Math.floor(value) - 1
    return SHORT_MONTHS[idx] || ''
  }

  const raw = String(value).trim()
  if (!raw) return ''

  const numeric = Number(raw)
  if (Number.isFinite(numeric)) {
    const idx = Math.floor(numeric) - 1
    return SHORT_MONTHS[idx] || ''
  }

  const key = raw.toLowerCase()
  return MONTH_ALIASES.get(key) || ''
}

function normalizeExperience(items = []) {
  let changed = false
  const normalized = items.map((item) => {
    const from = toShortMonth(item?.from_month)
    const to = toShortMonth(item?.to_month)

    const next = { ...item }
    if (from && from !== item?.from_month) {
      next.from_month = from
      changed = true
    }
    if (to && to !== item?.to_month) {
      next.to_month = to
      changed = true
    }
    return next
  })
  return { normalized, changed }
}

async function main() {
  initializeApp({ credential: await resolveCredential(), projectId })
  const db = getFirestore()

  let lastDoc = null
  let updated = 0
  let scanned = 0

  while (true) {
    let query = db.collection('professionals').orderBy('id').limit(250)
    if (lastDoc) query = query.startAfter(lastDoc)

    const snapshot = await query.get()
    if (snapshot.empty) break

    for (const docSnap of snapshot.docs) {
      scanned += 1
      const data = docSnap.data() || {}
      const { normalized: relevant, changed: relChanged } = normalizeExperience(
        data.relevant_experience || []
      )
      const { normalized: other, changed: othChanged } = normalizeExperience(
        data.other_experience || []
      )

      if (relChanged || othChanged) {
        await docSnap.ref.update({
          relevant_experience: relevant,
          other_experience: other,
          updated_at: FieldValue.serverTimestamp(),
        })
        updated += 1
      }
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1]
  }

  console.log(`[ok] scanned ${scanned} professionals, updated ${updated}`)
}

main().catch((error) => {
  console.error('[error]', error)
  process.exit(1)
})
