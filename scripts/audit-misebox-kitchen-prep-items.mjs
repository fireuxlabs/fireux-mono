#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: read-only audit of canonical Prep Items and legacy Kitchen `mise` documents in Misebox.

import { createHash } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || 'misebox').trim()
const databaseId = String(args.database || 'misebox').trim()
const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  { credential: auth.credential, projectId: target.projectId || auth.projectId },
  `kitchen-prep-items-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const stable = value => {
  if (Array.isArray(value)) return value.map(stable)
  if (!value || typeof value !== 'object') return value
  if (typeof value.toDate === 'function') return value.toDate().toISOString()
  return Object.fromEntries(
    Object.entries(value).sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, stable(entry)])
  )
}
const hash = value => createHash('sha256')
  .update(JSON.stringify(stable(value)))
  .digest('hex')
const increment = (map, value) => {
  const key = text(value) || '(empty)'
  map.set(key, (map.get(key) || 0) + 1)
}
const sortedCounts = map => Object.fromEntries(
  [...map.entries()].sort(([left], [right]) => left.localeCompare(right))
)

const [legacySnapshot, canonicalSnapshot, ingredientSnapshot] = await Promise.all([
  db.collectionGroup('mise').get(),
  db.collectionGroup('prep-items').get(),
  db.collection('ingredients').get(),
])
const legacy = []
const canonical = []
const keyFrequency = new Map()
const typeFrequency = new Map()
const kindFrequency = new Map()
const categoryFrequency = new Map()
const languageFrequency = new Map()
const issues = []
const ingredientIds = new Set(ingredientSnapshot.docs.map(document => document.id))
const canonicalKeys = new Set([
  'kitchen_id', 'name', 'slug', 'description', 'source_language',
  'names', 'descriptions', 'station', 'inputs', 'recipe_id', 'yield', 'method',
  'created', 'updated',
])

for (const document of legacySnapshot.docs) {
  const segments = document.ref.path.split('/')
  const data = document.data() || {}
  const scope = segments[0] === 'apps' && segments[2] === 'kitchens'
    ? 'app-kitchen'
    : segments[0] === 'kitchens'
      ? 'root-kitchen'
      : 'unknown'
  const appId = scope === 'app-kitchen' ? segments[1] : ''
  const kitchenId = scope === 'app-kitchen' ? segments[3] : segments[1] || ''
  legacy.push({
    id: document.id,
    path: document.ref.path,
    scope,
    app_id: appId,
    kitchen_id: kitchenId,
    data,
    hash: hash(data),
  })
  for (const key of Object.keys(data)) increment(keyFrequency, key)
  increment(typeFrequency, data.type)
  increment(kindFrequency, data.kind)
  increment(categoryFrequency, data.category)
  increment(languageFrequency, data.source_language)
  if (scope === 'unknown') issues.push({ kind: 'legacy_path_unknown', path: document.ref.path })
}

for (const document of canonicalSnapshot.docs) {
  const segments = document.ref.path.split('/')
  const data = document.data() || {}
  canonical.push({ id: document.id, path: document.ref.path, data })
  const context = { path: document.ref.path, prep_item_id: document.id }
  if (
    segments.length !== 6 || segments[0] !== 'apps' ||
    segments[2] !== 'kitchens' || segments[4] !== 'prep-items'
  ) {
    issues.push({ kind: 'prep_item_path_invalid', ...context })
    continue
  }
  const appId = segments[1]
  const kitchenId = segments[3]
  const scoped = { ...context, app_id: appId, kitchen_id: kitchenId }
  const unknownKeys = Object.keys(data).filter(key => !canonicalKeys.has(key))
  const missingKeys = [...canonicalKeys].filter(key => !(key in data))
  if (unknownKeys.length) {
    issues.push({ kind: 'prep_item_schema_pollution', ...scoped, keys: unknownKeys.sort() })
  }
  if (missingKeys.length) {
    issues.push({ kind: 'prep_item_fields_missing', ...scoped, keys: missingKeys.sort() })
  }
  if (text(data.kitchen_id) !== kitchenId) issues.push({ kind: 'prep_item_kitchen_mismatch', ...scoped })
  if (!text(data.name) || !text(data.slug) || !text(data.source_language)) {
    issues.push({ kind: 'prep_item_presentation_incomplete', ...scoped })
  }
  if (!Array.isArray(data.inputs) || data.inputs.length > 12) {
    issues.push({ kind: 'prep_item_inputs_invalid', ...scoped })
  } else {
    for (const input of data.inputs) {
      const ingredientId = text(input?.ingredient_id)
      if (!ingredientId || !ingredientIds.has(ingredientId)) {
        issues.push({
          kind: 'prep_item_ingredient_not_found',
          ...scoped,
          ingredient_id: ingredientId,
        })
      }
    }
  }
  if (!Array.isArray(data.method) || data.method.length > 20) {
    issues.push({ kind: 'prep_item_method_invalid', ...scoped })
  }
  if (!data.yield || typeof data.yield !== 'object' || Array.isArray(data.yield)) {
    issues.push({ kind: 'prep_item_yield_invalid', ...scoped })
  }
  const station = text(data.station)
  if (station && !(await db.doc(`apps/${appId}/kitchens/${kitchenId}/stations/${station}`).get()).exists) {
    issues.push({ kind: 'prep_item_station_not_found', ...scoped, station })
  }
  const recipeId = text(data.recipe_id)
  if (recipeId && !(await db.doc(`apps/${appId}/kitchens/${kitchenId}/recipes/${recipeId}`).get()).exists) {
    issues.push({ kind: 'prep_item_recipe_not_found', ...scoped, recipe_id: recipeId })
  }
}

const roots = new Map(
  legacy.filter(entry => entry.scope === 'root-kitchen')
    .map(entry => [`${entry.kitchen_id}/${entry.id}`, entry])
)
const appCopies = legacy.filter(entry => entry.scope === 'app-kitchen')
const pairs = { exact: 0, missing_root: 0, mismatched: 0 }
for (const entry of appCopies) {
  const root = roots.get(`${entry.kitchen_id}/${entry.id}`)
  if (!root) {
    pairs.missing_root += 1
    issues.push({ kind: 'legacy_root_missing', path: entry.path })
  } else if (root.hash !== entry.hash) {
    pairs.mismatched += 1
    issues.push({ kind: 'legacy_pair_mismatch', root: root.path, app: entry.path })
  } else {
    pairs.exact += 1
  }
}

const samples = legacy.filter(entry => entry.scope === 'app-kitchen')
  .sort((left, right) => left.id.localeCompare(right.id))
  .slice(0, 3)
  .map(entry => ({ id: entry.id, path: entry.path, data: stable(entry.data) }))

console.log(JSON.stringify({
  project_id: target.projectId || auth.projectId,
  database_id: databaseId,
  read_only: true,
  counts: {
    legacy_documents: legacy.length,
    legacy_root_documents: legacy.filter(entry => entry.scope === 'root-kitchen').length,
    legacy_app_documents: appCopies.length,
    canonical_prep_items: canonical.length,
    issues: issues.length,
  },
  pair_alignment: pairs,
  field_frequency: sortedCounts(keyFrequency),
  value_frequency: {
    type: sortedCounts(typeFrequency),
    kind: sortedCounts(kindFrequency),
    category: sortedCounts(categoryFrequency),
    source_language: sortedCounts(languageFrequency),
  },
  samples,
  issues,
}, null, 2))

if (issues.length) process.exitCode = 2
