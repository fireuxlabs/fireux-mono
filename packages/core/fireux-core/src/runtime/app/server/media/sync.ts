import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { type DocumentData, type UpdateData } from 'firebase-admin/firestore'
import imageSize from 'image-size'
import { FIRESTORE_MUTATION_TARGETS } from '../../../utils/firestore-mutations/targets'
import { serverUpdate } from '../../../server/utils/firestore-mutations/server-update'
import { requireDevDeveloper } from '../../../server/utils/auth/developer'
import {
  saveStorageFileWithDownloadToken,
  normalizeStorageBucketName,
} from '../../../server/utils/uploads/storage'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import {
  APP_IMAGE_SYNC_KINDS,
  type AppImageKind,
  type AppMediaSyncFailure,
  type AppMediaSyncResponse,
} from '../../models/app-media'
import { findRepoRoot } from '../../../server/utils/files/repository-root'
import {
  appImageFirestoreField,
  appImageLocalPublicPath,
  appImageRequirement,
  appImageStoragePath,
  validateAppAssetDimensions,
} from '../../utils/app-media'

function mimeTypeForPath(path: string): string {
  switch (extname(path).toLowerCase()) {
    case '.png':
      return 'image/png'
    case '.svg':
      return 'image/svg+xml'
    case '.ico':
      return 'image/x-icon'
    default:
      return 'application/octet-stream'
  }
}

function createLocalAssetResolver(
  repoRoot: string,
  ecosystem: string,
  appId: string
) {
  const publicRoot = join(repoRoot, 'projects', ecosystem, appId, 'public')

  return (publicPath: string): string | null => {
    const relative = publicPath.replace(/^\/+/, '')
    const absPath = join(publicRoot, relative)
    return existsSync(absPath) ? absPath : null
  }
}

async function uploadLocalAsset(
  bucketName: string,
  appId: string,
  kind: AppImageKind,
  resolveLocalAsset: (publicPath: string) => string | null
) {
  const localPublicPath = appImageLocalPublicPath(kind)
  const absPath = resolveLocalAsset(localPublicPath)

  if (!absPath) {
    throw new Error(`Missing local asset: ${localPublicPath}`)
  }

  const buffer = readFileSync(absPath)
  if (!buffer.length) {
    throw new Error(`Empty local asset: ${localPublicPath}`)
  }

  let dimensions: ReturnType<typeof imageSize>
  try {
    dimensions = imageSize(buffer)
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : 'Unable to read image metadata'
    throw new Error(`Invalid local asset ${localPublicPath}: ${message}`)
  }

  const requirement = appImageRequirement(kind)
  const dimensionError = validateAppAssetDimensions(
    requirement.label,
    {
      width: dimensions.width,
      height: dimensions.height,
      type: dimensions.type,
    },
    requirement.dimensions
  )
  if (dimensionError) {
    throw new Error(`${localPublicPath}: ${dimensionError}`)
  }

  // App-owned revisions: apps/{appId}/img/app/revisions/{uuid}/{role}.
  const rolePath = appImageStoragePath(appId, kind)
  const saved = await saveStorageFileWithDownloadToken({
    bucketName,
    objectPath: join(
      dirname(rolePath),
      'revisions',
      randomUUID(),
      basename(rolePath)
    ),
    data: buffer,
    contentType: mimeTypeForPath(absPath),
    cacheControl: 'public,max-age=31536000,immutable',
  })

  // Never overwrite or remove a URL that another request may still publish or display.
  return saved.fileUrl
}

export async function syncConfiguredAppMedia(event: H3Event, input?: unknown) {
  await requireDevDeveloper(event)
  if (
    input !== undefined &&
    (!input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).some((key) => key !== 'kinds'))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid App media request.',
    })
  }
  const requestedKinds = (input as { kinds?: unknown } | undefined)?.kinds
  if (
    requestedKinds !== undefined &&
    (!Array.isArray(requestedKinds) ||
      !requestedKinds.length ||
      requestedKinds.some((kind) => !APP_IMAGE_SYNC_KINDS.includes(kind)))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Select valid App image kinds.',
    })
  }
  const kinds =
    requestedKinds === undefined
      ? APP_IMAGE_SYNC_KINDS
      : [...new Set(requestedKinds as AppImageKind[])]
  const runtime = useRuntimeConfig(event)
  const fireux = useFireUXConfig(event)
  const appId = fireux.appId
  const ecosystem = fireux.ecosystem
  const configuredBucket = normalizeStorageBucketName(
    runtime.public?.firebaseEcosystem?.firebase?.storageBucket
  )

  if (!appId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing appId for media sync.',
    })
  }

  if (!ecosystem) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing runtime ecosystem for media sync.',
    })
  }

  if (!configuredBucket) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing Firebase Storage bucket configuration.',
    })
  }

  const repoRoot = findRepoRoot(process.cwd())
  const resolveLocalAsset = createLocalAssetResolver(repoRoot, ecosystem, appId)
  const uploaded: AppMediaSyncResponse['uploaded'] = {}
  const failed: AppMediaSyncFailure[] = []

  for (const kind of kinds) {
    try {
      uploaded[kind] = await uploadLocalAsset(
        configuredBucket,
        appId,
        kind,
        resolveLocalAsset
      )
    } catch (error) {
      failed.push({
        kind,
        message:
          error instanceof Error && error.message.trim()
            ? error.message.trim()
            : 'Upload failed',
      })
    }
  }

  const patch: UpdateData<DocumentData> = {}

  for (const [kind, url] of Object.entries(uploaded) as Array<
    [AppImageKind, string | undefined]
  >) {
    if (!url) continue
    patch[appImageFirestoreField(kind)] = url
  }

  if (Object.keys(patch).length) {
    // Retain immutable revisions on failure: the update may have committed despite an error.
    await serverUpdate(FIRESTORE_MUTATION_TARGETS.runtimeApps, appId, patch)
  }

  return {
    appId,
    uploaded,
    failed,
  } satisfies AppMediaSyncResponse
}
