#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-07-29
// usage_note: plan, create, and verify immutable public media for the read-only Misebox Demo World.

import { createHash } from 'node:crypto'
import { lstat, readFile, realpath } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { deleteApp, initializeApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import {
  miseboxDemoMediaContract,
  miseboxDemoMediaObjectPath,
  miseboxDemoMediaUrl,
} from '../packages/extensions/fireux-demo/src/runtime/media/misebox.ts'
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
const MANIFEST_FORMAT = 'fireux-misebox-demo-media-manifest/2'
const OBJECT_CONTRACT = 'fireux-misebox-demo-media/1'
const CACHE_CONTROL = 'public,max-age=31536000,immutable'
const MANIFEST_REPO_PATH = 'scripts/data/misebox-demo-media/manifest.json'
const MANIFEST_PATH = fileURLToPath(
  new URL('./data/misebox-demo-media/manifest.json', import.meta.url)
)
const REPO_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const VALUE_OPTIONS = new Set([
  'bucket',
  'confirm',
  'confirm-manifest',
  'confirm-plan',
  'confirm-source',
  'database',
  'project',
  'service-account',
  'source-directory',
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
    'confirm-plan',
    'confirm-source',
  ].filter((key) => args[key] !== undefined)
  if (apply) {
    assert(
      text(args.confirm) === TARGET_CONFIRMATION,
      `Apply requires --confirm ${TARGET_CONFIRMATION}.`
    )
    for (const key of ['confirm-manifest', 'confirm-plan']) {
      assert(
        /^[a-f0-9]{64}$/.test(text(args[key])),
        `Apply requires --${key} <reviewed-sha256>.`
      )
    }
    if (args['confirm-source'] !== undefined) {
      assert(
        /^[a-f0-9]{64}$/.test(text(args['confirm-source'])),
        'Apply --confirm-source requires a reviewed SHA-256 hash.'
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
    sourceDirectory: text(args['source-directory']),
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
    ['format', 'object_contract', 'policy', 'target', 'sources', 'objects'],
    ['format', 'object_contract', 'policy', 'target', 'sources', 'objects'],
    'Manifest'
  )
  assert(
    value.format === MANIFEST_FORMAT,
    'Demo media manifest format is invalid.'
  )
  assert(
    value.object_contract === OBJECT_CONTRACT,
    'Demo media object contract is invalid.'
  )
  assert(
    value.policy ===
      'Firebase Storage is authoritative; repository stores metadata only; create or reuse exact immutable objects; never overwrite, delete, or write Firestore',
    'Demo media manifest policy is invalid.'
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
  assert(isPlainObject(value.sources), 'Manifest sources must be an object.')
  const sources = new Map(
    Object.entries(value.sources)
      .map(([relativePath, descriptor], index) => {
        const sourceRelativePath = relativeMediaPath(
          relativePath,
          `Manifest source ${index}`
        )
        exactKeys(
          descriptor,
          ['bytes', 'content_type', 'sha256'],
          ['bytes', 'content_type', 'sha256'],
          `Manifest source ${sourceRelativePath}`
        )
        const expectedContentType = sourceRelativePath.endsWith('.png')
          ? 'image/png'
          : 'image/jpeg'
        assert(
          Number.isInteger(descriptor.bytes) && descriptor.bytes > 0,
          `Manifest source ${sourceRelativePath} requires a positive byte count.`
        )
        assert(
          descriptor.content_type === expectedContentType,
          `Manifest source ${sourceRelativePath} has the wrong content type.`
        )
        assert(
          /^[a-f0-9]{64}$/.test(text(descriptor.sha256)),
          `Manifest source ${sourceRelativePath} requires a SHA-256 hash.`
        )
        return [
          sourceRelativePath,
          {
            bytes: descriptor.bytes,
            contentType: expectedContentType,
            sourceRelativePath,
            sha256: descriptor.sha256,
          },
        ]
      })
      .sort(([left], [right]) => left.localeCompare(right))
  )
  assert(sources.size > 0, 'Manifest requires at least one source.')
  assert(
    new Set([...sources.values()].map((source) => source.sha256)).size ===
      sources.size,
    'Manifest source payload hashes must be unique.'
  )
  assert(isPlainObject(value.objects), 'Manifest objects must be an object.')
  const objects = Object.entries(value.objects)
    .map(([relativePath, sourcePath]) => {
      const objectRelativePath = relativeMediaPath(
        relativePath,
        'Manifest object path'
      )
      const sourceRelativePath = relativeMediaPath(
        sourcePath,
        `Manifest object ${objectRelativePath} source`
      )
      const source = sources.get(sourceRelativePath)
      assert(
        source,
        `Manifest object ${objectRelativePath} references missing source ${sourceRelativePath}.`
      )
      assert(
        (objectRelativePath.endsWith('.png') ? 'image/png' : 'image/jpeg') ===
          source.contentType,
        `Manifest object ${objectRelativePath} and source ${sourceRelativePath} require the same media type.`
      )
      return {
        ...source,
        objectRelativePath,
      }
    })
    .sort((left, right) =>
      left.objectRelativePath.localeCompare(right.objectRelativePath)
    )
  assert(
    objects.length >= sources.size,
    'Manifest requires at least one object per source.'
  )
  assert(
    new Set(objects.map((object) => object.objectRelativePath)).size ===
      objects.length,
    'Manifest object paths must be unique.'
  )
  assert(
    new Set(objects.map((object) => object.sourceRelativePath)).size ===
      sources.size,
    'Every manifest source must be referenced by an object.'
  )
  return { ...value, objects, sources: [...sources.values()] }
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

async function preflightExternalSources(sourceDirectory, requiredSources) {
  const buffers = new Map()
  if (!requiredSources.length) return { buffers, sha256: '' }
  assert(
    sourceDirectory,
    'Creating Demo media requires --source-directory <absolute-path>.'
  )
  assert(
    path.isAbsolute(sourceDirectory),
    '--source-directory must be an absolute path outside the repository.'
  )
  const [canonicalRepository, canonicalSourceDirectory] = await Promise.all([
    realpath(REPO_ROOT),
    realpath(sourceDirectory),
  ])
  const repositoryRelative = path.relative(
    canonicalRepository,
    canonicalSourceDirectory
  )
  assert(
    repositoryRelative.startsWith('..') || path.isAbsolute(repositoryRelative),
    '--source-directory must stay outside the repository; Storage is the media authority.'
  )
  const aggregate = createHash('sha256')
  for (const source of [...requiredSources].sort((left, right) =>
    left.sourceRelativePath.localeCompare(right.sourceRelativePath)
  )) {
    const requestedPath = path.join(
      canonicalSourceDirectory,
      source.sourceRelativePath
    )
    const requestedStat = await lstat(requestedPath)
    assert(
      requestedStat.isFile() && !requestedStat.isSymbolicLink(),
      `Demo media source must be a regular non-symlink file: ${requestedPath}`
    )
    const canonicalPath = await realpath(requestedPath)
    const sourceRelative = path.relative(
      canonicalSourceDirectory,
      canonicalPath
    )
    assert(
      sourceRelative &&
        !sourceRelative.startsWith('..') &&
        !path.isAbsolute(sourceRelative),
      `Demo media source escapes --source-directory: ${requestedPath}`
    )
    const buffer = await readFile(canonicalPath)
    assert(
      buffer.length === source.bytes,
      `${requestedPath} has ${buffer.length} bytes; expected ${source.bytes}.`
    )
    assert(
      mediaType(source.sourceRelativePath, buffer) === source.contentType,
      `${requestedPath} has the wrong media type.`
    )
    const actualSha256 = sha256(buffer)
    assert(
      actualSha256 === source.sha256,
      `${requestedPath} SHA-256 ${actualSha256} does not match the reviewed manifest.`
    )
    buffers.set(source.sourceRelativePath, buffer)
    aggregate.update(source.sourceRelativePath)
    aggregate.update('\0')
    aggregate.update(buffer)
  }
  return { buffers, sha256: aggregate.digest('hex') }
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
  if (buffer.length !== object.bytes)
    blockers.push(`bytes ${buffer.length}; expected ${object.bytes}`)
  if (remoteSha256 !== object.sha256) blockers.push(`sha256 ${remoteSha256}`)
  if (text(metadata.contentType) !== object.contentType)
    blockers.push(`contentType ${text(metadata.contentType) || '(empty)'}`)
  if (text(metadata.cacheControl) !== CACHE_CONTROL)
    blockers.push(`cacheControl ${text(metadata.cacheControl) || '(empty)'}`)
  if (text(metadata?.metadata?.fireuxDemoMediaSha256) !== object.sha256)
    blockers.push('fireuxDemoMediaSha256 metadata')
  if (text(metadata?.metadata?.fireuxDemoMediaContract) !== OBJECT_CONTRACT) {
    blockers.push('fireuxDemoMediaContract metadata')
  }
  if (
    text(metadata?.metadata?.fireuxDemoMediaSource) !==
    object.sourceRelativePath
  ) {
    blockers.push('fireuxDemoMediaSource metadata')
  }
  if (!metadataToken(metadata).includes(miseboxDemoMediaContract.downloadToken))
    blockers.push('download token')
  return {
    bytes: buffer.length,
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

function inventoryHash(objects) {
  return sha256(
    JSON.stringify(
      objects.map((object) => ({
        bytes: object.bytes,
        content_type: object.contentType,
        object: object.objectRelativePath,
        sha256: object.sha256,
        source: object.sourceRelativePath,
      }))
    )
  )
}

async function buildPlan(bucket, manifestSha256, objects) {
  const objectPrefix = `${miseboxDemoMediaContract.objectPrefix}/`
  const [remote, listed] = await Promise.all([
    mapLimit(objects, 8, (object) => readRemoteObject(bucket, object)),
    bucket.getFiles({ prefix: objectPrefix }),
  ])
  const expectedObjectPaths = new Set(
    objects.map((object) =>
      miseboxDemoMediaObjectPath(object.objectRelativePath)
    )
  )
  const unexpectedObjects = listed[0]
    .map((file) => file.name)
    .filter((objectPath) => !expectedObjectPaths.has(objectPath))
    .sort()
  const rows = objects.map((object, index) => ({
    action: remote[index].exists
      ? remote[index].blockers.length
        ? 'block'
        : 'reuse'
      : 'create',
    bytes: remote[index].bytes || 0,
    content_type: object.contentType,
    generation: remote[index].generation || '',
    object: remote[index].objectPath,
    relative_object: object.objectRelativePath,
    sha256: object.sha256,
    source: object.sourceRelativePath,
    blockers: remote[index].blockers || [],
  }))
  const currentInventoryHash = inventoryHash(objects)
  const planValue = {
    format: MANIFEST_FORMAT,
    manifest_sha256: manifestSha256,
    inventory_sha256: currentInventoryHash,
    target: {
      project_id: PROJECT_ID,
      database_id: DATABASE_ID,
      storage_bucket: STORAGE_BUCKET,
      object_prefix: miseboxDemoMediaContract.objectPrefix,
    },
    rows,
    unexpected_objects: unexpectedObjects,
  }
  return {
    rows,
    unexpectedObjects,
    inventorySha256: currentInventoryHash,
    sha256: sha256(JSON.stringify(planValue)),
    operations: {
      create: rows.filter((row) => row.action === 'create').length,
      reuse: rows.filter((row) => row.action === 'reuse').length,
      block:
        rows.filter((row) => row.action === 'block').length +
        unexpectedObjects.length,
      unexpected: unexpectedObjects.length,
    },
  }
}

async function publishObject(bucket, object, sourceBuffers) {
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
  const buffer = sourceBuffers.get(object.sourceRelativePath)
  assert(
    buffer,
    `Preflight source is missing for ${object.objectRelativePath}: ${object.sourceRelativePath}`
  )
  await current.file.save(buffer, {
    resumable: false,
    validation: 'md5',
    preconditionOpts: { ifGenerationMatch: 0 },
    metadata: {
      contentType: object.contentType,
      cacheControl: CACHE_CONTROL,
      metadata: {
        firebaseStorageDownloadTokens: miseboxDemoMediaContract.downloadToken,
        fireuxDemoMediaContract: OBJECT_CONTRACT,
        fireuxDemoMediaSha256: object.sha256,
        fireuxDemoMediaSource: object.sourceRelativePath,
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
Audit exactly 73 immutable public Misebox Demo media objects representing 68
reviewed payloads. Firebase Storage is authoritative; image binaries do not
live in this repository.

Remote audit (read-only):
  node scripts/publish-misebox-demo-media.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} --bucket ${STORAGE_BUCKET}

Apply (Storage creates only; no Firestore writes or repository source mirror):
  node scripts/publish-misebox-demo-media.mjs \\
    --project ${PROJECT_ID} --database ${DATABASE_ID} --bucket ${STORAGE_BUCKET} \\
    --apply --confirm ${TARGET_CONFIRMATION} \\
    --confirm-manifest <reviewed-manifest-sha256> \\
    --confirm-plan <reviewed-plan-sha256> \\
    --confirm-source <reviewed-external-source-sha256> \\
    --source-directory /absolute/external/reviewed-media

The external directory is needed only when the reviewed plan contains creates.
Its 68-file layout mirrors the manifest source paths. Rerun the read-only
audit with --source-directory first to preflight all planned source bytes and
obtain the source hash required by apply.

The publisher never overwrites or deletes. Existing objects are reused only
when the exact prefix inventory, bytes, MIME type, immutable cache policy,
checksum/contract/source metadata, and download token all match. A partial
apply is replay-safe.

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
  const objects = manifest.objects
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
    const createSourcePaths = new Set(
      plan.rows
        .filter((row) => row.action === 'create')
        .map((row) => row.source)
    )
    const requiredSources = manifest.sources.filter((source) =>
      createSourcePaths.has(source.sourceRelativePath)
    )
    const sourcePreflight =
      requiredSources.length && (options.apply || options.sourceDirectory)
        ? await preflightExternalSources(
            options.sourceDirectory,
            requiredSources
          )
        : { buffers: new Map(), sha256: '' }
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
              source_count: manifest.sources.length,
              object_count: objects.length,
            },
            inventory_sha256: plan.inventorySha256,
            source_preflight: {
              required_count: requiredSources.length,
              reviewed: requiredSources.length
                ? Boolean(sourcePreflight.sha256)
                : true,
              sha256: sourcePreflight.sha256,
            },
            plan: {
              sha256: plan.sha256,
              operations: plan.operations,
              rows: plan.rows,
              unexpected_objects: plan.unexpectedObjects,
            },
            next_gate: `Apply additionally requires --apply, --confirm ${TARGET_CONFIRMATION}, the exact manifest and plan hashes above, and the preflighted external source directory/hash when creates are planned.`,
          },
          null,
          2
        )
      )
      return
    }
    assert(
      options.confirmPlan === plan.sha256,
      `Reviewed plan hash mismatch. Review a fresh dry-run: ${plan.sha256}`
    )
    assert(
      plan.operations.block === 0,
      `Refusing to apply with ${plan.operations.block} conflicting object(s).`
    )
    if (requiredSources.length) {
      assert(
        options.confirmSource === sourcePreflight.sha256,
        `Reviewed external source hash mismatch. Rerun the read-only audit with --source-directory: ${sourcePreflight.sha256}`
      )
    } else {
      assert(
        !options.confirmSource,
        '--confirm-source is only valid when the reviewed plan contains creates.'
      )
    }
    const published = await mapLimit(objects, 4, (object) =>
      publishObject(bucket, object, sourcePreflight.buffers)
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
          inventory_sha256: plan.inventorySha256,
          plan_sha256: plan.sha256,
          source_sha256: sourcePreflight.sha256,
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
