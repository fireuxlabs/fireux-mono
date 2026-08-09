#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: read-only audit of the Place -> same-id Company role -> Supplier.company_id relationship.

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || '').trim()
const databaseId = String(args.database || '').trim()
if (!ecosystem || !databaseId) {
  throw new Error('Usage: --ecosystem <id> --database <id>')
}

const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  {
    credential: auth.credential,
    projectId: target.projectId || auth.projectId,
  },
  `place-company-supplier-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const record = value =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : null
const exactKeys = (value, keys) => {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  return actual.length === expected.length &&
    actual.every((key, index) => key === expected[index])
}
const timestamp = value => {
  const candidate = record(value)
  if (!candidate) return false
  if (typeof candidate.toMillis === 'function') {
    try {
      return Number.isFinite(candidate.toMillis())
    } catch {
      return false
    }
  }
  return Number.isInteger(candidate.seconds) &&
    Number.isInteger(candidate.nanoseconds) &&
    candidate.nanoseconds >= 0 &&
    candidate.nanoseconds < 1_000_000_000
}
const stamp = value => {
  const candidate = record(value)
  return Boolean(candidate && exactKeys(candidate, ['at']) && timestamp(candidate.at))
}
const validCompany = value => {
  const candidate = record(value)
  return Boolean(
    candidate &&
      exactKeys(candidate, ['created', 'updated']) &&
      stamp(candidate.created) &&
      stamp(candidate.updated)
  )
}
const validPlace = value => {
  const candidate = record(value)
  return Boolean(
    candidate &&
      text(candidate.name) &&
      ['physical', 'non_physical'].includes(text(candidate.place_type))
  )
}

const [placeSnapshot, companySnapshot, supplierSnapshot] = await Promise.all([
  db.collection('places').get(),
  db.collection('companies').get(),
  db.collection('suppliers').get(),
])
const places = new Map(placeSnapshot.docs.map(doc => [doc.id, doc.data()]))
const companies = new Map(companySnapshot.docs.map(doc => [doc.id, doc.data()]))
const issues = []

for (const [id, company] of companies) {
  if (!validCompany(company)) {
    const value = record(company) || {}
    issues.push({
      kind: 'malformed_company_role',
      company_id: id,
      keys: Object.keys(value).sort(),
      created_keys: Object.keys(record(value.created) || {}).sort(),
      updated_keys: Object.keys(record(value.updated) || {}).sort(),
    })
  }
  if (!validPlace(places.get(id))) {
    issues.push({ kind: 'missing_or_invalid_company_place', company_id: id })
  }
}

for (const doc of supplierSnapshot.docs) {
  const companyId = text(doc.data().company_id)
  if (!companyId) {
    issues.push({ kind: 'missing_supplier_company_id', supplier_id: doc.id })
    continue
  }
  if (!validCompany(companies.get(companyId))) {
    issues.push({
      kind: 'missing_or_invalid_supplier_company',
      supplier_id: doc.id,
      company_id: companyId,
    })
  }
  if (!validPlace(places.get(companyId))) {
    issues.push({
      kind: 'missing_or_invalid_supplier_place',
      supplier_id: doc.id,
      company_id: companyId,
    })
  }
}

console.log(JSON.stringify({
  project_id: target.projectId || auth.projectId,
  database_id: databaseId,
  read_only: true,
  counts: {
    places: placeSnapshot.size,
    companies: companySnapshot.size,
    suppliers: supplierSnapshot.size,
    issues: issues.length,
  },
  issues,
}, null, 2))

if (issues.length) process.exitCode = 2
