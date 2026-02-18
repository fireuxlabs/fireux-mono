#!/usr/bin/env node
/*
  Backfill Place.slug for places missing slug.

  Rule:
    1) base = slugify(name + short_address)
    2) if base unused -> use base
    3) if used -> use `${base}-${placeId.slice(-5).toLowerCase()}`

  Usage:
    pnpm -s tsx scripts/migrate-place-slugs.ts --project <projectId> --commit [--pageSize 250]

  Auth (one required):
    - FIREBASE_SERVICE_ACCOUNT (JSON string)
    - GOOGLE_APPLICATION_CREDENTIALS (path to JSON)
    - Or Google ADC (gcloud): application-default login
*/

import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { FieldPath, FieldValue, getFirestore } from 'firebase-admin/firestore'
import { readFile } from 'node:fs/promises'

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {}
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg) continue
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) {
        out[key] = true
      } else {
        out[key] = next
        i += 1
      }
    }
  }
  return out
}

function toSlug(name: string, shortAddress?: string) {
  const raw = [name, shortAddress].filter(Boolean).join(' ')
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/g, '')
    .replace(/-+$/g, '')
}

function withSuffix(baseSlug: string, placeId: string) {
  const suffix = placeId.slice(-5).toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${baseSlug}-${suffix || placeId.slice(0, 5).toLowerCase().replace(/[^a-z0-9]/g, '')}`
}

const args = parseArgs(process.argv.slice(2))
const projectId =
  (typeof args.project === 'string' && args.project) ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.GCLOUD_PROJECT ||
  ''
const commit = Boolean(args.commit)
const pageSize = Math.min(Number(args.pageSize || 250), 500)

if (!projectId) {
  console.error('Missing --project (or FIREBASE_PROJECT_ID / GCLOUD_PROJECT).')
  process.exit(1)
}

async function resolveCredential() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  }
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  if (saPath) {
    const raw = await readFile(saPath, 'utf8')
    return cert(JSON.parse(raw))
  }
  return applicationDefault()
}

if (!getApps().length) {
  initializeApp({
    credential: await resolveCredential(),
    projectId,
  })
}

const db = getFirestore()

let processed = 0
let updated = 0
let skipped = 0
let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | null = null

const usedSlugs = new Set<string>()

// Prime slug set with existing non-empty slugs.
let seedLast: FirebaseFirestore.QueryDocumentSnapshot | null = null
while (true) {
  let q = db.collection('places').orderBy(FieldPath.documentId()).limit(pageSize)
  if (seedLast) q = q.startAfter(seedLast)
  const snap = await q.get()
  if (snap.empty) break
  for (const docSnap of snap.docs) {
    seedLast = docSnap
    const data = docSnap.data() || {}
    const slug = typeof data.slug === 'string' ? data.slug.trim().toLowerCase() : ''
    if (slug) usedSlugs.add(slug)
  }
}

while (true) {
  let q = db.collection('places').orderBy(FieldPath.documentId()).limit(pageSize)
  if (lastDoc) q = q.startAfter(lastDoc)

  const snap = await q.get()
  if (snap.empty) break

  let batch = db.batch()
  let ops = 0

  for (const docSnap of snap.docs) {
    processed += 1
    lastDoc = docSnap

    const data = docSnap.data() || {}
    const existing = typeof data.slug === 'string' ? data.slug.trim() : ''
    if (existing) {
      skipped += 1
      continue
    }

    const id = String(data.id || docSnap.id).trim()
    const name = typeof data.name === 'string' ? data.name.trim() : ''
    const shortAddress = typeof data.short_address === 'string' ? data.short_address.trim() : ''

    const base = toSlug(name, shortAddress)
    if (!base) {
      skipped += 1
      continue
    }

    let next = base
    if (usedSlugs.has(next)) {
      next = withSuffix(base, id || docSnap.id)
      let n = 2
      while (usedSlugs.has(next)) {
        next = `${withSuffix(base, id || docSnap.id)}-${n}`
        n += 1
      }
    }

    if (!commit) {
      console.log('[dry-run]', docSnap.id, 'set slug =', next)
      usedSlugs.add(next)
      skipped += 1
      continue
    }

    batch.update(docSnap.ref, {
      slug: next,
      updated_at: FieldValue.serverTimestamp(),
    })
    usedSlugs.add(next)
    ops += 1
    updated += 1

    if (ops >= 450) {
      await batch.commit()
      batch = db.batch()
      ops = 0
    }
  }

  if (ops > 0) {
    await batch.commit()
  }
}

console.log('\nSummary')
console.log('  processed:', processed)
console.log('  updated:', updated)
console.log('  skipped:', skipped)
