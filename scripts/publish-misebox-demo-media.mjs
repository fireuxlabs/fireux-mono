#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-29
// usage_note: plan, create, and verify immutable public media for the read-only Misebox Demo World.

import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import {
  miseboxDemoMediaContract,
  miseboxDemoMediaObjectPath,
  miseboxDemoMediaUrl,
} from '../packages/core/fireux-core/src/runtime/utils/misebox-demo-media.ts'
import {
  firebaseAdminCredentialHelp,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const OPERATION = 'publish-misebox-demo-media'
const APP_ID = 'misebox-app'
const DATABASE_ID = 'misebox'
const PROJECT_ID = miseboxDemoMediaContract.projectId
const STORAGE_BUCKET = miseboxDemoMediaContract.storageBucket
const TARGET_CONFIRMATION = `${PROJECT_ID}/${DATABASE_ID}`
const FORMAT = 'fireux-misebox-demo-media/1'
const CACHE_CONTROL = 'public,max-age=31536000,immutable'
const MANIFEST_REPO_PATH = 'scripts/data/misebox-demo-media/manifest.json'
const MANIFEST_PATH = fileURLToPath(
  new URL('./data/misebox-demo-media/manifest.json', import.meta.url)
)
const VALUE_OPTIONS = new Set([
  'bucket',
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
const sha256 = (value) =>
  createHash('sha256')
    .update(Buffer.isBuffer(value) ? value : String(value ?? ''))
    .digest('hex')
const isPlainObject = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
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
    assert(
      value && !value.startsWith('--'),
      `Option --${key} requires a value.`
    )
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
    `This publisher only supports --${key} ${expected}.`
  )
}

function optionsFor(args) {
  exactTarget(args, 'project', PROJECT_ID)
  exactTarget(args, 'database', DATABASE_ID)
  exactTarget(args, 'bucket', STORAGE_BUCKET)
  const apply = args.apply === true
  const applyOnly = [
    'confirm',
    'confirm-manifest',
    'confirm-source',
    'confirm-plan',
  ].filter((key) => args[key] !== undefined)
  if (apply) {
    assert(
      text(args.confirm) === TARGET_CONFIRMATION,
      `Apply requires --confirm ${TARGET_CONFIRMATION}.`
    )
    for (const key of ['confirm-manifest', 'confirm-source', 'confirm-plan']) {
      assert(
        /^[a-f0-9]{64}$/.test(text(args[key])),
        `Apply requires --${key} <reviewed-sha256>.`
      )
    }
  } else {
    assert(
      !applyOnly.length,
      `Apply-only option(s) cannot be used in dry-run: ${applyOnly.join(', ')}.`
    )
  }
  return {
    apply,
    confirmManifest: text(args['confirm-manifest']),
    confirmPlan: text(args['confirm-plan']),
    confirmSource: text(args['confirm-source']),
    serviceAccount: text(args['service-account']),
  }
}

function exactKeys(value, allowed, required, label) {
  assert(isPlainObject(value), `${label} must be an object.`)
  const extras = Object.keys(value).filter((key) => !allowed.includes(key))
  const missing = required.filter((key) => !Object.hasOwn(value, key))
  assert(
    !extras.length && !missing.length,
    `${label} keys are invalid (extra: ${extras.join(', ') || 'none'}; missing: ${missing.join(', ') || 'none'}).`
  )
}

function relativeMediaPath(value, label) {
  const result = text(value)
  assert(
    result &&
      !result.startsWith('/') &&
      !result.includes('..') &&
      !result.includes('\\') &&
      !result.includes('//') &&
      /^[a-z0-9][a-z0-9./-]*\.(?:jpg|png)$/.test(result),
    `${label} must be a lowercase relative JPG or PNG path.`
  )
  return result
}

function validateManifest(value) {
  exactKeys(
    value,
    [
      'format',
      'asset_directory',
      'policy',
      'target',
      'expected_source_count',
      'expected_object_count',
      'aliases',
    ],
    [
      'format',
      'asset_directory',
      'policy',
      'target',
      'expected_source_count',
      'expected_object_count',
      'aliases',
    ],
    'Manifest'
  )
  assert(value.format === FORMAT, 'Demo media manifest format is invalid.')
  assert(
    value.policy ===
      'immutable public Demo delivery only; create or reuse exact objects; never overwrite, delete, or write Firestore',
    'Demo media manifest policy is invalid.'
  )
  assert(
    typeof value.asset_directory === 'string' &&
      value.asset_directory &&
      !path.isAbsolute(value.asset_directory),
    'Manifest asset_directory must be repository-relative.'
  )
  exactKeys(
    value.target,
    [
      'app_id',
      'project_id',
      'database_id',
      'storage_bucket',
      'object_prefix',
      'download_token',
    ],
    [
      'app_id',
      'project_id',
      'database_id',
      'storage_bucket',
      'object_prefix',
      'download_token',
    ],
    'Manifest target'
  )
  assert(
    value.target.app_id === APP_ID &&
      value.target.project_id === PROJECT_ID &&
      value.target.database_id === DATABASE_ID &&
      value.target.storage_bucket === STORAGE_BUCKET &&
      value.target.object_prefix === miseboxDemoMediaContract.objectPrefix &&
      value.target.download_token === miseboxDemoMediaContract.downloadToken,
    'Manifest target does not match the fixed Misebox Demo media contract.'
  )
  assert(
    Number.isInteger(value.expected_source_count) &&
      value.expected_source_count > 0,
    'Manifest expected_source_count is invalid.'
  )
  assert(
    Number.isInteger(value.expected_object_count) &&
      value.expected_object_count >= value.expected_source_count,
    'Manifest expected_object_count is invalid.'
  )
  assert(Array.isArray(value.aliases), 'Manifest aliases must be an array.')
  const aliases = value.aliases.map((alias, index) => {
    exactKeys(
      alias,
      ['source', 'object'],
      ['source', 'object'],
      `Manifest alias ${index}`
    )
    return {
      source: relativeMediaPath(alias.source, `Manifest alias ${index}.source`),
      object: relativeMediaPath(alias.object, `Manifest alias ${index}.object`),
    }
  })
  const aliasObjects = aliases.map((alias) => alias.object)
  assert(
    new Set(aliasObjects).size === aliasObjects.length,
    'Manifest alias object paths must be unique.'
  )
  return { ...value, aliases }
}

async function loadManifest() {
  const source = await readFile(MANIFEST_PATH, 'utf8')
  let value
  try {
    value = JSON.parse(source)
  } catch {
    throw new Error(`${MANIFEST_REPO_PATH} is not valid JSON.`)
  }
  return { manifest: validateManifest(value), sha256: sha256(source) }
}

async function walkFiles(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries.sort((left, right) =>
    left.name.localeCompare(right.name)
  )) {
    const absolutePath = path.join(directory, entry.name)
    assert(
      !entry.isSymbolicLink(),
      `Demo media sources cannot be symlinks: ${absolutePath}`
    )
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(absolutePath, root)))
      continue
    }
    assert(entry.isFile(), `Unsupported Demo media source: ${absolutePath}`)
    files.push({
      absolutePath,
      relativePath: path.relative(root, absolutePath).split(path.sep).join('/'),
    })
  }
  return files
}

function mediaType(relativePath, buffer) {
  if (relativePath.endsWith('.png')) {
    assert(
      buffer.subarray(0, 8).toString('hex') === '89504e470d0a1a0a',
      `${relativePath} is not a PNG.`
    )
    return 'image/png'
  }
  assert(
    buffer.subarray(0, 3).toString('hex') === 'ffd8ff',
    `${relativePath} is not a JPEG.`
  )
  return 'image/jpeg'
}

async function loadSources(manifest) {
  const directory = path.resolve(process.cwd(), manifest.asset_directory)
  const files = await walkFiles(directory)
  assert(
    files.length === manifest.expected_source_count,
    `Expected ${manifest.expected_source_count} Demo media sources; found ${files.length}.`
  )
  const sources = new Map()
  for (const file of files) {
    const relativePath = relativeMediaPath(
      file.relativePath,
      'Demo media source'
    )
    const buffer = await readFile(file.absolutePath)
    assert(buffer.length > 0, `${relativePath} is empty.`)
    sources.set(relativePath, {
      buffer,
      bytes: buffer.length,
      contentType: mediaType(relativePath, buffer),
      relativePath,
      sha256: sha256(buffer),
    })
  }
  const objects = [...sources.values()].map((source) => ({
    ...source,
    objectRelativePath: source.relativePath,
  }))
  for (const alias of manifest.aliases) {
    const source = sources.get(alias.source)
    assert(source, `Alias source is missing: ${alias.source}`)
    assert(
      !sources.has(alias.object),
      `Alias object collides with a source path: ${alias.object}`
    )
    objects.push({ ...source, objectRelativePath: alias.object })
  }
  objects.sort((left, right) =>
    left.objectRelativePath.localeCompare(right.objectRelativePath)
  )
  assert(
    objects.length === manifest.expected_object_count,
    `Expected ${manifest.expected_object_count} Demo media objects; found ${objects.length}.`
  )
  assert(
    new Set(objects.map((item) => item.objectRelativePath)).size ===
      objects.length,
    'Demo media object paths must be unique.'
  )
  return { objects, sources }
}

function metadataToken(metadata) {
  return text(metadata?.metadata?.firebaseStorageDownloadTokens)
    .split(',')
    .map(text)
    .filter(Boolean)
}

function missingObject(error) {
  return (
    Number(error?.code) === 404 ||
    text(error?.code) === 'storage/object-not-found'
  )
}

async function readRemoteObject(bucket, object) {
  const objectPath = miseboxDemoMediaObjectPath(object.objectRelativePath)
  const file = bucket.file(objectPath)
  let metadata
  try {
    ;[metadata] = await file.getMetadata()
  } catch (error) {
    if (missingObject(error)) return { exists: false, file, objectPath }
    throw error
  }
  const [buffer] = await file.download()
  const remoteSha256 = sha256(buffer)
  const blockers = []
  if (remoteSha256 !== object.sha256) blockers.push(`sha256 ${remoteSha256}`)
  if (text(metadata.contentType) !== object.contentType)
    blockers.push(`contentType ${text(metadata.contentType) || '(empty)'}`)
  if (text(metadata.cacheControl) !== CACHE_CONTROL)
    blockers.push(`cacheControl ${text(metadata.cacheControl) || '(empty)'}`)
  if (text(metadata?.metadata?.fireuxDemoMediaSha256) !== object.sha256)
    blockers.push('fireuxDemoMediaSha256 metadata')
  if (!metadataToken(metadata).includes(miseboxDemoMediaContract.downloadToken))
    blockers.push('download token')
  return {
    exists: true,
    blockers,
    file,
    generation: text(metadata.generation),
    objectPath,
    remoteSha256,
  }
}

async function mapLimit(values, limit, callback) {
  const result = new Array(values.length)
  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, async () => {
      while (next < values.length) {
        const index = next
        next += 1
        result[index] = await callback(values[index], index)
      }
    })
  )
  return result
}

function sourceHash(objects) {
  return sha256(
    JSON.stringify(
      objects.map((object) => ({
        bytes: object.bytes,
        content_type: object.contentType,
        object: object.objectRelativePath,
        sha256: object.sha256,
        source: object.relativePath,
      }))
    )
  )
}

async function buildPlan(bucket, manifestSha256, objects) {
  const remote = await mapLimit(objects, 8, (object) =>
    readRemoteObject(bucket, object)
  )
  const rows = objects.map((object, index) => ({
    action: remote[index].exists
      ? remote[index].blockers.length
        ? 'block'
        : 'reuse'
      : 'create',
    bytes: object.bytes,
    content_type: object.contentType,
    generation: remote[index].generation || '',
    object: remote[index].objectPath,
    relative_object: object.objectRelativePath,
    sha256: object.sha256,
    source: object.relativePath,
    blockers: remote[index].blockers || [],
  }))
  const currentSourceHash = sourceHash(objects)
  const planValue = {
    format: FORMAT,
    manifest_sha256: manifestSha256,
    source_sha256: currentSourceHash,
    target: {
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      storage_bucket: STORAGE_BUCKET,
      object_prefix: miseboxDemoMediaContract.objectPrefix,
    },
    rows,
  }
  return {
    rows,
    sourceSha256: currentSourceHash,
    sha256: sha256(JSON.stringify(planValue)),
    operations: {
      create: rows.filter((row) => row.action === 'create').length,
      reuse: rows.filter((row) => row.action === 'reuse').length,
      block: rows.filter((row) => row.action === 'block').length,
    },
  }
}

async function publishObject(bucket, object) {
  const current = await readRemoteObject(bucket, object)
  if (current.exists) {
    assert(
      !current.blockers.length,
      `${current.objectPath} exists but is not an exact reusable Demo object: ${current.blockers.join(', ')}`
    )
    return {
      action: 'reuse',
      generation: current.generation,
      objectPath: current.objectPath,
    }
  }
  await current.file.save(object.buffer, {
    resumable: false,
    validation: 'md5',
    preconditionOpts: { ifGenerationMatch: 0 },
    metadata: {
      contentType: object.contentType,
      cacheControl: CACHE_CONTROL,
      metadata: {
        firebaseStorageDownloadTokens: miseboxDemoMediaContract.downloadToken,
        fireuxDemoMediaContract: FORMAT,
        fireuxDemoMediaSha256: object.sha256,
        fireuxDemoMediaSource: object.relativePath,
      },
    },
  })
  const verified = await readRemoteObject(bucket, object)
  assert(
    verified.exists && !verified.blockers.length,
    `${current.objectPath} failed post-upload verification.`
  )
  return {
    action: 'create',
    generation: verified.generation,
    objectPath: verified.objectPath,
  }
}

async function verifyPublicUrl(object) {
  const url = miseboxDemoMediaUrl(object.objectRelativePath)
  const response = await fetch(url, { method: 'HEAD', redirect: 'error' })
  assert(
    response.ok,
    `${object.objectRelativePath} public URL returned HTTP ${response.status}.`
  )
  const contentType = text(response.headers.get('content-type')).split(';')[0]
  assert(
    contentType === object.contentType,
    `${object.objectRelativePath} public URL returned ${contentType || '(no content type)'}.`
  )
}

function usage() {
  console.log(`
Publish exactly 73 immutable public Misebox Demo media objects from 68 reviewed source images.

Dry-run (read-only):
  node scripts/publish-misebox-demo-media.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} --bucket ${STORAGE_BUCKET}

Apply (Storage creates only; no Firestore writes):
  node scripts/publish-misebox-demo-media.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} --bucket ${STORAGE_BUCKET} \\
    --apply --confirm ${TARGET_CONFIRMATION} \\
    --confirm-manifest <reviewed-manifest-sha256> \\
    --confirm-source <reviewed-source-sha256> \\
    --confirm-plan <reviewed-plan-sha256>

The publisher never overwrites or deletes. Existing objects are reused only
when bytes, MIME type, immutable cache policy, checksum metadata, and download
token all match. A partial apply is replay-safe.

Credential sources:
${firebaseAdminCredentialHelp()
  .map((line) => `  - ${line}`)
  .join('\n')}
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
  const { objects, sources } = await loadSources(manifest)
  let app
  try {
    const credential = await resolveFirebaseAdminCredential({
      args: options.serviceAccount
        ? { 'service-account': options.serviceAccount }
        : {},
      scope: 'misebox',
      projectId: PROJECT_ID,
    })
    assert(
      !credential.projectId || credential.projectId === PROJECT_ID,
      `Credential resolves to ${credential.projectId}, not ${PROJECT_ID}.`
    )
    app = initializeApp(
      {
        credential: credential.credential,
        projectId: PROJECT_ID,
        storageBucket: STORAGE_BUCKET,
      },
      `${OPERATION}-${process.pid}-${Date.now()}`
    )
    const bucket = getStorage(app).bucket(STORAGE_BUCKET)
    const plan = await buildPlan(bucket, manifestSha256, objects)
    if (!options.apply) {
      console.log(
        JSON.stringify(
          {
            mode: 'dry-run',
            read_only: true,
            target: {
              app_id: APP_ID,
              project_id: PROJECT_ID,
              database_id: DATABASE_ID,
              storage_bucket: STORAGE_BUCKET,
              object_prefix: miseboxDemoMediaContract.objectPrefix,
            },
            credential_source: credential.source,
            manifest: {
              path: MANIFEST_REPO_PATH,
              sha256: manifestSha256,
              source_count: sources.size,
              object_count: objects.length,
            },
            source_sha256: plan.sourceSha256,
            plan: {
              sha256: plan.sha256,
              operations: plan.operations,
              rows: plan.rows,
            },
            next_gate: `Apply additionally requires --apply, --confirm ${TARGET_CONFIRMATION}, and the exact manifest, source, and plan hashes above.`,
          },
          null,
          2
        )
      )
      return
    }
    assert(
      options.confirmSource === plan.sourceSha256,
      `Reviewed source hash mismatch. Review a fresh dry-run: ${plan.sourceSha256}`
    )
    assert(
      options.confirmPlan === plan.sha256,
      `Reviewed plan hash mismatch. Review a fresh dry-run: ${plan.sha256}`
    )
    assert(
      plan.operations.block === 0,
      `Refusing to apply with ${plan.operations.block} conflicting object(s).`
    )
    const published = await mapLimit(objects, 4, (object) =>
      publishObject(bucket, object)
    )
    const verifiedPlan = await buildPlan(bucket, manifestSha256, objects)
    assert(
      verifiedPlan.operations.create === 0 &&
        verifiedPlan.operations.block === 0 &&
        verifiedPlan.operations.reuse === objects.length,
      'Post-upload remote inventory is incomplete.'
    )
    await mapLimit(objects, 8, verifyPublicUrl)
    console.log(
      JSON.stringify(
        {
          mode: 'apply',
          target: {
            app_id: APP_ID,
            project_id: PROJECT_ID,
            database_id: DATABASE_ID,
            storage_bucket: STORAGE_BUCKET,
            object_prefix: miseboxDemoMediaContract.objectPrefix,
          },
          manifest_sha256: manifestSha256,
          source_sha256: plan.sourceSha256,
          plan_sha256: plan.sha256,
          credential_source: credential.source,
          operations: {
            created: published.filter((item) => item.action === 'create')
              .length,
            reused: published.filter((item) => item.action === 'reuse').length,
            verified: objects.length,
          },
        },
        null,
        2
      )
    )
  } finally {
    if (app) await deleteApp(app)
  }
}

main().catch((error) => {
  console.error(
    `[${OPERATION}] ${error instanceof Error ? error.message : String(error)}`
  )
  process.exitCode = 1
})
