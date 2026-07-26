#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-26
// usage_note: dry-run or explicitly apply the fixed, preimage-backed Misebox Ingredient V2 migration.

import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const PROJECT_ID = 'misebox-78f9c'
const DATABASE_ID = 'misebox'
const COLLECTION_ID = 'ingredients'
const APP_ID = 'misebox-app'
const EXPECTED_COUNT = 91
const SCHEMA_VERSION = 2
const OPERATION = 'migrate-misebox-ingredients-v2'
const ACTOR = `system:${OPERATION}`
const TARGET_CONFIRMATION = `${PROJECT_ID}/${DATABASE_ID}`
const MANIFEST_FORMAT = 'fireux-misebox-ingredient-v2-manifest/1'
const PREIMAGE_FORMAT = 'fireux-misebox-ingredient-v2-preimage/1'
const SOURCE_FORMAT = 'fireux-misebox-ingredient-v2-source/1'
const PLAN_FORMAT = 'fireux-misebox-ingredient-v2-plan/1'
const MANIFEST_PATH = fileURLToPath(
  new URL('./data/misebox-ingredients-v2.json', import.meta.url)
)
const MANIFEST_REPO_PATH = 'scripts/data/misebox-ingredients-v2.json'
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
const LEGACY_FIELDS = Object.freeze([
  'app_id',
  'default_locale',
  'names',
  'source_language',
])
const LEGACY_KEYS = new Set([
  'app_id',
  'created',
  'default_locale',
  'id',
  'image_url',
  'name',
  'names',
  'slug',
  'source_language',
  'updated',
])
const V2_KEYS = new Set([
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
  'source',
])
const FLAG_OPTIONS = new Set(['apply', 'help'])

function text(value) {
  return String(value ?? '').trim()
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function parseStrictArgs(argv) {
  const parsed = {}

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token?.startsWith('--')) {
      throw new Error(`Unexpected positional argument: ${token || '(empty)'}`)
    }

    const separator = token.indexOf('=')
    const key = token.slice(2, separator === -1 ? undefined : separator)
    const inlineValue =
      separator === -1 ? undefined : token.slice(separator + 1)
    if (!key || (!FLAG_OPTIONS.has(key) && !VALUE_OPTIONS.has(key))) {
      throw new Error(`Unknown option: --${key || '(empty)'}`)
    }
    if (Object.prototype.hasOwnProperty.call(parsed, key)) {
      throw new Error(`Duplicate option: --${key}`)
    }

    if (FLAG_OPTIONS.has(key)) {
      if (inlineValue !== undefined) {
        throw new Error(`Option --${key} does not accept a value.`)
      }
      parsed[key] = true
      continue
    }

    const value = inlineValue === undefined ? argv[index + 1] : inlineValue
    if (!value || value.startsWith('--')) {
      throw new Error(`Option --${key} requires a value.`)
    }
    parsed[key] = value
    if (inlineValue === undefined) index += 1
  }

  return parsed
}

function exactTarget(args, key, expected) {
  const value = text(args[key])
  if (!value) throw new Error(`--${key} ${expected} is required.`)
  if (value !== expected) {
    throw new Error(`This migration only supports --${key} ${expected}.`)
  }
  return value
}

function protectedBackupPath(value) {
  const raw = text(value)
  const resolved = path.resolve(raw)
  if (
    !raw ||
    !resolved.startsWith('/private/tmp/') ||
    path.extname(resolved).toLowerCase() !== '.json'
  ) {
    throw new Error('--backup /private/tmp/<new-file>.json is required.')
  }
  return resolved
}

function validateOptions(args) {
  const projectId = exactTarget(args, 'project', PROJECT_ID)
  const databaseId = exactTarget(args, 'database', DATABASE_ID)
  const apply = args.apply === true
  const sourcePath = text(args.source)
  const serviceAccount = text(args['service-account'])
  const suppliedApplyOnly = [
    'backup',
    'confirm',
    'confirm-manifest',
    'confirm-plan',
    'confirm-source',
  ].filter((key) => args[key] !== undefined)

  if (apply) {
    if (sourcePath) {
      throw new Error(
        '--source is read-only fixture input and cannot be used with --apply.'
      )
    }
    if (text(args.confirm) !== TARGET_CONFIRMATION) {
      throw new Error(`Apply requires --confirm ${TARGET_CONFIRMATION}.`)
    }
    if (!/^[a-f0-9]{64}$/.test(text(args['confirm-manifest']))) {
      throw new Error('Apply requires --confirm-manifest <reviewed-sha256>.')
    }
    if (!/^[a-f0-9]{64}$/.test(text(args['confirm-source']))) {
      throw new Error(
        'Apply requires --confirm-source <remote-dry-run-sha256>.'
      )
    }
    if (!/^[a-f0-9]{64}$/.test(text(args['confirm-plan']))) {
      throw new Error('Apply requires --confirm-plan <reviewed-sha256>.')
    }
  } else if (suppliedApplyOnly.length) {
    throw new Error(
      `Apply-only option(s) cannot be used in dry-run: ${suppliedApplyOnly
        .map((key) => `--${key}`)
        .join(', ')}.`
    )
  }

  return {
    apply,
    backupPath: apply ? protectedBackupPath(args.backup) : '',
    confirmManifestSha256: text(args['confirm-manifest']),
    confirmPlanSha256: text(args['confirm-plan']),
    confirmSourceSha256: text(args['confirm-source']),
    databaseId,
    projectId,
    serviceAccount,
    sourcePath: sourcePath ? path.resolve(sourcePath) : '',
  }
}

function assertObject(value, label) {
  if (!isPlainObject(value)) throw new Error(`${label} must be an object.`)
}

function assertExactKeys(value, allowed, required, label) {
  assertObject(value, label)
  const extra = Object.keys(value).filter((key) => !allowed.has(key))
  const missing = required.filter(
    (key) => !Object.prototype.hasOwnProperty.call(value, key)
  )
  if (extra.length || missing.length) {
    throw new Error(
      `${label} has invalid keys (extra: ${extra.join(', ') || 'none'}; missing: ${
        missing.join(', ') || 'none'
      }).`
    )
  }
}

function assertIdentifier(value, label) {
  const resolved = text(value)
  if (
    !resolved ||
    resolved.length > 120 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resolved)
  ) {
    throw new Error(`${label} must be a lowercase kebab-case identifier.`)
  }
  return resolved
}

function assertDisplayText(value, label, maxLength = 120) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > maxLength
  ) {
    throw new Error(`${label} must be trimmed text up to ${maxLength} chars.`)
  }
  return value
}

function assertTimestampLike(value, label) {
  const seconds = Number(value?.seconds)
  const nanoseconds = Number(value?.nanoseconds)
  if (
    !value ||
    typeof value !== 'object' ||
    !Number.isSafeInteger(seconds) ||
    !Number.isInteger(nanoseconds) ||
    nanoseconds < 0 ||
    nanoseconds > 999999999
  ) {
    throw new Error(`${label} must be a Firestore timestamp.`)
  }
  return { seconds, nanoseconds }
}

function assertStamp(value, label, options = {}) {
  const allowed = new Set(
    options.created ? ['app_id', 'at', 'by'] : ['at', 'by']
  )
  const required = options.created ? ['app_id', 'at'] : ['at', 'by']
  assertExactKeys(value, allowed, required, label)
  if (options.created && text(value.app_id) !== APP_ID) {
    throw new Error(`${label}.app_id must remain ${APP_ID}.`)
  }
  if (
    value.by !== undefined &&
    (typeof value.by !== 'string' || !value.by.trim())
  ) {
    throw new Error(`${label}.by must be non-empty text when present.`)
  }
  assertTimestampLike(value.at, `${label}.at`)
}

function validateManifestEntry(raw, index) {
  const label = `Manifest entry ${index}`
  const allowed = new Set([
    'aliases',
    'category',
    'id',
    'kind',
    'name',
    'parent_ingredient_id',
    'replaced_by_ingredient_id',
    'slug',
    'status',
  ])
  assertExactKeys(
    raw,
    allowed,
    ['aliases', 'category', 'id', 'kind', 'name', 'slug', 'status'],
    label
  )

  const id = assertIdentifier(raw.id, `${label}.id`)
  const slug = assertIdentifier(raw.slug, `${label}.slug`)
  if (slug !== id) {
    throw new Error(`${label} must retain the same stable id and slug.`)
  }
  const name = assertDisplayText(raw.name, `${label}.name`)
  if (!Array.isArray(raw.aliases) || raw.aliases.length > 12) {
    throw new Error(`${label}.aliases must be an array with at most 12 names.`)
  }
  const aliases = raw.aliases.map((alias, aliasIndex) =>
    assertDisplayText(alias, `${label}.aliases[${aliasIndex}]`)
  )
  const foldedNames = [name, ...aliases].map((value) =>
    value.toLocaleLowerCase('en')
  )
  if (new Set(foldedNames).size !== foldedNames.length) {
    throw new Error(`${label}.aliases must be unique and differ from name.`)
  }
  if (
    aliases.join('\u0000') !==
    [...aliases].sort((left, right) => left.localeCompare(right)).join('\u0000')
  ) {
    throw new Error(`${label}.aliases must be deterministically sorted.`)
  }

  const category = text(raw.category)
  const kind = text(raw.kind)
  const status = text(raw.status)
  if (!CATEGORY_IDS.has(category)) {
    throw new Error(`${label}.category is outside the Ingredient V2 enum.`)
  }
  if (!KINDS.has(kind)) {
    throw new Error(`${label}.kind is outside the Ingredient V2 enum.`)
  }
  if (!STATUSES.has(status)) {
    throw new Error(`${label}.status is outside the Ingredient V2 enum.`)
  }

  const parentIngredientId = raw.parent_ingredient_id
    ? assertIdentifier(
        raw.parent_ingredient_id,
        `${label}.parent_ingredient_id`
      )
    : ''
  const replacedByIngredientId = raw.replaced_by_ingredient_id
    ? assertIdentifier(
        raw.replaced_by_ingredient_id,
        `${label}.replaced_by_ingredient_id`
      )
    : ''
  if (parentIngredientId === id || replacedByIngredientId === id) {
    throw new Error(`${label} cannot reference itself.`)
  }
  if (status === 'merged' ? !replacedByIngredientId : replacedByIngredientId) {
    throw new Error(
      `${label}.replaced_by_ingredient_id is required only for merged records.`
    )
  }
  if (status !== 'active') {
    throw new Error(`${label} must remain active in this no-merge pass.`)
  }

  return {
    id,
    slug,
    name,
    aliases,
    category,
    kind,
    ...(parentIngredientId ? { parent_ingredient_id: parentIngredientId } : {}),
    status,
    ...(replacedByIngredientId
      ? { replaced_by_ingredient_id: replacedByIngredientId }
      : {}),
  }
}

function assertAcyclicParents(entries) {
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  for (const entry of entries) {
    let cursor = entry
    const seen = new Set([entry.id])
    while (cursor.parent_ingredient_id) {
      const parent = byId.get(cursor.parent_ingredient_id)
      if (!parent) {
        throw new Error(
          `Manifest entry ${entry.id} has unknown parent ${cursor.parent_ingredient_id}.`
        )
      }
      if (seen.has(parent.id)) {
        throw new Error(`Manifest parent cycle reaches ${parent.id}.`)
      }
      seen.add(parent.id)
      cursor = parent
    }
  }
}

function validateManifest(value) {
  assertExactKeys(
    value,
    new Set([
      'entries',
      'executor',
      'format',
      'schema_version',
      'source',
      'target',
    ]),
    ['entries', 'executor', 'format', 'schema_version', 'source', 'target'],
    'Manifest'
  )
  if (
    value.format !== MANIFEST_FORMAT ||
    value.executor !== 'scripts/migrate-misebox-ingredients-v2.mjs' ||
    value.schema_version !== 2
  ) {
    throw new Error('Ingredient manifest format or schema version is invalid.')
  }
  assertExactKeys(
    value.target,
    new Set(['collection', 'database_id', 'project_id']),
    ['collection', 'database_id', 'project_id'],
    'Manifest target'
  )
  if (
    value.target.project_id !== PROJECT_ID ||
    value.target.database_id !== DATABASE_ID ||
    value.target.collection !== COLLECTION_ID
  ) {
    throw new Error('Ingredient manifest is not bound to the fixed target.')
  }
  assertExactKeys(
    value.source,
    new Set(['expected_document_count', 'legacy_fields_removed', 'policy']),
    ['expected_document_count', 'legacy_fields_removed', 'policy'],
    'Manifest source'
  )
  if (
    value.source.expected_document_count !== EXPECTED_COUNT ||
    value.source.policy !== 'stable ids and slugs; no merges or deletes' ||
    !Array.isArray(value.source.legacy_fields_removed) ||
    value.source.legacy_fields_removed.join('\u0000') !==
      LEGACY_FIELDS.join('\u0000')
  ) {
    throw new Error('Ingredient manifest source policy is invalid.')
  }
  if (
    !Array.isArray(value.entries) ||
    value.entries.length !== EXPECTED_COUNT
  ) {
    throw new Error(`Ingredient manifest must contain ${EXPECTED_COUNT} rows.`)
  }

  const entries = value.entries.map(validateManifestEntry)
  const ids = entries.map((entry) => entry.id)
  if (new Set(ids).size !== ids.length) {
    throw new Error('Ingredient manifest ids must be unique.')
  }
  if (ids.join('\u0000') !== [...ids].sort().join('\u0000')) {
    throw new Error('Ingredient manifest rows must be sorted by id.')
  }
  assertAcyclicParents(entries)

  return {
    ...value,
    entries,
  }
}

async function loadManifest() {
  const source = await readFile(MANIFEST_PATH, 'utf8')
  let value
  try {
    value = JSON.parse(source)
  } catch {
    throw new Error(`${MANIFEST_REPO_PATH} is not valid JSON.`)
  }
  return {
    manifest: validateManifest(value),
    sha256: rawSha256(source),
  }
}

function validateLegacyDocument(document, manifestEntry) {
  assertExactKeys(
    document.data,
    LEGACY_KEYS,
    ['created', 'id', 'name', 'slug', 'updated'],
    document.path
  )
  if (document.data.id !== document.id) {
    throw new Error(`${document.path}.id must equal its document id.`)
  }
  if (
    document.data.slug !== manifestEntry.slug ||
    document.data.slug !== document.id
  ) {
    throw new Error(`${document.path}.slug must retain the stable id.`)
  }
  assertDisplayText(document.data.name, `${document.path}.name`)
  if (
    document.data.image_url !== undefined &&
    (typeof document.data.image_url !== 'string' ||
      document.data.image_url !== document.data.image_url.trim())
  ) {
    throw new Error(`${document.path}.image_url must be trimmed text.`)
  }
  if (
    document.data.app_id !== undefined &&
    (typeof document.data.app_id !== 'string' ||
      (text(document.data.app_id) && document.data.app_id !== APP_ID))
  ) {
    throw new Error(`${document.path}.app_id is outside the fixed App.`)
  }
  if (
    document.data.source_language !== undefined &&
    typeof document.data.source_language !== 'string'
  ) {
    throw new Error(`${document.path}.source_language must be text.`)
  }
  if (
    document.data.default_locale !== undefined &&
    typeof document.data.default_locale !== 'string'
  ) {
    throw new Error(`${document.path}.default_locale must be text.`)
  }
  if (document.data.names !== undefined) {
    assertObject(document.data.names, `${document.path}.names`)
    for (const [language, name] of Object.entries(document.data.names)) {
      if (!language || typeof name !== 'string') {
        throw new Error(`${document.path}.names contains an invalid entry.`)
      }
    }
  }
  assertStamp(document.data.created, `${document.path}.created`, {
    created: true,
  })
  assertStamp(document.data.updated, `${document.path}.updated`)
}

function validateV2Document(document, manifestEntry) {
  assertExactKeys(
    document.data,
    V2_KEYS,
    [
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
    ],
    document.path
  )
  if (document.data.schema_version !== SCHEMA_VERSION) {
    throw new Error(
      `${document.path}.schema_version must be ${SCHEMA_VERSION}.`
    )
  }
  if (
    document.data.id !== document.id ||
    document.data.slug !== manifestEntry.slug ||
    document.data.name !== manifestEntry.name ||
    document.data.category !== manifestEntry.category ||
    document.data.kind !== manifestEntry.kind ||
    document.data.status !== manifestEntry.status ||
    text(document.data.parent_ingredient_id) !==
      text(manifestEntry.parent_ingredient_id) ||
    text(document.data.replaced_by_ingredient_id) !==
      text(manifestEntry.replaced_by_ingredient_id) ||
    !valuesEqual(document.data.aliases, manifestEntry.aliases)
  ) {
    throw new Error(`${document.path} does not match the reviewed V2 manifest.`)
  }
  if (typeof document.data.image_url !== 'string') {
    throw new Error(`${document.path}.image_url must be text.`)
  }
  assertStamp(document.data.created, `${document.path}.created`, {
    created: true,
  })
  assertStamp(document.data.updated, `${document.path}.updated`)
}

function validateSourceDocuments(documents, manifest) {
  if (!Array.isArray(documents) || documents.length !== EXPECTED_COUNT) {
    throw new Error(
      `Source must contain exactly ${EXPECTED_COUNT} Ingredient documents.`
    )
  }
  const sorted = [...documents].sort((left, right) =>
    left.id.localeCompare(right.id)
  )
  const ids = sorted.map((document) => document.id)
  if (new Set(ids).size !== ids.length) {
    throw new Error('Source Ingredient document ids must be unique.')
  }

  const manifestById = new Map(
    manifest.entries.map((entry) => [entry.id, entry])
  )
  const missing = manifest.entries
    .filter((entry) => !ids.includes(entry.id))
    .map((entry) => entry.id)
  const extra = ids.filter((id) => !manifestById.has(id))
  if (missing.length || extra.length) {
    throw new Error(
      `Source ids differ from the reviewed manifest (missing: ${
        missing.join(', ') || 'none'
      }; extra: ${extra.join(', ') || 'none'}).`
    )
  }

  const v2Count = sorted.filter(
    (document) => document.data?.schema_version === SCHEMA_VERSION
  ).length
  const state =
    v2Count === 0 ? 'legacy' : v2Count === EXPECTED_COUNT ? 'v2' : 'mixed'
  if (state === 'mixed') {
    throw new Error(
      'Source mixes legacy and V2 Ingredient documents; no mutation is safe.'
    )
  }

  for (const document of sorted) {
    assertIdentifier(document.id, `${document.path} document id`)
    const manifestEntry = manifestById.get(document.id)
    if (state === 'legacy') {
      validateLegacyDocument(document, manifestEntry)
    } else {
      validateV2Document(document, manifestEntry)
    }
  }

  return { documents: sorted, state }
}

function parseCollectionManagerExport(source, sourcePath) {
  const start = source.indexOf('[')
  if (start === -1) {
    throw new Error(`${sourcePath} does not contain a JSON array.`)
  }
  let rows
  try {
    rows = JSON.parse(source.slice(start))
  } catch {
    throw new Error(`${sourcePath} does not contain a valid JSON array.`)
  }
  if (!Array.isArray(rows)) {
    throw new Error(`${sourcePath} must contain a JSON array.`)
  }
  return rows.map((data, index) => {
    assertObject(data, `Source row ${index}`)
    const id = assertIdentifier(data.id, `Source row ${index}.id`)
    return {
      id,
      path: `${COLLECTION_ID}/${id}`,
      data,
      createTime: null,
      updateTime: null,
    }
  })
}

async function loadLocalSource(sourcePath) {
  const source = await readFile(sourcePath, 'utf8')
  return {
    kind: 'local-export',
    label: sourcePath,
    documents: parseCollectionManagerExport(source, sourcePath),
  }
}

async function loadRemoteSource(db) {
  const snapshot = await db.collection(COLLECTION_ID).get()
  const documents = snapshot.docs.map((document) => ({
    id: document.id,
    path: document.ref.path,
    ref: document.ref,
    data: document.data(),
    createTime: document.createTime,
    updateTime: document.updateTime,
  }))
  for (const document of documents) {
    assertTimestampLike(document.createTime, `${document.path} createTime`)
    assertTimestampLike(document.updateTime, `${document.path} updateTime`)
  }
  return {
    kind: 'remote-firestore',
    label: `${PROJECT_ID}/${DATABASE_ID}/${COLLECTION_ID}`,
    documents,
  }
}

function normaliseForHash(value) {
  if (value instanceof Timestamp) {
    return {
      __firestore_type: 'timestamp',
      seconds: value.seconds,
      nanoseconds: value.nanoseconds,
    }
  }
  if (value instanceof Date) {
    return { __firestore_type: 'date', value: value.toISOString() }
  }
  if (Buffer.isBuffer(value)) {
    return {
      __firestore_type: 'bytes',
      base64: value.toString('base64'),
    }
  }
  if (Array.isArray(value)) return value.map(normaliseForHash)
  if (value?.constructor?.name === 'DocumentReference') {
    return { __firestore_type: 'reference', path: value.path }
  }
  if (value?.constructor?.name === 'GeoPoint') {
    return {
      __firestore_type: 'geopoint',
      latitude: value.latitude,
      longitude: value.longitude,
    }
  }
  if (typeof value?.toBase64 === 'function') {
    return {
      __firestore_type: 'bytes',
      base64: value.toBase64(),
    }
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, normaliseForHash(value[key])])
    )
  }
  if (value && typeof value === 'object') {
    throw new Error(
      `Cannot create deterministic evidence for ${value.constructor?.name || 'unknown'}.`
    )
  }
  return value
}

function rawSha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function canonicalSha256(value) {
  return rawSha256(JSON.stringify(normaliseForHash(value)))
}

function valuesEqual(left, right) {
  return canonicalSha256(left) === canonicalSha256(right)
}

function sourceSha256(source) {
  return canonicalSha256({
    format: SOURCE_FORMAT,
    target: {
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      collection: COLLECTION_ID,
    },
    kind: source.kind,
    documents: source.documents
      .map((document) => ({
        path: document.path,
        create_time: document.createTime,
        update_time: document.updateTime,
        data: document.data,
      }))
      .sort((left, right) => left.path.localeCompare(right.path)),
  })
}

function toFirestoreTimestamp(value, label) {
  if (value instanceof Timestamp) return value
  const timestamp = assertTimestampLike(value, label)
  return new Timestamp(timestamp.seconds, timestamp.nanoseconds)
}

function preservedCreatedStamp(value, pathLabel) {
  return {
    app_id: APP_ID,
    ...(value.by ? { by: value.by } : {}),
    at: toFirestoreTimestamp(value.at, `${pathLabel}.created.at`),
  }
}

function targetDocument(sourceDocument, manifestEntry, migrationTimestamp) {
  return {
    schema_version: SCHEMA_VERSION,
    id: manifestEntry.id,
    slug: manifestEntry.slug,
    name: manifestEntry.name,
    aliases: [...manifestEntry.aliases],
    category: manifestEntry.category,
    kind: manifestEntry.kind,
    ...(manifestEntry.parent_ingredient_id
      ? { parent_ingredient_id: manifestEntry.parent_ingredient_id }
      : {}),
    status: manifestEntry.status,
    ...(manifestEntry.replaced_by_ingredient_id
      ? {
          replaced_by_ingredient_id: manifestEntry.replaced_by_ingredient_id,
        }
      : {}),
    image_url: text(sourceDocument.data.image_url),
    created: preservedCreatedStamp(
      sourceDocument.data.created,
      sourceDocument.path
    ),
    updated: {
      by: ACTOR,
      at: migrationTimestamp,
    },
  }
}

function planSha256({ manifest, manifestSha256, sourceHash, sourceState }) {
  return canonicalSha256({
    format: PLAN_FORMAT,
    target: {
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      collection: COLLECTION_ID,
    },
    manifest_sha256: manifestSha256,
    source_sha256: sourceHash,
    source_state: sourceState,
    v2_contract: {
      fields: [...V2_KEYS].sort(),
      updated_by: ACTOR,
      rows: manifest.entries.map((entry) => ({
        schema_version: SCHEMA_VERSION,
        id: entry.id,
        slug: entry.slug,
        name: entry.name,
        aliases: entry.aliases,
        category: entry.category,
        kind: entry.kind,
        ...(entry.parent_ingredient_id
          ? { parent_ingredient_id: entry.parent_ingredient_id }
          : {}),
        status: entry.status,
        ...(entry.replaced_by_ingredient_id
          ? {
              replaced_by_ingredient_id: entry.replaced_by_ingredient_id,
            }
          : {}),
      })),
    },
    document_replacements: sourceState === 'legacy' ? EXPECTED_COUNT : 0,
    document_deletes: 0,
    storage_mutations: 0,
  })
}

function countBy(entries, field) {
  return Object.fromEntries(
    [...new Set(entries.map((entry) => entry[field]))]
      .sort()
      .map((value) => [
        value,
        entries.filter((entry) => entry[field] === value).length,
      ])
  )
}

function dryRunOutput({
  manifest,
  manifestSha256,
  planHash,
  source,
  sourceHash,
  sourceState,
}) {
  const sourceById = new Map(
    source.documents.map((document) => [document.id, document])
  )
  const nameChanges = manifest.entries.flatMap((entry) => {
    const before = sourceById.get(entry.id)?.data?.name
    return before !== entry.name
      ? [{ id: entry.id, before, after: entry.name }]
      : []
  })

  return {
    mode: 'dry-run',
    read_only: true,
    target: {
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      collection: COLLECTION_ID,
    },
    source: {
      kind: source.kind,
      label: source.label,
      state: sourceState,
      document_count: source.documents.length,
      sha256: sourceHash,
      version_bound: source.kind === 'remote-firestore',
    },
    manifest: {
      path: MANIFEST_REPO_PATH,
      sha256: manifestSha256,
      row_count: manifest.entries.length,
    },
    plan: {
      sha256: planHash,
      document_replacements: sourceState === 'legacy' ? EXPECTED_COUNT : 0,
      document_deletes: 0,
      storage_mutations: 0,
      schema_version: SCHEMA_VERSION,
      legacy_fields_removed: LEGACY_FIELDS,
    },
    categories: countBy(manifest.entries, 'category'),
    kinds: countBy(manifest.entries, 'kind'),
    parent_links: manifest.entries.filter((entry) => entry.parent_ingredient_id)
      .length,
    aliases: manifest.entries.reduce(
      (total, entry) => total + entry.aliases.length,
      0
    ),
    name_changes: nameChanges,
    production_mutated: false,
    next_gate:
      source.kind === 'remote-firestore' && sourceState === 'legacy'
        ? `Review this manifest, remote source hash, and derived plan hash. Apply additionally requires --apply, --confirm ${TARGET_CONFIRMATION}, all three reviewed hashes, and a new /private/tmp preimage path.`
        : sourceState === 'v2'
          ? 'The exact reviewed V2 shape is already present; no apply is allowed.'
          : 'Run the same command without --source for a version-bound remote dry-run before any apply.',
  }
}

function serialiseFirestoreValue(value) {
  return normaliseForHash(value)
}

function versionEqual(left, right) {
  if (!left || !right) return false
  if (typeof left.isEqual === 'function') return left.isEqual(right)
  return valuesEqual(left, right)
}

function assertTransactionSourceUnchanged(currentSnapshot, expectedDocuments) {
  const current = currentSnapshot.docs
    .map((document) => ({
      id: document.id,
      path: document.ref.path,
      data: document.data(),
      updateTime: document.updateTime,
    }))
    .sort((left, right) => left.id.localeCompare(right.id))
  const expected = [...expectedDocuments].sort((left, right) =>
    left.id.localeCompare(right.id)
  )

  if (
    current.length !== expected.length ||
    current.map((entry) => entry.id).join('\u0000') !==
      expected.map((entry) => entry.id).join('\u0000')
  ) {
    throw new Error(
      'Ingredient collection membership changed after planning; review a new remote dry-run.'
    )
  }
  for (let index = 0; index < expected.length; index += 1) {
    if (
      !versionEqual(current[index].updateTime, expected[index].updateTime) ||
      !valuesEqual(current[index].data, expected[index].data)
    ) {
      throw new Error(
        `${expected[index].path} changed after planning; review a new remote dry-run.`
      )
    }
  }
}

async function writePreimage({
  backupPath,
  manifestSha256,
  planHash,
  source,
  sourceHash,
  targets,
}) {
  return writeProtectedJsonArtifact({
    path: backupPath,
    payload: {
      format: PREIMAGE_FORMAT,
      target: {
        project_id: PROJECT_ID,
        database_id: DATABASE_ID,
        collection: COLLECTION_ID,
      },
      captured_at: new Date().toISOString(),
      manifest: {
        path: MANIFEST_REPO_PATH,
        sha256: manifestSha256,
      },
      source_sha256: sourceHash,
      plan_sha256: planHash,
      operation: {
        document_replacements: targets.length,
        document_deletes: 0,
        storage_mutations: 0,
      },
      documents: source.documents.map((document) => ({
        path: document.path,
        create_time: serialiseFirestoreValue(document.createTime),
        update_time: serialiseFirestoreValue(document.updateTime),
        before: serialiseFirestoreValue(document.data),
        after: serialiseFirestoreValue(targets.get(document.id)),
      })),
    },
  })
}

async function applyTargets(db, source, targets) {
  const collection = db.collection(COLLECTION_ID)
  await db.runTransaction(async (transaction) => {
    const currentSnapshot = await transaction.get(collection)
    assertTransactionSourceUnchanged(currentSnapshot, source.documents)
    for (const document of source.documents) {
      transaction.set(document.ref, targets.get(document.id))
    }
  })
}

async function verifyTargets(db, manifest, targets) {
  const snapshot = await db.collection(COLLECTION_ID).get()
  const documents = snapshot.docs.map((document) => ({
    id: document.id,
    path: document.ref.path,
    data: document.data(),
    createTime: document.createTime,
    updateTime: document.updateTime,
  }))
  const validated = validateSourceDocuments(documents, manifest)
  if (validated.state !== 'v2') {
    throw new Error('Post-write verification did not observe an all-V2 source.')
  }
  for (const document of validated.documents) {
    if (!valuesEqual(document.data, targets.get(document.id))) {
      throw new Error(`${document.path} failed exact post-write verification.`)
    }
  }
  return validated.documents.length
}

function printUsage() {
  console.log(`
Migrate the fixed Misebox Ingredient collection to the reviewed V2 manifest.

Local export dry-run (no credentials or remote access):
  node scripts/migrate-misebox-ingredients-v2.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} \\
    --source /absolute/path/to/ingredients-export.txt

Version-bound remote dry-run (default mode):
  node scripts/migrate-misebox-ingredients-v2.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID}

Explicit apply (remote writes):
  node scripts/migrate-misebox-ingredients-v2.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} \\
    --apply --confirm ${TARGET_CONFIRMATION} \\
    --confirm-manifest <reviewed-manifest-sha256> \\
    --confirm-source <remote-dry-run-sha256> \\
    --confirm-plan <reviewed-plan-sha256> \\
    --backup /private/tmp/misebox-ingredients-v2-preimage.json

The fixed manifest contains exactly ${EXPECTED_COUNT} stable Ingredient ids and
slugs. Apply is impossible from a local export. It requires the exact manifest
hash and a version-bound remote source hash, creates a new exclusive mode-0600
full preimage before writing, requires the derived V2 plan hash, rechecks the
complete collection in one atomic transaction, performs no document deletes or
Storage mutations, and verifies the exact V2 result after commit.

Credential sources:
${firebaseAdminCredentialHelp()
  .map((line) => `  - ${line}`)
  .join('\n')}
`)
}

async function main() {
  const args = parseStrictArgs(process.argv.slice(2))
  if (args.help) {
    printUsage()
    return
  }
  const options = validateOptions(args)
  const { manifest, sha256: manifestSha256 } = await loadManifest()
  if (options.apply && options.confirmManifestSha256 !== manifestSha256) {
    throw new Error(
      `Reviewed manifest hash mismatch. Current hash: ${manifestSha256}`
    )
  }

  let adminApp = null
  let credentialSource = ''
  try {
    let source
    let db = null
    if (options.sourcePath) {
      source = await loadLocalSource(options.sourcePath)
    } else {
      const credential = await resolveFirebaseAdminCredential({
        args,
        scope: 'misebox',
        projectId: PROJECT_ID,
      })
      credentialSource = credential.source
      adminApp = initializeApp(
        { credential: credential.credential, projectId: PROJECT_ID },
        `${OPERATION}-${process.pid}-${Date.now()}`
      )
      db = getFirestore(adminApp, DATABASE_ID)
      source = await loadRemoteSource(db)
    }

    const validated = validateSourceDocuments(source.documents, manifest)
    source.documents = validated.documents
    const sourceHash = sourceSha256(source)
    const planHash = planSha256({
      manifest,
      manifestSha256,
      sourceHash,
      sourceState: validated.state,
    })

    if (!options.apply) {
      console.log(
        JSON.stringify(
          {
            ...dryRunOutput({
              manifest,
              manifestSha256,
              planHash,
              source,
              sourceHash,
              sourceState: validated.state,
            }),
            ...(credentialSource
              ? { credential_source: credentialSource }
              : {}),
          },
          null,
          2
        )
      )
      return
    }

    if (!db || source.kind !== 'remote-firestore') {
      throw new Error('Apply requires the fixed remote Firestore source.')
    }
    if (validated.state !== 'legacy') {
      throw new Error(
        'The reviewed V2 shape is already present; refusing a replay.'
      )
    }
    if (options.confirmSourceSha256 !== sourceHash) {
      throw new Error(
        `Remote source hash mismatch. Review a fresh remote dry-run: ${sourceHash}`
      )
    }
    if (options.confirmPlanSha256 !== planHash) {
      throw new Error(
        `Reviewed plan hash mismatch. Review a fresh remote dry-run: ${planHash}`
      )
    }

    const migrationTimestamp = Timestamp.now()
    const sourceById = new Map(
      source.documents.map((document) => [document.id, document])
    )
    const targets = new Map(
      manifest.entries.map((entry) => [
        entry.id,
        targetDocument(sourceById.get(entry.id), entry, migrationTimestamp),
      ])
    )
    const backup = await writePreimage({
      backupPath: options.backupPath,
      manifestSha256,
      planHash,
      source,
      sourceHash,
      targets,
    })

    await applyTargets(db, source, targets)
    const verified = await verifyTargets(db, manifest, targets)

    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          target: {
            project_id: PROJECT_ID,
            database_id: DATABASE_ID,
            collection: COLLECTION_ID,
          },
          schema_version: SCHEMA_VERSION,
          manifest_sha256: manifestSha256,
          source_sha256: sourceHash,
          plan_sha256: planHash,
          credential_source: credentialSource,
          backup,
          document_replacements: targets.size,
          document_deletes: 0,
          storage_mutations: 0,
          post_write_verified: verified,
        },
        null,
        2
      )
    )
  } finally {
    if (adminApp) await deleteApp(adminApp)
  }
}

main().catch((error) => {
  console.error(
    `[${OPERATION}] ${error instanceof Error ? error.message : String(error)}`
  )
  process.exitCode = 1
})
