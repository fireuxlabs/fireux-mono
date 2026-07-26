#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-26
// usage_note: promote the reviewed Kitchen Ingredient catalogue into canonical Misebox roots and stable Storage media.

import { createHash, randomUUID } from 'node:crypto'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const STORAGE_BUCKET = 'misebox-78f9c.appspot.com'
const COLLECTION_ID = 'ingredients'
const APP_ID = 'misebox-app'
const EXPECTED_COUNT = 68
const SCHEMA_VERSION = 2
const OPERATION = 'promote-misebox-kitchen-ingredients'
const ACTOR = `system:${OPERATION}`
const TARGET_CONFIRMATION = `${PROJECT_ID}/${DATABASE_ID}`
const MANIFEST_FORMAT = 'fireux-misebox-kitchen-ingredient-promotion/1'
const PREIMAGE_FORMAT = 'fireux-misebox-kitchen-ingredient-promotion-preimage/1'
const SOURCE_FORMAT = 'fireux-misebox-kitchen-ingredient-promotion-source/1'
const PLAN_FORMAT = 'fireux-misebox-kitchen-ingredient-promotion-plan/1'
const MANIFEST_REPO_PATH =
  'scripts/data/misebox-kitchen-ingredient-promotion.json'
const MANIFEST_PATH = fileURLToPath(
  new URL('./data/misebox-kitchen-ingredient-promotion.json', import.meta.url)
)
const CATEGORIES = new Set([
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
const KINDS = new Set(['base', 'variety', 'cut', 'prepared', 'composite', 'group'])
const STATUSES = new Set(['active', 'deprecated', 'merged'])
const ROOT_KEYS = new Set([
  'aliases',
  'category',
  'created',
  'id',
  'image_url',
  'kind',
  'name',
  'parent_ingredient_id',
  'replaced_by_ingredient_id',
  'schema_version',
  'slug',
  'status',
  'updated',
])
const VALUE_OPTIONS = new Set([
  'backup',
  'confirm',
  'confirm-manifest',
  'confirm-plan',
  'confirm-source',
  'database',
  'project',
  'service-account',
])
const FLAG_OPTIONS = new Set(['apply', 'help'])

const text = (value) => String(value ?? '').trim()
const sha256 = (value) => createHash('sha256').update(value).digest('hex')
const isPlainObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertObject(value, label) {
  assert(isPlainObject(value), `${label} must be an object.`)
}

function assertExactKeys(value, allowed, required, label) {
  assertObject(value, label)
  const extra = Object.keys(value).filter((key) => !allowed.has(key))
  const missing = required.filter(
    (key) => !Object.prototype.hasOwnProperty.call(value, key)
  )
  assert(
    !extra.length && !missing.length,
    `${label} has invalid keys (extra: ${extra.join(', ') || 'none'}; missing: ${
      missing.join(', ') || 'none'
    }).`
  )
}

function assertIdentifier(value, label) {
  const result = text(value)
  assert(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result) && result.length <= 120,
    `${label} must be a lowercase kebab-case identifier.`
  )
  return result
}

function assertDisplayText(value, label, maximum = 120) {
  assert(
    typeof value === 'string' && value === value.trim() && value.length > 0 && value.length <= maximum,
    `${label} must be trimmed text up to ${maximum} chars.`
  )
  return value
}

function normaliseName(value) {
  return assertDisplayText(value, 'Ingredient name').replace(/\s+/g, ' ').toLocaleLowerCase('en')
}

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    assert(token?.startsWith('--'), `Unexpected positional argument: ${token || '(empty)'}`)
    const separator = token.indexOf('=')
    const key = token.slice(2, separator === -1 ? undefined : separator)
    const inlineValue = separator === -1 ? undefined : token.slice(separator + 1)
    assert(FLAG_OPTIONS.has(key) || VALUE_OPTIONS.has(key), `Unknown option: --${key || '(empty)'}`)
    assert(!Object.hasOwn(result, key), `Duplicate option: --${key}`)
    if (FLAG_OPTIONS.has(key)) {
      assert(inlineValue === undefined, `Option --${key} does not accept a value.`)
      result[key] = true
      continue
    }
    const value = inlineValue === undefined ? argv[index + 1] : inlineValue
    assert(value && !value.startsWith('--'), `Option --${key} requires a value.`)
    result[key] = value
    if (inlineValue === undefined) index += 1
  }
  return result
}

function exactTarget(args, key, expected) {
  const value = text(args[key])
  assert(value, `--${key} ${expected} is required.`)
  assert(value === expected, `This promotion only supports --${key} ${expected}.`)
  return value
}

function backupPath(value) {
  const raw = text(value)
  const resolved = path.resolve(raw)
  assert(
    raw && resolved.startsWith('/private/tmp/') && path.extname(resolved) === '.json',
    '--backup /private/tmp/<new-file>.json is required.'
  )
  return resolved
}

function optionsFor(args) {
  const projectId = exactTarget(args, 'project', PROJECT_ID)
  const databaseId = exactTarget(args, 'database', DATABASE_ID)
  const apply = args.apply === true
  const applyOnly = ['backup', 'confirm', 'confirm-manifest', 'confirm-plan', 'confirm-source']
    .filter((key) => args[key] !== undefined)
  if (apply) {
    assert(text(args.confirm) === TARGET_CONFIRMATION, `Apply requires --confirm ${TARGET_CONFIRMATION}.`)
    for (const key of ['confirm-manifest', 'confirm-source', 'confirm-plan']) {
      assert(/^[a-f0-9]{64}$/.test(text(args[key])), `Apply requires --${key} <reviewed-sha256>.`)
    }
  } else {
    assert(!applyOnly.length, `Apply-only option(s) cannot be used in dry-run: ${applyOnly.map((key) => `--${key}`).join(', ')}.`)
  }
  return {
    apply,
    backupPath: apply ? backupPath(args.backup) : '',
    databaseId,
    projectId,
    serviceAccount: text(args['service-account']),
    confirmManifest: text(args['confirm-manifest']),
    confirmSource: text(args['confirm-source']),
    confirmPlan: text(args['confirm-plan']),
  }
}

function manifestEntry(raw, index) {
  const label = `Manifest entry ${index}`
  const allowed = new Set([
    'aliases', 'category', 'ingredient_id', 'kind', 'name',
    'parent_ingredient_id', 'source_asset_id', 'status',
  ])
  assertExactKeys(raw, allowed, ['aliases', 'category', 'ingredient_id', 'kind', 'name', 'source_asset_id', 'status'], label)
  const id = assertIdentifier(raw.ingredient_id, `${label}.ingredient_id`)
  const sourceAssetId = assertIdentifier(raw.source_asset_id, `${label}.source_asset_id`)
  const name = assertDisplayText(raw.name, `${label}.name`)
  assert(Array.isArray(raw.aliases) && raw.aliases.length <= 12, `${label}.aliases must be an array with at most 12 names.`)
  const aliases = raw.aliases.map((item, aliasIndex) => assertDisplayText(item, `${label}.aliases[${aliasIndex}]`))
  const names = [name, ...aliases].map(normaliseName)
  assert(new Set(names).size === names.length, `${label}.name and aliases must be unique.`)
  assert(
    aliases.join('\u0000') === [...aliases].sort((left, right) => left.localeCompare(right)).join('\u0000'),
    `${label}.aliases must be deterministically sorted.`
  )
  const category = text(raw.category)
  const kind = text(raw.kind)
  const status = text(raw.status)
  assert(CATEGORIES.has(category), `${label}.category is outside the Ingredient enum.`)
  assert(KINDS.has(kind), `${label}.kind is outside the Ingredient enum.`)
  assert(status === 'active', `${label}.status must be active.`)
  const parentIngredientId = raw.parent_ingredient_id
    ? assertIdentifier(raw.parent_ingredient_id, `${label}.parent_ingredient_id`)
    : ''
  assert(parentIngredientId !== id, `${label} cannot parent itself.`)
  return {
    id,
    source_asset_id: sourceAssetId,
    name,
    aliases,
    category,
    kind,
    status,
    ...(parentIngredientId ? { parent_ingredient_id: parentIngredientId } : {}),
  }
}

function validateManifest(raw) {
  assertExactKeys(raw, new Set(['asset_directory', 'entries', 'format', 'policy', 'target']), ['asset_directory', 'entries', 'format', 'policy', 'target'], 'Manifest')
  assert(raw.format === MANIFEST_FORMAT, 'Ingredient promotion manifest format is invalid.')
  assert(raw.policy === 'canonical roots only; create missing roots; preserve existing roots; never write Kitchen or Supplier usage', 'Ingredient promotion policy is invalid.')
  assertExactKeys(raw.target, new Set(['collection', 'database_id', 'project_id', 'storage_bucket']), ['collection', 'database_id', 'project_id', 'storage_bucket'], 'Manifest target')
  assert(raw.target.project_id === PROJECT_ID && raw.target.database_id === DATABASE_ID && raw.target.storage_bucket === STORAGE_BUCKET && raw.target.collection === COLLECTION_ID, 'Manifest is not bound to the fixed target.')
  assert(typeof raw.asset_directory === 'string' && raw.asset_directory && !path.isAbsolute(raw.asset_directory), 'Manifest asset_directory must be a repository-relative path.')
  assert(Array.isArray(raw.entries) && raw.entries.length === EXPECTED_COUNT, `Manifest must contain exactly ${EXPECTED_COUNT} rows.`)
  const entries = raw.entries.map(manifestEntry)
  const ids = entries.map((entry) => entry.id)
  const assetIds = entries.map((entry) => entry.source_asset_id)
  assert(new Set(ids).size === EXPECTED_COUNT, 'Manifest ingredient ids must be unique.')
  assert(new Set(assetIds).size === EXPECTED_COUNT, 'Manifest source asset ids must be unique.')
  assert(ids.join('\u0000') === [...ids].sort().join('\u0000'), 'Manifest rows must be sorted by ingredient_id.')
  return { ...raw, entries }
}

async function loadManifest() {
  const source = await readFile(MANIFEST_PATH, 'utf8')
  let raw
  try { raw = JSON.parse(source) } catch { throw new Error(`${MANIFEST_REPO_PATH} is not valid JSON.`) }
  return { manifest: validateManifest(raw), sha256: sha256(source) }
}

function assertTimestamp(value, label) {
  assert(value && Number.isSafeInteger(Number(value.seconds)) && Number.isInteger(Number(value.nanoseconds)), `${label} must be a Firestore timestamp.`)
}

function validateRoot(raw, id, label) {
  assertExactKeys(raw, ROOT_KEYS, ['aliases', 'category', 'created', 'id', 'image_url', 'kind', 'name', 'schema_version', 'slug', 'status', 'updated'], label)
  assert(raw.schema_version === SCHEMA_VERSION, `${label}.schema_version must be ${SCHEMA_VERSION}.`)
  assert(assertIdentifier(raw.id, `${label}.id`) === id && assertIdentifier(raw.slug, `${label}.slug`) === id, `${label} id and slug must match its path.`)
  const name = assertDisplayText(raw.name, `${label}.name`)
  assert(Array.isArray(raw.aliases) && raw.aliases.length <= 12, `${label}.aliases must be a bounded array.`)
  const aliases = raw.aliases.map((item, index) => assertDisplayText(item, `${label}.aliases[${index}]`))
  const labels = [name, ...aliases].map(normaliseName)
  assert(new Set(labels).size === labels.length, `${label}.name and aliases must be unique.`)
  assert(CATEGORIES.has(text(raw.category)), `${label}.category is invalid.`)
  assert(KINDS.has(text(raw.kind)), `${label}.kind is invalid.`)
  assert(STATUSES.has(text(raw.status)), `${label}.status is invalid.`)
  if (raw.parent_ingredient_id !== undefined) assertIdentifier(raw.parent_ingredient_id, `${label}.parent_ingredient_id`)
  if (raw.replaced_by_ingredient_id !== undefined) assertIdentifier(raw.replaced_by_ingredient_id, `${label}.replaced_by_ingredient_id`)
  assert(typeof raw.image_url === 'string' && raw.image_url === raw.image_url.trim(), `${label}.image_url must be trimmed text.`)
  assertObject(raw.created, `${label}.created`)
  assert(text(raw.created.app_id) === APP_ID, `${label}.created.app_id must be ${APP_ID}.`)
  assertTimestamp(raw.created.at, `${label}.created.at`)
  assertObject(raw.updated, `${label}.updated`)
  assert(typeof raw.updated.by === 'string' && text(raw.updated.by), `${label}.updated.by must be text.`)
  assertTimestamp(raw.updated.at, `${label}.updated.at`)
  return {
    id,
    name,
    aliases,
    category: raw.category,
    kind: raw.kind,
    status: raw.status,
    image_url: raw.image_url,
    ...(raw.parent_ingredient_id ? { parent_ingredient_id: raw.parent_ingredient_id } : {}),
  }
}

function normaliseForHash(value) {
  if (value instanceof Timestamp) return { __firestore_type: 'timestamp', seconds: value.seconds, nanoseconds: value.nanoseconds }
  if (value instanceof Date) return { __firestore_type: 'date', value: value.toISOString() }
  if (Buffer.isBuffer(value)) return { __firestore_type: 'bytes', base64: value.toString('base64') }
  if (Array.isArray(value)) return value.map(normaliseForHash)
  if (isPlainObject(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, normaliseForHash(value[key])]))
  if (value && typeof value === 'object') throw new Error(`Cannot hash ${value.constructor?.name || 'unknown'} evidence.`)
  return value
}
const canonicalSha256 = (value) => sha256(JSON.stringify(normaliseForHash(value)))
const valuesEqual = (left, right) => canonicalSha256(left) === canonicalSha256(right)

async function loadAssets(directory, entries) {
  const expected = new Set(entries.map((entry) => `${entry.source_asset_id}.jpg`))
  const files = (await readdir(directory)).filter((name) => name.endsWith('.jpg'))
  assert(files.length === EXPECTED_COUNT && files.every((name) => expected.has(name)) && expected.size === files.length, `Asset directory must contain exactly the ${EXPECTED_COUNT} reviewed .jpg files.`)
  return new Map(await Promise.all(entries.map(async (entry) => {
    const assetPath = path.join(directory, `${entry.source_asset_id}.jpg`)
    const info = await stat(assetPath)
    assert(info.isFile() && info.size > 0, `${assetPath} must be a non-empty regular file.`)
    const bytes = await readFile(assetPath)
    assert(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff, `${assetPath} is not a JPEG.`)
    return [entry.id, { path: assetPath, bytes: info.size, sha256: sha256(bytes) }]
  })))
}

async function loadRoots(db) {
  const snapshot = await db.collection(COLLECTION_ID).get()
  return snapshot.docs.map((document) => ({
    id: document.id,
    path: document.ref.path,
    ref: document.ref,
    createTime: document.createTime,
    updateTime: document.updateTime,
    data: document.data(),
  })).sort((left, right) => left.id.localeCompare(right.id))
}

function rootNameClaims(roots) {
  const claims = new Map()
  for (const root of roots) {
    const validated = validateRoot(root.data, root.id, root.path)
    if (validated.status !== 'active') continue
    for (const value of [validated.name, ...validated.aliases]) {
      const key = normaliseName(value)
      const prior = claims.get(key)
      assert(!prior || prior === root.id, `Active Ingredient name/alias conflict: "${value}" is claimed by ${prior} and ${root.id}.`)
      claims.set(key, root.id)
    }
  }
  return claims
}

function compareExistingRoot(root, entry) {
  const current = validateRoot(root.data, root.id, root.path)
  const fields = ['name', 'category', 'kind', 'status', 'parent_ingredient_id']
  for (const field of fields) {
    assert(text(current[field]) === text(entry[field]), `${root.path}.${field} differs from the reviewed manifest; existing canonical roots are never rewritten.`)
  }
  assert(valuesEqual(current.aliases, entry.aliases), `${root.path}.aliases differs from the reviewed manifest; existing canonical roots are never rewritten.`)
}

function assertParentGraph(entries, rootsById) {
  const nodes = new Map()
  for (const root of rootsById.values()) {
    const validated = validateRoot(root.data, root.id, root.path)
    nodes.set(root.id, validated.parent_ingredient_id || '')
  }
  for (const entry of entries) nodes.set(entry.id, entry.parent_ingredient_id || '')
  for (const [id, parent] of nodes) {
    if (parent) assert(nodes.has(parent), `Ingredient ${id} references missing parent ${parent}.`)
    const seen = new Set([id])
    let cursor = parent
    while (cursor) {
      assert(!seen.has(cursor), `Ingredient parent cycle reaches ${cursor}.`)
      seen.add(cursor)
      cursor = nodes.get(cursor) || ''
    }
  }
}

function firebaseDownloadUrl(objectName, metadata) {
  const tokens = text(metadata?.metadata?.firebaseStorageDownloadTokens).split(',').map(text).filter(Boolean)
  assert(tokens.length, `${objectName} lacks firebaseStorageDownloadTokens; existing Storage objects are never modified.`)
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(objectName)}?alt=media&token=${encodeURIComponent(tokens[0])}`
}

async function readStorage(bucket, entry) {
  const objectName = `ingredients/${entry.id}/image_url`
  const file = bucket.file(objectName)
  const [exists] = await file.exists()
  if (!exists) return { object_name: objectName, exists: false, download_url: '' }
  const [metadata] = await file.getMetadata()
  const downloadUrl = firebaseDownloadUrl(objectName, metadata)
  return {
    object_name: objectName,
    exists: true,
    generation: text(metadata.generation),
    metageneration: text(metadata.metageneration),
    size: Number(metadata.size || 0),
    md5_hash: text(metadata.md5Hash),
    content_type: text(metadata.contentType),
    download_url: downloadUrl,
  }
}

async function readStorageState(bucket, entries) {
  return new Map(await Promise.all(entries.map(async (entry) => [entry.id, await readStorage(bucket, entry)])))
}

function sourceHash(roots, assets, storage) {
  return canonicalSha256({
    format: SOURCE_FORMAT,
    target: { project_id: PROJECT_ID, database_id: DATABASE_ID, storage_bucket: STORAGE_BUCKET, collection: COLLECTION_ID },
    roots: roots.map((root) => ({ path: root.path, create_time: root.createTime, update_time: root.updateTime, data: root.data })),
    assets: [...assets.entries()].sort(([left], [right]) => left.localeCompare(right)).map(([id, asset]) => ({ id, bytes: asset.bytes, sha256: asset.sha256 })),
    storage: [...storage.entries()].sort(([left], [right]) => left.localeCompare(right)),
  })
}

function buildPlan(manifest, roots, assets, storage, manifestSha256, sourceSha256) {
  const rootsById = new Map(roots.map((root) => [root.id, root]))
  const activeClaims = rootNameClaims(roots)
  for (const entry of manifest.entries) {
    const current = rootsById.get(entry.id)
    if (current) compareExistingRoot(current, entry)
    for (const claim of [entry.name, ...entry.aliases]) {
      const key = normaliseName(claim)
      const owner = activeClaims.get(key)
      assert(!owner || owner === entry.id, `Active Ingredient name/alias conflict: "${claim}" is claimed by ${owner} and reviewed ${entry.id}.`)
      activeClaims.set(key, entry.id)
    }
  }
  assertParentGraph(manifest.entries, rootsById)
  const rows = manifest.entries.map((entry) => {
    const root = rootsById.get(entry.id)
    const rootImageUrl = text(root?.data?.image_url)
    const object = storage.get(entry.id)
    const needsImage = !rootImageUrl
    const imageAction = !needsImage
      ? 'preserve-existing-image-url'
      : object.exists
        ? 'use-existing-stable-object'
        : 'upload-new-stable-object'
    return {
      id: entry.id,
      root_action: root ? 'preserve-existing-root' : 'create-root',
      image_action: imageAction,
      final_image_url: rootImageUrl || object.download_url || '',
      stable_object: object.object_name,
      asset_sha256: assets.get(entry.id).sha256,
    }
  })
  const incomplete = rows.filter((row) => !row.final_image_url && row.image_action !== 'upload-new-stable-object')
  assert(!incomplete.length, `No final image URL can be established for: ${incomplete.map((row) => row.id).join(', ')}.`)
  const payload = {
    format: PLAN_FORMAT,
    target: { project_id: PROJECT_ID, database_id: DATABASE_ID, storage_bucket: STORAGE_BUCKET, collection: COLLECTION_ID },
    manifest_sha256: manifestSha256,
    source_sha256: sourceSha256,
    rows,
    operations: {
      root_creates: rows.filter((row) => row.root_action === 'create-root').length,
      root_updates: rows.filter((row) => row.root_action === 'preserve-existing-root' && row.image_action !== 'preserve-existing-image-url').length,
      storage_uploads: rows.filter((row) => row.image_action === 'upload-new-stable-object').length,
      kitchen_or_supplier_writes: 0,
      storage_overwrites: 0,
    },
  }
  return { ...payload, sha256: canonicalSha256(payload) }
}

function rootTarget(entry, imageUrl, timestamp) {
  return {
    schema_version: SCHEMA_VERSION,
    id: entry.id,
    slug: entry.id,
    name: entry.name,
    aliases: [...entry.aliases],
    category: entry.category,
    kind: entry.kind,
    ...(entry.parent_ingredient_id ? { parent_ingredient_id: entry.parent_ingredient_id } : {}),
    status: 'active',
    image_url: imageUrl,
    created: { app_id: APP_ID, by: ACTOR, at: timestamp },
    updated: { by: ACTOR, at: timestamp },
  }
}

async function writePreimage({ backup, manifestSha256, sourceSha256, plan, roots, storage }) {
  return writeProtectedJsonArtifact({
    path: backup,
    payload: {
      format: PREIMAGE_FORMAT,
      captured_at: new Date().toISOString(),
      target: { project_id: PROJECT_ID, database_id: DATABASE_ID, storage_bucket: STORAGE_BUCKET, collection: COLLECTION_ID },
      manifest: { path: MANIFEST_REPO_PATH, sha256: manifestSha256 },
      source_sha256: sourceSha256,
      plan_sha256: plan.sha256,
      operation: plan.operations,
      roots: roots.map((root) => ({ path: root.path, create_time: normaliseForHash(root.createTime), update_time: normaliseForHash(root.updateTime), before: normaliseForHash(root.data) })),
      storage: [...storage.values()],
    },
  })
}

async function uploadStableObject(bucket, asset, entry) {
  const objectName = `ingredients/${entry.id}/image_url`
  const file = bucket.file(objectName)
  const token = randomUUID()
  await file.save(await readFile(asset.path), {
    resumable: false,
    preconditionOpts: { ifGenerationMatch: 0 },
    metadata: {
      contentType: 'image/jpeg',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  })
  const [metadata] = await file.getMetadata()
  const result = await readStorage(bucket, entry)
  assert(result.exists && result.generation === text(metadata.generation), `${objectName} upload was not durable.`)
  return result.download_url
}

async function verifyDownloadUrl(url, label) {
  let lastFailure = ''
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (
        response.ok &&
        text(response.headers.get('content-type')).startsWith('image/')
      ) {
        return
      }
      lastFailure = `status ${response.status}, content-type ${
        text(response.headers.get('content-type')) || '(missing)'
      }`
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error)
    }
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 500 * attempt))
    }
  }
  throw new Error(`${label} image verification failed: ${lastFailure}.`)
}

async function verifyPlannedExistingUrls(plan) {
  const rows = plan.rows.filter(
    row => row.image_action !== 'upload-new-stable-object'
  )
  for (let index = 0; index < rows.length; index += 8) {
    await Promise.all(
      rows
        .slice(index, index + 8)
        .map(row =>
          verifyDownloadUrl(row.final_image_url, `${row.id}.image_url`)
        )
    )
  }
}

function assertStoragePlanUnchanged(before, after, plan, finalUrls) {
  for (const row of plan.rows) {
    const current = after.get(row.id)
    if (row.image_action === 'upload-new-stable-object') {
      assert(
        current?.exists && current.download_url === finalUrls.get(row.id),
        `${row.stable_object} changed after this promotion uploaded it.`
      )
      continue
    }
    assert(
      valuesEqual(before.get(row.id), current),
      `${row.stable_object} changed after planning; review a fresh dry-run.`
    )
  }
}

function sameVersion(left, right) {
  return Boolean(left && right && (typeof left.isEqual === 'function' ? left.isEqual(right) : valuesEqual(left, right)))
}

async function assertSourceUnchanged(transaction, collection, expected) {
  const snapshot = await transaction.get(collection)
  const current = snapshot.docs.map((document) => ({ id: document.id, data: document.data(), updateTime: document.updateTime })).sort((left, right) => left.id.localeCompare(right.id))
  assert(current.length === expected.length && current.map((item) => item.id).join('\u0000') === expected.map((item) => item.id).join('\u0000'), 'Ingredient collection membership changed after planning; review a fresh dry-run.')
  for (let index = 0; index < expected.length; index += 1) {
    assert(sameVersion(current[index].updateTime, expected[index].updateTime) && valuesEqual(current[index].data, expected[index].data), `${expected[index].id} changed after planning; review a fresh dry-run.`)
  }
}

async function applyRoots(db, roots, manifest, plan, finalUrls) {
  const expected = roots.map((root) => ({ id: root.id, data: root.data, updateTime: root.updateTime }))
  const rootsById = new Map(roots.map((root) => [root.id, root]))
  const timestamp = Timestamp.now()
  await db.runTransaction(async (transaction) => {
    await assertSourceUnchanged(transaction, db.collection(COLLECTION_ID), expected)
    for (const entry of manifest.entries) {
      const current = rootsById.get(entry.id)
      const row = plan.rows.find((item) => item.id === entry.id)
      const imageUrl = finalUrls.get(entry.id)
      if (!current) {
        transaction.create(db.collection(COLLECTION_ID).doc(entry.id), rootTarget(entry, imageUrl, timestamp))
      } else if (row.image_action !== 'preserve-existing-image-url') {
        transaction.update(current.ref, { image_url: imageUrl, updated: { by: ACTOR, at: timestamp } })
      }
    }
  })
}

async function verifyOutcome(db, manifest, plan) {
  const snapshots = await db.getAll(...manifest.entries.map((entry) => db.collection(COLLECTION_ID).doc(entry.id)))
  assert(snapshots.length === EXPECTED_COUNT && snapshots.every((snapshot) => snapshot.exists), 'Post-apply verification did not find all 68 canonical roots.')
  const roots = snapshots.map((snapshot) => ({ id: snapshot.id, path: snapshot.ref.path, data: snapshot.data() }))
  const byId = new Map(roots.map((root) => [root.id, root]))
  for (const entry of manifest.entries) {
    const root = byId.get(entry.id)
    compareExistingRoot(root, entry)
    const imageUrl = text(root.data.image_url)
    assert(imageUrl, `${root.path} has no image_url after promotion.`)
    await verifyDownloadUrl(imageUrl, `${root.path}.image_url`)
  }
  return { active_roots: roots.filter((root) => root.data.status === 'active').length, verified_image_urls: roots.length, expected_operations: plan.operations }
}

function usage() {
  console.log(`
Promote exactly ${EXPECTED_COUNT} reviewed Kitchen Ingredients to canonical Misebox roots.

Dry-run (read-only):
  node scripts/promote-misebox-kitchen-ingredients.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID}

Apply (remote writes):
  node scripts/promote-misebox-kitchen-ingredients.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} --apply \\
    --confirm ${TARGET_CONFIRMATION} \\
    --confirm-manifest <reviewed-manifest-sha256> \\
    --confirm-source <reviewed-source-sha256> \\
    --confirm-plan <reviewed-plan-sha256> \\
    --backup /private/tmp/misebox-kitchen-ingredient-promotion-preimage.json

Apply is replay-safe: it only creates absent canonical roots, only fills an
empty root image_url, uses ingredients/<canonicalId>/image_url with a create
precondition, never overwrites Storage, and never writes Kitchen or Supplier
paths. It requires a fresh exact source and plan hash, then writes an exclusive
mode-0600 preimage before any mutation.

Credential sources:
${firebaseAdminCredentialHelp().map((line) => `  - ${line}`).join('\n')}
`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) return usage()
  const options = optionsFor(args)
  const { manifest, sha256: manifestSha256 } = await loadManifest()
  assert(!options.apply || options.confirmManifest === manifestSha256, `Reviewed manifest hash mismatch. Current hash: ${manifestSha256}`)
  const assetDirectory = path.resolve(process.cwd(), manifest.asset_directory)
  const assets = await loadAssets(assetDirectory, manifest.entries)
  let app = null
  try {
    const credential = await resolveFirebaseAdminCredential({ args, scope: 'misebox', projectId: PROJECT_ID })
    app = initializeApp({ credential: credential.credential, projectId: PROJECT_ID, storageBucket: STORAGE_BUCKET }, `${OPERATION}-${process.pid}-${Date.now()}`)
    const db = getFirestore(app, DATABASE_ID)
    const bucket = getStorage(app).bucket(STORAGE_BUCKET)
    const roots = await loadRoots(db)
    const storage = await readStorageState(bucket, manifest.entries)
    const currentSourceHash = sourceHash(roots, assets, storage)
    const plan = buildPlan(manifest, roots, assets, storage, manifestSha256, currentSourceHash)
    await verifyPlannedExistingUrls(plan)
    if (!options.apply) {
      console.log(JSON.stringify({
        mode: 'dry-run', read_only: true,
        target: { project_id: PROJECT_ID, database_id: DATABASE_ID, storage_bucket: STORAGE_BUCKET, collection: COLLECTION_ID },
        credential_source: credential.source,
        manifest: { path: MANIFEST_REPO_PATH, sha256: manifestSha256, row_count: EXPECTED_COUNT },
        source_sha256: currentSourceHash,
        plan: { sha256: plan.sha256, operations: plan.operations, rows: plan.rows },
        next_gate: `Review the manifest, source, and plan hashes. Apply additionally requires --apply, --confirm ${TARGET_CONFIRMATION}, those exact hashes, and a new /private/tmp preimage path.`,
      }, null, 2))
      return
    }
    assert(options.confirmSource === currentSourceHash, `Remote source hash mismatch. Review a fresh dry-run: ${currentSourceHash}`)
    assert(options.confirmPlan === plan.sha256, `Reviewed plan hash mismatch. Review a fresh dry-run: ${plan.sha256}`)
    const backup = await writePreimage({ backup: options.backupPath, manifestSha256, sourceSha256: currentSourceHash, plan, roots, storage })
    const finalUrls = new Map()
    for (const row of plan.rows) {
      const entry = manifest.entries.find((item) => item.id === row.id)
      const root = roots.find((item) => item.id === row.id)
      if (row.image_action === 'preserve-existing-image-url') finalUrls.set(row.id, text(root.data.image_url))
      else if (row.image_action === 'use-existing-stable-object') finalUrls.set(row.id, storage.get(row.id).download_url)
      else finalUrls.set(row.id, await uploadStableObject(bucket, assets.get(row.id), entry))
    }
    assertStoragePlanUnchanged(
      storage,
      await readStorageState(bucket, manifest.entries),
      plan,
      finalUrls
    )
    const finalUrlEntries = [...finalUrls.entries()]
    for (let index = 0; index < finalUrlEntries.length; index += 8) {
      await Promise.all(
        finalUrlEntries
          .slice(index, index + 8)
          .map(([id, url]) => verifyDownloadUrl(url, `${id}.image_url`))
      )
    }
    await applyRoots(db, roots, manifest, plan, finalUrls)
    const verified = await verifyOutcome(db, manifest, plan)
    console.log(JSON.stringify({
      mode: 'apply',
      target: { project_id: PROJECT_ID, database_id: DATABASE_ID, storage_bucket: STORAGE_BUCKET, collection: COLLECTION_ID },
      manifest_sha256: manifestSha256, source_sha256: currentSourceHash, plan_sha256: plan.sha256,
      credential_source: credential.source, backup, operations: plan.operations, post_apply: verified,
    }, null, 2))
  } finally {
    if (app) await deleteApp(app)
  }
}

main().catch((error) => {
  console.error(`[${OPERATION}] ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
