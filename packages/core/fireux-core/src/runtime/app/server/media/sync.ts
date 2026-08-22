import { useRuntimeConfig } from '#imports'
import { createError, type H3Event } from 'h3'
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { extname, join, resolve as pathResolve } from 'node:path'
import {
  FieldValue,
  type DocumentData,
  type UpdateData,
} from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import imageSize from 'image-size'
import { FIRESTORE_MUTATION_TARGETS } from '../../../utils/firestore-mutations/targets'
import { serverUpdate } from '../../../server/utils/firestore-mutations/server-update'
import { requireDevDeveloper } from '../../../server/utils/auth/developer'
import { getAdminApp } from '../../../server/utils/getAdmin'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import {
  APP_IMAGE_SYNC_KINDS,
  appImageFirestoreField,
  appImageLocalPublicPath,
  appImageRequirement,
  appImageStoragePath,
  validateAppAssetDimensions,
  type AppImageKind,
  type AppMediaSyncFailure,
  type AppMediaSyncResponse,
} from '../../composables/firestore/utils/appMedia'

function findRepoRoot(start: string): string {
  let current = start

  for (let i = 0; i < 10; i += 1) {
    if (
      existsSync(join(current, 'pnpm-workspace.yaml')) ||
      existsSync(join(current, '.git'))
    ) {
      return current
    }

    const parent = pathResolve(current, '..')
    if (parent === current) break
    current = parent
  }

  return current
}

function normalizeBucketName(bucket?: string | null): string {
  const trimmed = String(bucket || '').trim()
  return trimmed.startsWith('gs://') ? trimmed.slice(5) : trimmed
}

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

function buildFirebaseDownloadUrl(
  bucketName: string,
  objectPath: string,
  token: string
): string {
  return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucketName)}/o/${encodeURIComponent(objectPath)}?alt=media&token=${encodeURIComponent(token)}`
}

function cacheBust(url: string): string {
  const stamp = Date.now().toString(36)
  return url.includes('?') ? `${url}&v=${stamp}` : `${url}?v=${stamp}`
}

function createLocalAssetResolver(
  repoRoot: string,
  ecosystem: string,
  appId: string
) {
  const candidates = [
    join(process.cwd(), 'public'),
    join(repoRoot, 'projects', ecosystem, appId, 'public'),
    join(repoRoot, 'projects', ecosystem, `${ecosystem}-app`, 'public'),
  ]

  return (publicPath: string): string | null => {
    const relative = publicPath.replace(/^\/+/, '')
    for (const baseDir of candidates) {
      const absPath = join(baseDir, relative)
      if (existsSync(absPath)) return absPath
    }
    return null
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

  const objectPath = appImageStoragePath(appId, kind)
  const token = randomUUID()
  const bucket = getStorage(getAdminApp()).bucket(bucketName)

  await bucket.file(objectPath).save(buffer, {
    resumable: false,
    metadata: {
      contentType: mimeTypeForPath(absPath),
      cacheControl: 'public,max-age=31536000,immutable',
      metadata: {
        firebaseStorageDownloadTokens: token,
      },
    },
  })

  return cacheBust(buildFirebaseDownloadUrl(bucketName, objectPath, token))
}

export async function syncConfiguredAppMedia(event: H3Event) {
  const { uid } = await requireDevDeveloper(event)
  const runtime = useRuntimeConfig(event)
  const fireux = useFireUXConfig(event)
  const appId = fireux.appId
  const ecosystem = fireux.ecosystem
  const configuredBucket = normalizeBucketName(
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

  for (const kind of APP_IMAGE_SYNC_KINDS) {
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
    await serverUpdate(FIRESTORE_MUTATION_TARGETS.runtimeApps, appId, patch)
  }

  return {
    appId,
    uploaded,
    failed,
  } satisfies AppMediaSyncResponse
}
