#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-26
// usage_note: read-only conformance and image-health audit of the complete canonical Misebox Ingredient root catalog.

import { deleteApp, initializeApp } from 'firebase-admin/app'
import { FieldPath, getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import process from 'node:process'
import { resolveFirebaseAdminCredential } from './_lib/firebase-admin-credentials.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const STORAGE_BUCKET = 'misebox-78f9c.appspot.com'
const COLLECTION_ID = 'ingredients'
const EXPECTED_SCHEMA_VERSION = 2
const HEAD_CONCURRENCY = 8
const HEAD_ATTEMPTS = 3
const HEAD_TIMEOUT_MS = 15_000

const CATEGORY_IDS = new Set([
  'produce',
  'meat-poultry',
  'seafood',
  'dairy-eggs',
  'bakery',
  'herbs-spices',
  'sauces-condiments',
  'pantry',
  'prepared',
  'other',
])
const KINDS = new Set([
  'base',
  'variety',
  'cut',
  'prepared',
  'composite',
  'group',
])
const STATUSES = new Set(['active', 'deprecated', 'merged'])
const REQUIRED_KEYS = new Set([
  'aliases',
  'category',
  'created',
  'image_url',
  'kind',
  'name',
  'schema_version',
  'slug',
  'status',
  'updated',
])
const OPTIONAL_KEYS = new Set([
  // Legacy redundant document id. Reader-supplied identity is canonical;
  // removal remains gated on a retained managed export/preimage.
  'id',
  'parent_ingredient_id',
  'replaced_by_ingredient_id',
])
const ALLOWED_KEYS = new Set([...REQUIRED_KEYS, ...OPTIONAL_KEYS])

const text = value => String(value ?? '').trim()
const fold = value => text(value).normalize('NFC').toLocaleLowerCase('en')
const isPlainObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}
const isTimestamp = value =>
  Boolean(value && typeof value === 'object' && typeof value.toMillis === 'function')
const isDocumentId = value => {
  const id = text(value)
  return Boolean(id && id !== '.' && id !== '..' && !id.includes('/'))
}
const isImageUrl = value => {
  const url = text(value)
  return Boolean(
    url &&
    url.length <= 2_000 &&
    (url.startsWith('/') || /^https?:\/\//i.test(url))
  )
}

function issue(issues, id, code, detail) {
  issues.push({ id, code, detail })
}

function exactObjectKeys(value, expected) {
  if (!isPlainObject(value)) return false
  const keys = Object.keys(value)
  return (
    keys.length === expected.size &&
    keys.every(key => expected.has(key))
  )
}

function validateStamp(issues, id, value, kind) {
  const expectedKeys = kind === 'created'
    ? new Set(['app_id', 'at', 'by'])
    : new Set(['at', 'by'])
  if (!exactObjectKeys(value, expectedKeys)) {
    const actualKeys = isPlainObject(value)
      ? Object.keys(value).sort().join(', ') || '(none)'
      : '(not an object)'
    issue(
      issues,
      id,
      `${kind}_shape`,
      `${kind} must contain exactly ${[...expectedKeys].join(', ')}; found ${actualKeys}.`
    )
    return
  }
  if (!isTimestamp(value.at))
    issue(issues, id, `${kind}_at`, `${kind}.at must be a Firestore timestamp.`)
  if (!text(value.by))
    issue(issues, id, `${kind}_by`, `${kind}.by is required.`)
  if (kind === 'created' && !text(value.app_id)) {
    issue(issues, id, 'created_app_id', 'created.app_id is required.')
  }
}

function validateAliases(issues, id, value, name) {
  if (!Array.isArray(value)) {
    issue(issues, id, 'aliases_shape', 'aliases must be an array.')
    return []
  }
  if (value.length > 20)
    issue(issues, id, 'aliases_limit', 'aliases may contain at most 20 values.')

  const normalized = value.map(candidate => text(candidate).normalize('NFC'))
  const folded = normalized.map(fold)
  if (normalized.some(alias => !alias || alias.length > 120)) {
    issue(
      issues,
      id,
      'aliases_value',
      'aliases must be non-empty strings of at most 120 characters.'
    )
  }
  if (new Set(folded).size !== folded.length) {
    issue(issues, id, 'aliases_unique', 'aliases must be case-insensitively unique.')
  }
  if (folded.includes(fold(name))) {
    issue(issues, id, 'aliases_name', 'aliases must not repeat the canonical name.')
  }
  return normalized.filter(Boolean)
}

function validateRoot(document) {
  const id = document.id
  const data = document.data() || {}
  const issues = []
  const keys = Object.keys(data)

  if (!isPlainObject(data))
    issue(issues, id, 'root_shape', 'root data must be a plain object.')
  for (const key of REQUIRED_KEYS) {
    if (!Object.hasOwn(data, key))
      issue(issues, id, 'missing_field', `missing required field: ${key}.`)
  }
  for (const key of keys) {
    if (!ALLOWED_KEYS.has(key))
      issue(issues, id, 'unsupported_field', `unsupported field: ${key}.`)
  }
  if (!isDocumentId(id))
    issue(issues, id, 'document_id', 'document id is invalid.')
  if (Object.hasOwn(data, 'id') && text(data.id) !== id)
    issue(issues, id, 'id_mismatch', `stored id ${text(data.id) || '(empty)'} does not match document id.`)
  if (data.schema_version !== EXPECTED_SCHEMA_VERSION) {
    issue(
      issues,
      id,
      'schema_version',
      `schema_version must be ${EXPECTED_SCHEMA_VERSION}.`
    )
  }

  const name = text(data.name).normalize('NFC')
  if (!name || name.length > 120)
    issue(issues, id, 'name', 'name must contain 1–120 characters.')
  if (text(data.slug) !== id)
    issue(issues, id, 'slug', 'slug must equal the canonical document id.')
  const aliases = validateAliases(issues, id, data.aliases, name)
  if (!CATEGORY_IDS.has(data.category))
    issue(issues, id, 'category', `unsupported category: ${text(data.category) || '(empty)'}.`)
  if (!KINDS.has(data.kind))
    issue(issues, id, 'kind', `unsupported kind: ${text(data.kind) || '(empty)'}.`)
  if (!STATUSES.has(data.status))
    issue(issues, id, 'status', `unsupported status: ${text(data.status) || '(empty)'}.`)

  const parentId = text(data.parent_ingredient_id)
  const replacementId = text(data.replaced_by_ingredient_id)
  if (parentId && !isDocumentId(parentId))
    issue(issues, id, 'parent_id', 'parent_ingredient_id is invalid.')
  if (parentId === id)
    issue(issues, id, 'parent_self', 'an Ingredient cannot be its own parent.')
  if (replacementId && !isDocumentId(replacementId))
    issue(issues, id, 'replacement_id', 'replaced_by_ingredient_id is invalid.')
  if (replacementId === id)
    issue(issues, id, 'replacement_self', 'an Ingredient cannot replace itself.')
  if (data.status === 'merged' && !replacementId) {
    issue(issues, id, 'merged_replacement', 'a merged Ingredient requires a replacement.')
  }
  if (data.status !== 'merged' && replacementId) {
    issue(
      issues,
      id,
      'replacement_status',
      'only a merged Ingredient may declare a replacement.'
    )
  }

  validateStamp(issues, id, data.created, 'created')
  validateStamp(issues, id, data.updated, 'updated')

  const imageUrl = text(data.image_url)
  if (imageUrl && !isImageUrl(imageUrl))
    issue(issues, id, 'image_url_format', 'image_url must be an HTTP URL or absolute app path.')

  return {
    id,
    name,
    aliases,
    category: text(data.category),
    kind: text(data.kind),
    status: text(data.status),
    parent_ingredient_id: parentId,
    replaced_by_ingredient_id: replacementId,
    image_url: imageUrl,
    issues,
  }
}

function validateRelationships(rows, issues) {
  const byId = new Map(rows.map(row => [row.id, row]))
  for (const row of rows) {
    if (row.parent_ingredient_id) {
      const parent = byId.get(row.parent_ingredient_id)
      if (!parent || parent.status !== 'active') {
        issue(
          issues,
          row.id,
          'parent_missing',
          `parent ${row.parent_ingredient_id} is missing or inactive.`
        )
      }
    }
    if (row.replaced_by_ingredient_id) {
      const replacement = byId.get(row.replaced_by_ingredient_id)
      if (!replacement || replacement.status !== 'active') {
        issue(
          issues,
          row.id,
          'replacement_missing',
          `replacement ${row.replaced_by_ingredient_id} is missing or inactive.`
        )
      }
    }

    const visited = new Set([row.id])
    let parentId = row.parent_ingredient_id
    for (let depth = 0; parentId; depth += 1) {
      if (depth >= 50 || visited.has(parentId)) {
        issue(issues, row.id, 'parent_cycle', 'parent relationship contains a cycle.')
        break
      }
      visited.add(parentId)
      parentId = byId.get(parentId)?.parent_ingredient_id || ''
    }
  }

  const identityOwners = new Map()
  for (const row of rows.filter(candidate => candidate.status === 'active')) {
    for (const term of [row.name, ...row.aliases].map(fold).filter(Boolean)) {
      const owners = identityOwners.get(term) || []
      owners.push(row.id)
      identityOwners.set(term, owners)
    }
  }
  for (const [term, owners] of identityOwners) {
    if (new Set(owners).size <= 1) continue
    for (const id of new Set(owners)) {
      issue(
        issues,
        id,
        'identity_collision',
        `active canonical name/alias "${term}" is shared by ${[...new Set(owners)].join(', ')}.`
      )
    }
  }
}

async function headImage(url) {
  let last = { ok: false, status: 0, content_type: '', content_length: 0 }
  for (let attempt = 1; attempt <= HEAD_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
      })
      last = {
        ok: response.ok,
        status: response.status,
        content_type: text(response.headers.get('content-type')),
        content_length: Number(response.headers.get('content-length') || 0),
      }
      if (response.ok) return last
    }
    catch (error) {
      last = {
        ok: false,
        status: 0,
        content_type: '',
        content_length: 0,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }
  return last
}

async function mapConcurrent(items, limit, mapper) {
  const results = new Array(items.length)
  let cursor = 0
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const index = cursor
        cursor += 1
        results[index] = await mapper(items[index], index)
      }
    }
  )
  await Promise.all(workers)
  return results
}

const credential = await resolveFirebaseAdminCredential({
  scope: 'misebox',
  projectId: PROJECT_ID,
})
const app = initializeApp(
  {
    credential: credential.credential,
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
  },
  `audit-misebox-ingredient-catalog-${process.pid}`
)

try {
  const db = getFirestore(app, DATABASE_ID)
  const bucket = getStorage(app).bucket(STORAGE_BUCKET)
  const snapshot = await db
    .collection(COLLECTION_ID)
    .orderBy(FieldPath.documentId())
    .get()
  const rows = snapshot.docs.map(validateRoot)
  const modelIssues = rows.flatMap(row => row.issues)
  validateRelationships(rows, modelIssues)

  const activeRows = rows.filter(row => row.status === 'active')
  const imageResults = await mapConcurrent(
    activeRows,
    HEAD_CONCURRENCY,
    async (row) => {
      const stableObject = `${COLLECTION_ID}/${row.id}/image_url`
      const [stableObjectExists, url] = await Promise.all([
        bucket.file(stableObject).exists().then(([exists]) => exists),
        row.image_url
          ? headImage(row.image_url)
          : Promise.resolve({
              ok: false,
              status: 0,
              content_type: '',
              content_length: 0,
            }),
      ])
      return {
        id: row.id,
        image_url: row.image_url,
        stable_object: stableObject,
        stable_object_exists: stableObjectExists,
        url,
      }
    }
  )
  const missingImageIds = imageResults
    .filter(result => !result.image_url)
    .map(result => result.id)
  const brokenImageIds = imageResults
    .filter(result => result.image_url && !result.url.ok)
    .map(result => result.id)
  const nonImageContentIds = imageResults
    .filter(result =>
      result.url.ok &&
      !result.url.content_type.toLocaleLowerCase().startsWith('image/')
    )
    .map(result => result.id)
  const missingStableObjectIds = imageResults
    .filter(result => !result.stable_object_exists)
    .map(result => result.id)
  const categoryCounts = Object.fromEntries(
    [...CATEGORY_IDS].map(category => [
      category,
      activeRows.filter(row => row.category === category).length,
    ])
  )
  const kindCounts = Object.fromEntries(
    [...KINDS].map(kind => [
      kind,
      activeRows.filter(row => row.kind === kind).length,
    ])
  )
  const statusCounts = Object.fromEntries(
    [...STATUSES].map(status => [
      status,
      rows.filter(row => row.status === status).length,
    ])
  )

  const report = {
    format: 'fireux-misebox-ingredient-catalog-audit/1',
    read_only: true,
    target: {
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      storage_bucket: STORAGE_BUCKET,
      collection: COLLECTION_ID,
    },
    authority: {
      model:
        'packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient.model.ts',
      scope:
        'complete canonical root catalog; independent of every Kitchen, Supplier, Demo world, menu, and use',
    },
    credential_source: credential.source,
    counts: {
      roots: rows.length,
      active_roots: activeRows.length,
      model_conformance_issues: modelIssues.length,
      active_image_urls: imageResults.filter(result => Boolean(result.image_url)).length,
      verified_image_urls: imageResults.filter(result => result.url.ok).length,
      missing_image_urls: missingImageIds.length,
      broken_image_urls: brokenImageIds.length,
      non_image_content_urls: nonImageContentIds.length,
      stable_storage_objects: imageResults.filter(
        result => result.stable_object_exists
      ).length,
      missing_stable_storage_objects: missingStableObjectIds.length,
    },
    status_counts: statusCounts,
    category_counts: categoryCounts,
    kind_counts: kindCounts,
    model_issues: modelIssues,
    missing_image_ids: missingImageIds,
    broken_image_ids: brokenImageIds,
    non_image_content_ids: nonImageContentIds,
    missing_stable_object_ids: missingStableObjectIds,
    image_failures: imageResults.filter(
      result =>
        !result.image_url ||
        !result.url.ok ||
        (
          result.url.ok &&
          !result.url.content_type.toLocaleLowerCase().startsWith('image/')
        )
    ),
  }
  console.log(JSON.stringify(report, null, 2))

  if (
    modelIssues.length ||
    missingImageIds.length ||
    brokenImageIds.length ||
    nonImageContentIds.length
  ) {
    process.exitCode = 1
  }
}
finally {
  await deleteApp(app)
}
