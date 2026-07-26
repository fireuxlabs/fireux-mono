#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-26
// usage_note: dry-run or explicitly complete the global canonical Misebox Ingredient catalog with model-conformant stamps and create-only media.

import { createHash, randomUUID } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
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
const EXPECTED_ROOT_COUNT = 141
const EXPECTED_IMAGE_COUNT = 51
const EXPECTED_CREATED_REPAIR_COUNT = 18
const SCHEMA_VERSION = 2
const OPERATION = 'complete-misebox-ingredient-catalog'
const ACTOR = `system:${OPERATION}`
const TARGET_CONFIRMATION = `${PROJECT_ID}/${DATABASE_ID}`
const MANIFEST_FORMAT = 'fireux-misebox-ingredient-catalog-completion/1'
const PREIMAGE_FORMAT =
  'fireux-misebox-ingredient-catalog-completion-preimage/1'
const SOURCE_FORMAT = 'fireux-misebox-ingredient-catalog-completion-source/1'
const PLAN_FORMAT = 'fireux-misebox-ingredient-catalog-completion-plan/1'
const MANIFEST_REPO_PATH =
  'scripts/data/misebox-ingredient-catalog-completion.json'
const MANIFEST_PATH = fileURLToPath(
  new URL('./data/misebox-ingredient-catalog-completion.json', import.meta.url)
)
const POLICY =
  'complete canonical root catalog; independent of every Kitchen, Supplier, Demo world, menu, and use; create missing image objects only; never overwrite media; never write operational records'
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
const KINDS = new Set([
  'base',
  'variety',
  'cut',
  'prepared',
  'composite',
  'group',
])
const STATUSES = new Set(['active', 'deprecated', 'merged'])
const REQUIRED_ROOT_KEYS = new Set([
  'aliases',
  'category',
  'created',
  'id',
  'image_url',
  'kind',
  'name',
  'schema_version',
  'slug',
  'status',
  'updated',
])
const ALLOWED_ROOT_KEYS = new Set([
  ...REQUIRED_ROOT_KEYS,
  'parent_ingredient_id',
  'replaced_by_ingredient_id',
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
const HEAD_CONCURRENCY = 8
const HEAD_ATTEMPTS = 3
const HEAD_TIMEOUT_MS = 15_000

const text = value => String(value ?? '').trim()
const fold = value => text(value).normalize('NFC').toLocaleLowerCase('en')
const sha256 = value => createHash('sha256').update(value).digest('hex')
const isPlainObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function assertExactKeys(value, allowed, required, label) {
  assert(isPlainObject(value), `${label} must be an object.`)
  const extra = Object.keys(value).filter(key => !allowed.has(key))
  const missing = required.filter(key => !Object.hasOwn(value, key))
  assert(
    !extra.length && !missing.length,
    `${label} has invalid keys (extra: ${extra.join(', ') || 'none'}; missing: ${
      missing.join(', ') || 'none'
    }).`
  )
}

function identifier(value, label) {
  const result = text(value)
  assert(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result) && result.length <= 120,
    `${label} must be a lowercase kebab-case identifier.`
  )
  return result
}

function displayText(value, label, maximum = 120) {
  assert(
    typeof value === 'string' &&
      value === value.trim() &&
      value === value.normalize('NFC') &&
      value.length > 0 &&
      value.length <= maximum,
    `${label} must be trimmed NFC text up to ${maximum} characters.`
  )
  return value
}

function parseArgs(argv) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    assert(
      token?.startsWith('--'),
      `Unexpected positional argument: ${token || '(empty)'}`
    )
    const separator = token.indexOf('=')
    const key = token.slice(2, separator === -1 ? undefined : separator)
    const inlineValue =
      separator === -1 ? undefined : token.slice(separator + 1)
    assert(
      FLAG_OPTIONS.has(key) || VALUE_OPTIONS.has(key),
      `Unknown option: --${key || '(empty)'}`
    )
    assert(!Object.hasOwn(result, key), `Duplicate option: --${key}`)
    if (FLAG_OPTIONS.has(key)) {
      assert(
        inlineValue === undefined,
        `Option --${key} does not accept a value.`
      )
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
  assert(
    value === expected,
    `This catalog completion only supports --${key} ${expected}.`
  )
  return value
}

function backupPath(value) {
  const raw = text(value)
  const resolved = path.resolve(raw)
  assert(
    raw &&
      resolved.startsWith('/private/tmp/') &&
      path.extname(resolved).toLocaleLowerCase() === '.json',
    '--backup /private/tmp/<new-file>.json is required.'
  )
  return resolved
}

function optionsFor(args) {
  const projectId = exactTarget(args, 'project', PROJECT_ID)
  const databaseId = exactTarget(args, 'database', DATABASE_ID)
  const apply = args.apply === true
  const applyOnly = [
    'backup',
    'confirm',
    'confirm-manifest',
    'confirm-plan',
    'confirm-source',
  ].filter(key => args[key] !== undefined)
  if (apply) {
    assert(
      text(args.confirm) === TARGET_CONFIRMATION,
      `Apply requires --confirm ${TARGET_CONFIRMATION}.`
    )
    for (const key of [
      'confirm-manifest',
      'confirm-source',
      'confirm-plan',
    ]) {
      assert(
        /^[a-f0-9]{64}$/.test(text(args[key])),
        `Apply requires --${key} <reviewed-sha256>.`
      )
    }
  }
  else {
    assert(
      !applyOnly.length,
      `Apply-only option(s) cannot be used in dry-run: ${applyOnly
        .map(key => `--${key}`)
        .join(', ')}.`
    )
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

function sortedUniqueIds(value, expectedCount, label) {
  assert(
    Array.isArray(value) && value.length === expectedCount,
    `${label} must contain exactly ${expectedCount} ids.`
  )
  const ids = value.map((item, index) =>
    identifier(item, `${label}[${index}]`)
  )
  assert(new Set(ids).size === ids.length, `${label} ids must be unique.`)
  assert(
    ids.join('\u0000') === [...ids].sort().join('\u0000'),
    `${label} must be deterministically sorted.`
  )
  return ids
}

function validateManifest(raw) {
  assertExactKeys(
    raw,
    new Set([
      'asset_directory',
      'created_by_repair_ids',
      'expected_root_count',
      'format',
      'image_ids',
      'legacy_created_by',
      'policy',
      'target',
    ]),
    [
      'asset_directory',
      'created_by_repair_ids',
      'expected_root_count',
      'format',
      'image_ids',
      'legacy_created_by',
      'policy',
      'target',
    ],
    'Manifest'
  )
  assert(raw.format === MANIFEST_FORMAT, 'Manifest format is invalid.')
  assert(raw.policy === POLICY, 'Manifest policy is invalid.')
  assert(
    raw.expected_root_count === EXPECTED_ROOT_COUNT,
    `Manifest expected_root_count must be ${EXPECTED_ROOT_COUNT}.`
  )
  assertExactKeys(
    raw.target,
    new Set(['collection', 'database_id', 'project_id', 'storage_bucket']),
    ['collection', 'database_id', 'project_id', 'storage_bucket'],
    'Manifest target'
  )
  assert(
    raw.target.project_id === PROJECT_ID &&
      raw.target.database_id === DATABASE_ID &&
      raw.target.storage_bucket === STORAGE_BUCKET &&
      raw.target.collection === COLLECTION_ID,
    'Manifest is not bound to the fixed target.'
  )
  assert(
    typeof raw.asset_directory === 'string' &&
      raw.asset_directory &&
      !path.isAbsolute(raw.asset_directory),
    'Manifest asset_directory must be a repository-relative path.'
  )
  const legacyCreatedBy = text(raw.legacy_created_by)
  assert(
    legacyCreatedBy.startsWith('system:') && legacyCreatedBy.length <= 120,
    'Manifest legacy_created_by must be explicit system provenance.'
  )
  return {
    ...raw,
    legacy_created_by: legacyCreatedBy,
    image_ids: sortedUniqueIds(
      raw.image_ids,
      EXPECTED_IMAGE_COUNT,
      'Manifest image_ids'
    ),
    created_by_repair_ids: sortedUniqueIds(
      raw.created_by_repair_ids,
      EXPECTED_CREATED_REPAIR_COUNT,
      'Manifest created_by_repair_ids'
    ),
  }
}

async function loadManifest() {
  const source = await readFile(MANIFEST_PATH, 'utf8')
  let raw
  try {
    raw = JSON.parse(source)
  }
  catch {
    throw new Error(`${MANIFEST_REPO_PATH} is not valid JSON.`)
  }
  return {
    manifest: validateManifest(raw),
    sha256: sha256(source),
  }
}

function assertTimestamp(value, label) {
  assert(
    value instanceof Timestamp ||
      (
        value &&
        Number.isSafeInteger(Number(value.seconds)) &&
        Number.isInteger(Number(value.nanoseconds))
      ),
    `${label} must be a Firestore timestamp.`
  )
}

function validateStamp(value, kind, label, repairAllowed) {
  const required =
    kind === 'created' ? ['app_id', 'at', 'by'] : ['at', 'by']
  const allowed = new Set(required)
  const missingByRepair =
    kind === 'created' &&
    repairAllowed &&
    isPlainObject(value) &&
    !Object.hasOwn(value, 'by')
  assertExactKeys(
    value,
    allowed,
    missingByRepair ? ['app_id', 'at'] : required,
    label
  )
  assertTimestamp(value.at, `${label}.at`)
  if (kind === 'created')
    displayText(value.app_id, `${label}.app_id`)
  if (!missingByRepair)
    displayText(value.by, `${label}.by`)
  return { missingByRepair }
}

function validateImageUrl(value, label, missingAllowed) {
  assert(
    typeof value === 'string' && value === value.trim() && value.length <= 2_000,
    `${label} must be a trimmed string up to 2,000 characters.`
  )
  if (!value) {
    assert(missingAllowed, `${label} is missing outside the reviewed image plan.`)
    return ''
  }
  assert(
    value.startsWith('/') || /^https?:\/\//i.test(value),
    `${label} must be an HTTP URL or absolute app path.`
  )
  return value
}

function validateRoot(
  root,
  manifest,
  { allowPendingRepairs = true } = {}
) {
  const { id, data } = root
  const label = root.path
  assertExactKeys(
    data,
    ALLOWED_ROOT_KEYS,
    [...REQUIRED_ROOT_KEYS],
    label
  )
  assert(data.schema_version === SCHEMA_VERSION, `${label}.schema_version must be 2.`)
  assert(identifier(data.id, `${label}.id`) === id, `${label}.id must match its path.`)
  assert(
    identifier(data.slug, `${label}.slug`) === id,
    `${label}.slug must match its path.`
  )
  const name = displayText(data.name, `${label}.name`)
  assert(
    Array.isArray(data.aliases) && data.aliases.length <= 20,
    `${label}.aliases must be an array with at most 20 values.`
  )
  const aliases = data.aliases.map((alias, index) =>
    displayText(alias, `${label}.aliases[${index}]`)
  )
  const foldedLabels = [name, ...aliases].map(fold)
  assert(
    new Set(foldedLabels).size === foldedLabels.length,
    `${label}.name and aliases must be case-insensitively unique.`
  )
  assert(CATEGORIES.has(data.category), `${label}.category is invalid.`)
  assert(KINDS.has(data.kind), `${label}.kind is invalid.`)
  assert(STATUSES.has(data.status), `${label}.status is invalid.`)
  const parentId = text(data.parent_ingredient_id)
  const replacementId = text(data.replaced_by_ingredient_id)
  if (parentId)
    assert(identifier(parentId, `${label}.parent_ingredient_id`) !== id, `${label} cannot parent itself.`)
  if (replacementId)
    assert(identifier(replacementId, `${label}.replaced_by_ingredient_id`) !== id, `${label} cannot replace itself.`)
  assert(
    data.status === 'merged' ? Boolean(replacementId) : !replacementId,
    `${label} replacement lifecycle is invalid.`
  )
  const missingImageAllowed = manifest.image_ids.includes(id)
  const imageUrl = validateImageUrl(
    data.image_url,
    `${label}.image_url`,
    missingImageAllowed
  )
  const created = validateStamp(
    data.created,
    'created',
    `${label}.created`,
    allowPendingRepairs && manifest.created_by_repair_ids.includes(id)
  )
  validateStamp(data.updated, 'updated', `${label}.updated`, false)

  return {
    id,
    name,
    aliases,
    category: data.category,
    kind: data.kind,
    status: data.status,
    parent_ingredient_id: parentId,
    replaced_by_ingredient_id: replacementId,
    image_url: imageUrl,
    needs_created_by_repair: created.missingByRepair,
  }
}

function validateCatalog(roots, manifest, { complete = false } = {}) {
  assert(
    roots.length === manifest.expected_root_count,
    `Expected ${manifest.expected_root_count} canonical roots; found ${roots.length}.`
  )
  const validated = roots.map(root =>
    validateRoot(root, manifest, { allowPendingRepairs: !complete })
  )
  const byId = new Map(validated.map(root => [root.id, root]))
  for (const id of [...manifest.image_ids, ...manifest.created_by_repair_ids]) {
    assert(byId.has(id), `Reviewed repair id ${id} is not a canonical root.`)
  }
  const claims = new Map()
  for (const root of validated) {
    if (complete)
      assert(root.image_url, `${root.id} is missing image_url after completion.`)
    if (root.parent_ingredient_id) {
      const parent = byId.get(root.parent_ingredient_id)
      assert(
        parent?.status === 'active',
        `${root.id} references missing or inactive parent ${root.parent_ingredient_id}.`
      )
    }
    if (root.replaced_by_ingredient_id) {
      const replacement = byId.get(root.replaced_by_ingredient_id)
      assert(
        replacement?.status === 'active',
        `${root.id} references missing or inactive replacement ${root.replaced_by_ingredient_id}.`
      )
    }
    const visited = new Set([root.id])
    let cursor = root.parent_ingredient_id
    while (cursor) {
      assert(!visited.has(cursor), `Ingredient parent cycle reaches ${cursor}.`)
      visited.add(cursor)
      cursor = byId.get(cursor)?.parent_ingredient_id || ''
    }
    if (root.status !== 'active') continue
    for (const value of [root.name, ...root.aliases]) {
      const key = fold(value)
      const prior = claims.get(key)
      assert(
        !prior || prior === root.id,
        `Active Ingredient name/alias "${value}" is claimed by ${prior} and ${root.id}.`
      )
      claims.set(key, root.id)
    }
  }
  return validated
}

function normaliseForHash(value) {
  if (value instanceof Timestamp) {
    return {
      __firestore_type: 'timestamp',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }
  if (value instanceof Date)
    return { __firestore_type: 'date', value: value.toISOString() }
  if (Buffer.isBuffer(value)) {
    return {
      __firestore_type: 'bytes',
      base64: value.toString('base64'),
    }
  }
  if (Array.isArray(value))
    return value.map(normaliseForHash)
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(key => [key, normaliseForHash(value[key])])
    )
  }
  if (value && typeof value === 'object') {
    throw new Error(
      `Cannot hash ${value.constructor?.name || 'unknown'} evidence.`
    )
  }
  return value
}

const canonicalSha256 = value =>
  sha256(JSON.stringify(normaliseForHash(value)))
const valuesEqual = (left, right) =>
  canonicalSha256(left) === canonicalSha256(right)

function jpegDimensions(bytes, label) {
  assert(
    bytes.length >= 4 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff,
    `${label} is not a JPEG.`
  )
  let offset = 2
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1
      continue
    }
    const marker = bytes[offset + 1]
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2
      continue
    }
    const length = bytes.readUInt16BE(offset + 2)
    assert(length >= 2, `${label} has an invalid JPEG segment.`)
    if (
      [
        0xc0,
        0xc1,
        0xc2,
        0xc3,
        0xc5,
        0xc6,
        0xc7,
        0xc9,
        0xca,
        0xcb,
        0xcd,
        0xce,
        0xcf,
      ].includes(marker)
    ) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      }
    }
    offset += length + 2
  }
  throw new Error(`${label} has no readable JPEG dimensions.`)
}

async function loadAssets(directory, ids) {
  return new Map(
    await Promise.all(
      ids.map(async (id) => {
        const assetPath = path.join(directory, `${id}.jpg`)
        const info = await stat(assetPath)
        assert(
          info.isFile() && info.size >= 20_000 && info.size <= 500_000,
          `${assetPath} must be a 20–500 KiB regular file.`
        )
        const bytes = await readFile(assetPath)
        const dimensions = jpegDimensions(bytes, assetPath)
        assert(
          dimensions.width === 512 && dimensions.height === 512,
          `${assetPath} must be exactly 512x512.`
        )
        return [
          id,
          {
            path: assetPath,
            bytes: info.size,
            sha256: sha256(bytes),
            width: dimensions.width,
            height: dimensions.height,
          },
        ]
      })
    )
  )
}

async function loadRoots(db) {
  const snapshot = await db.collection(COLLECTION_ID).get()
  return snapshot.docs
    .map(document => ({
      id: document.id,
      path: document.ref.path,
      ref: document.ref,
      createTime: document.createTime,
      updateTime: document.updateTime,
      data: document.data(),
    }))
    .sort((left, right) => left.id.localeCompare(right.id))
}

function firebaseDownloadUrl(objectName, metadata) {
  const tokens = text(metadata?.metadata?.firebaseStorageDownloadTokens)
    .split(',')
    .map(text)
    .filter(Boolean)
  assert(
    tokens.length,
    `${objectName} lacks firebaseStorageDownloadTokens; existing media is never modified.`
  )
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodeURIComponent(
    objectName
  )}?alt=media&token=${encodeURIComponent(tokens[0])}`
}

async function readStorage(bucket, id) {
  const objectName = `${COLLECTION_ID}/${id}/image_url`
  const file = bucket.file(objectName)
  const [exists] = await file.exists()
  if (!exists) {
    return {
      object_name: objectName,
      exists: false,
      download_url: '',
    }
  }
  const [metadata] = await file.getMetadata()
  return {
    object_name: objectName,
    exists: true,
    generation: text(metadata.generation),
    metageneration: text(metadata.metageneration),
    size: Number(metadata.size || 0),
    md5_hash: text(metadata.md5Hash),
    content_type: text(metadata.contentType),
    download_url: firebaseDownloadUrl(objectName, metadata),
  }
}

async function readStorageState(bucket, ids) {
  return new Map(
    await Promise.all(ids.map(async id => [id, await readStorage(bucket, id)]))
  )
}

function sourceHash(roots, assets, storage) {
  return canonicalSha256({
    format: SOURCE_FORMAT,
    target: {
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      storage_bucket: STORAGE_BUCKET,
      collection: COLLECTION_ID,
    },
    roots: roots.map(root => ({
      path: root.path,
      create_time: root.createTime,
      update_time: root.updateTime,
      data: root.data,
    })),
    assets: [...assets.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([id, asset]) => ({
        id,
        bytes: asset.bytes,
        sha256: asset.sha256,
        width: asset.width,
        height: asset.height,
      })),
    storage: [...storage.entries()].sort(([left], [right]) =>
      left.localeCompare(right)
    ),
  })
}

function buildPlan(
  manifest,
  roots,
  assets,
  storage,
  manifestSha256,
  sourceSha256
) {
  const validated = validateCatalog(roots, manifest)
  const byId = new Map(validated.map(root => [root.id, root]))
  const imageRows = manifest.image_ids.map((id) => {
    const root = byId.get(id)
    const object = storage.get(id)
    const imageAction = root.image_url
      ? 'preserve-existing-image-url'
      : object.exists
        ? 'use-existing-stable-object'
        : 'upload-new-stable-object'
    return {
      id,
      action: imageAction,
      current_image_url: root.image_url,
      final_image_url: root.image_url || object.download_url || '',
      stable_object: object.object_name,
      asset_sha256: assets.get(id).sha256,
    }
  })
  const createdByRows = manifest.created_by_repair_ids.map((id) => ({
    id,
    action: byId.get(id).needs_created_by_repair
      ? 'add-system-provenance'
      : 'preserve-conformant-created-stamp',
  }))
  const rootUpdateIds = [
    ...new Set([
      ...imageRows
        .filter(row => row.action !== 'preserve-existing-image-url')
        .map(row => row.id),
      ...createdByRows
        .filter(row => row.action === 'add-system-provenance')
        .map(row => row.id),
    ]),
  ].sort()
  const payload = {
    format: PLAN_FORMAT,
    target: {
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      storage_bucket: STORAGE_BUCKET,
      collection: COLLECTION_ID,
    },
    manifest_sha256: manifestSha256,
    source_sha256: sourceSha256,
    image_rows: imageRows,
    created_by_rows: createdByRows,
    root_update_ids: rootUpdateIds,
    operations: {
      root_creates: 0,
      root_updates: rootUpdateIds.length,
      root_deletes: 0,
      storage_uploads: imageRows.filter(
        row => row.action === 'upload-new-stable-object'
      ).length,
      storage_overwrites: 0,
      kitchen_or_supplier_writes: 0,
      operational_writes: 0,
    },
  }
  return { ...payload, sha256: canonicalSha256(payload) }
}

async function writePreimage({
  backup,
  manifestSha256,
  sourceSha256,
  plan,
  roots,
  storage,
}) {
  return writeProtectedJsonArtifact({
    path: backup,
    payload: {
      format: PREIMAGE_FORMAT,
      captured_at: new Date().toISOString(),
      target: {
        project_id: PROJECT_ID,
        database_id: DATABASE_ID,
        storage_bucket: STORAGE_BUCKET,
        collection: COLLECTION_ID,
      },
      authority:
        'complete canonical Ingredient root catalog; no Kitchen, Supplier, Demo, menu, or use-case scope',
      manifest: {
        path: MANIFEST_REPO_PATH,
        sha256: manifestSha256,
      },
      source_sha256: sourceSha256,
      plan_sha256: plan.sha256,
      operations: plan.operations,
      roots: roots.map(root => ({
        path: root.path,
        create_time: normaliseForHash(root.createTime),
        update_time: normaliseForHash(root.updateTime),
        before: normaliseForHash(root.data),
      })),
      storage: [...storage.values()],
    },
  })
}

async function uploadStableObject(bucket, asset, id) {
  const objectName = `${COLLECTION_ID}/${id}/image_url`
  const file = bucket.file(objectName)
  const token = randomUUID()
  await file.save(await readFile(asset.path), {
    resumable: false,
    preconditionOpts: { ifGenerationMatch: 0 },
    metadata: {
      cacheControl: 'public,max-age=31536000,immutable',
      contentType: 'image/jpeg',
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  })
  const result = await readStorage(bucket, id)
  assert(result.exists, `${objectName} upload was not durable.`)
  return result.download_url
}

async function verifyDownloadUrl(url, label) {
  let lastFailure = ''
  for (let attempt = 1; attempt <= HEAD_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(HEAD_TIMEOUT_MS),
      })
      const contentType = text(response.headers.get('content-type'))
      if (response.ok && contentType.toLocaleLowerCase().startsWith('image/'))
        return
      lastFailure = `status ${response.status}, content-type ${
        contentType || '(missing)'
      }`
    }
    catch (error) {
      lastFailure = error instanceof Error ? error.message : String(error)
    }
  }
  throw new Error(`${label} image verification failed: ${lastFailure}.`)
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

function sameVersion(left, right) {
  return Boolean(
    left &&
      right &&
      (
        typeof left.isEqual === 'function'
          ? left.isEqual(right)
          : valuesEqual(left, right)
      )
  )
}

async function assertRootsUnchanged(transaction, collection, expected) {
  const snapshot = await transaction.get(collection)
  const current = snapshot.docs
    .map(document => ({
      id: document.id,
      data: document.data(),
      updateTime: document.updateTime,
    }))
    .sort((left, right) => left.id.localeCompare(right.id))
  assert(
    current.length === expected.length &&
      current.map(item => item.id).join('\u0000') ===
        expected.map(item => item.id).join('\u0000'),
    'Ingredient collection membership changed after planning; review a fresh dry-run.'
  )
  for (let index = 0; index < expected.length; index += 1) {
    assert(
      sameVersion(current[index].updateTime, expected[index].updateTime) &&
        valuesEqual(current[index].data, expected[index].data),
      `${expected[index].id} changed after planning; review a fresh dry-run.`
    )
  }
}

function assertStorageUnchanged(before, after, plan, finalUrls) {
  for (const row of plan.image_rows) {
    const current = after.get(row.id)
    if (row.action === 'upload-new-stable-object') {
      assert(
        current?.exists && current.download_url === finalUrls.get(row.id),
        `${row.stable_object} changed after this completion uploaded it.`
      )
      continue
    }
    assert(
      valuesEqual(before.get(row.id), current),
      `${row.stable_object} changed after planning; review a fresh dry-run.`
    )
  }
}

async function applyRootUpdates(
  db,
  roots,
  manifest,
  plan,
  finalUrls
) {
  if (!plan.root_update_ids.length) return
  const expected = roots.map(root => ({
    id: root.id,
    data: root.data,
    updateTime: root.updateTime,
  }))
  const byId = new Map(roots.map(root => [root.id, root]))
  const imageActions = new Map(
    plan.image_rows.map(row => [row.id, row.action])
  )
  const createdByActions = new Map(
    plan.created_by_rows.map(row => [row.id, row.action])
  )
  const timestamp = Timestamp.now()

  await db.runTransaction(async (transaction) => {
    await assertRootsUnchanged(
      transaction,
      db.collection(COLLECTION_ID),
      expected
    )
    for (const id of plan.root_update_ids) {
      const root = byId.get(id)
      const patch = {
        updated: {
          at: timestamp,
          by: ACTOR,
        },
      }
      if (
        imageActions.get(id) &&
        imageActions.get(id) !== 'preserve-existing-image-url'
      ) {
        patch.image_url = finalUrls.get(id)
      }
      if (createdByActions.get(id) === 'add-system-provenance') {
        patch.created = {
          ...root.data.created,
          by: manifest.legacy_created_by,
        }
      }
      transaction.update(root.ref, patch)
    }
  })
}

async function verifyOutcome(db, manifest) {
  const roots = await loadRoots(db)
  const validated = validateCatalog(roots, manifest, { complete: true })
  await mapConcurrent(
    validated,
    HEAD_CONCURRENCY,
    root => verifyDownloadUrl(root.image_url, `${root.id}.image_url`)
  )
  return {
    roots: validated.length,
    active_roots: validated.filter(root => root.status === 'active').length,
    model_conformant_roots: validated.length,
    verified_image_urls: validated.length,
  }
}

function usage() {
  console.log(`
Complete the global canonical Misebox Ingredient catalog.

Dry-run (read-only):
  node scripts/complete-misebox-ingredient-catalog.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID}

Apply (remote writes):
  node scripts/complete-misebox-ingredient-catalog.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} --apply \\
    --confirm ${TARGET_CONFIRMATION} \\
    --confirm-manifest <reviewed-manifest-sha256> \\
    --confirm-source <reviewed-source-sha256> \\
    --confirm-plan <reviewed-plan-sha256> \\
    --backup /private/tmp/misebox-ingredient-catalog-preimage.json

The live root collection is the scope authority. The reviewed manifest only
declares exact remediation targets. Apply creates absent stable image objects
with a generation-zero precondition, never overwrites or deletes media, updates
only canonical Ingredient roots, performs zero Kitchen/Supplier/Demo/operational
writes, and requires exact reviewed hashes plus an exclusive mode-0600 preimage.

Credential sources:
${firebaseAdminCredentialHelp().map(line => `  - ${line}`).join('\n')}
`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) return usage()
  const options = optionsFor(args)
  const { manifest, sha256: manifestSha256 } = await loadManifest()
  assert(
    !options.apply || options.confirmManifest === manifestSha256,
    `Reviewed manifest hash mismatch. Current hash: ${manifestSha256}`
  )
  const assetDirectory = path.resolve(process.cwd(), manifest.asset_directory)
  const assets = await loadAssets(assetDirectory, manifest.image_ids)

  let app = null
  try {
    const credential = await resolveFirebaseAdminCredential({
      args,
      scope: 'misebox',
      projectId: PROJECT_ID,
    })
    app = initializeApp(
      {
        credential: credential.credential,
        projectId: PROJECT_ID,
        storageBucket: STORAGE_BUCKET,
      },
      `${OPERATION}-${process.pid}-${Date.now()}`
    )
    const db = getFirestore(app, DATABASE_ID)
    const bucket = getStorage(app).bucket(STORAGE_BUCKET)
    const roots = await loadRoots(db)
    const storage = await readStorageState(bucket, manifest.image_ids)
    const currentSourceHash = sourceHash(roots, assets, storage)
    const plan = buildPlan(
      manifest,
      roots,
      assets,
      storage,
      manifestSha256,
      currentSourceHash
    )
    const existingUrls = roots
      .map(root => ({
        id: root.id,
        url: text(root.data.image_url),
      }))
      .filter(item => item.url)
    await mapConcurrent(
      existingUrls,
      HEAD_CONCURRENCY,
      item => verifyDownloadUrl(item.url, `${item.id}.image_url`)
    )

    if (!options.apply) {
      console.log(
        JSON.stringify(
          {
            mode: 'dry-run',
            read_only: true,
            authority:
              'complete canonical Ingredient root collection; independent of Kitchen, Supplier, Demo, menu, and use',
            target: {
              project_id: PROJECT_ID,
              database_id: DATABASE_ID,
              storage_bucket: STORAGE_BUCKET,
              collection: COLLECTION_ID,
            },
            credential_source: credential.source,
            manifest: {
              path: MANIFEST_REPO_PATH,
              sha256: manifestSha256,
              expected_root_count: manifest.expected_root_count,
              image_count: manifest.image_ids.length,
              created_by_repair_count:
                manifest.created_by_repair_ids.length,
            },
            source_sha256: currentSourceHash,
            plan: {
              sha256: plan.sha256,
              operations: plan.operations,
              root_update_ids: plan.root_update_ids,
              image_rows: plan.image_rows,
              created_by_rows: plan.created_by_rows,
            },
            next_gate: `Review the manifest, source, and plan hashes. Apply additionally requires --apply, --confirm ${TARGET_CONFIRMATION}, those exact hashes, and a new /private/tmp preimage path.`,
          },
          null,
          2
        )
      )
      return
    }

    assert(
      options.confirmSource === currentSourceHash,
      `Remote source hash mismatch. Review a fresh dry-run: ${currentSourceHash}`
    )
    assert(
      options.confirmPlan === plan.sha256,
      `Reviewed plan hash mismatch. Review a fresh dry-run: ${plan.sha256}`
    )
    const backup = await writePreimage({
      backup: options.backupPath,
      manifestSha256,
      sourceSha256: currentSourceHash,
      plan,
      roots,
      storage,
    })
    const finalUrls = new Map()
    for (const row of plan.image_rows) {
      const root = roots.find(candidate => candidate.id === row.id)
      if (row.action === 'preserve-existing-image-url')
        finalUrls.set(row.id, text(root.data.image_url))
      else if (row.action === 'use-existing-stable-object')
        finalUrls.set(row.id, storage.get(row.id).download_url)
      else {
        finalUrls.set(
          row.id,
          await uploadStableObject(bucket, assets.get(row.id), row.id)
        )
      }
    }
    assertStorageUnchanged(
      storage,
      await readStorageState(bucket, manifest.image_ids),
      plan,
      finalUrls
    )
    await mapConcurrent(
      [...finalUrls],
      HEAD_CONCURRENCY,
      ([id, url]) => verifyDownloadUrl(url, `${id}.image_url`)
    )
    await applyRootUpdates(db, roots, manifest, plan, finalUrls)
    const verified = await verifyOutcome(db, manifest)
    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          target: {
            project_id: PROJECT_ID,
            database_id: DATABASE_ID,
            storage_bucket: STORAGE_BUCKET,
            collection: COLLECTION_ID,
          },
          manifest_sha256: manifestSha256,
          source_sha256: currentSourceHash,
          plan_sha256: plan.sha256,
          credential_source: credential.source,
          backup,
          operations: plan.operations,
          post_apply: verified,
        },
        null,
        2
      )
    )
  }
  finally {
    if (app)
      await deleteApp(app)
  }
}

main().catch((error) => {
  console.error(
    `[${OPERATION}] ${error instanceof Error ? error.message : String(error)}`
  )
  process.exitCode = 1
})
