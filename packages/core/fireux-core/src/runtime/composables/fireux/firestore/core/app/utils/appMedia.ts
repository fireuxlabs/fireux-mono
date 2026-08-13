// Canonical App media naming:
// - Local files: public/img/app/{thumbnail|logo|wordmark-light|wordmark-dark|cover}.*
// - Browser URLs: /img/app/{thumbnail|logo|wordmark-light|wordmark-dark|cover}.*
// - Storage objects: apps/<appId>/img/app/{thumbnail|logo|wordmark-light|wordmark-dark|cover}.png
// - Firestore fields:
//   {media.thumbnail_url|media.logo_url|media.wordmark_light_url|media.wordmark_dark_url|media.cover_url}
import { normalizePublicImgAsset } from '../../../../../../../utils/brandAssets'

export type AppImageKind =
  | 'thumbnail'
  | 'logo'
  | 'wordmarkLight'
  | 'wordmarkDark'
  | 'cover'

export type AppLocalOnlyAssetKind = 'favicon' | 'pwaIcon192' | 'pwaIcon512'
export type AppPublicAssetKind = AppImageKind | AppLocalOnlyAssetKind

export const APP_IMAGE_SYNC_KINDS = [
  'thumbnail',
  'logo',
  'wordmarkLight',
  'wordmarkDark',
  'cover',
] as const satisfies readonly AppImageKind[]

export type AppMediaSyncFailure = {
  kind: AppImageKind
  message: string
}

export type AppMediaSyncResponse = {
  appId: string
  uploaded: Partial<Record<AppImageKind, string>>
  failed: AppMediaSyncFailure[]
}

type AppMediaRecordLike = {
  thumbnail_url?: string
  logo_url?: string
  wordmark_light_url?: string
  wordmark_dark_url?: string
  cover_url?: string
}

export type AppImageFirestoreField =
  | 'media.thumbnail_url'
  | 'media.logo_url'
  | 'media.wordmark_light_url'
  | 'media.wordmark_dark_url'
  | 'media.cover_url'

export type AppAssetDimensions = {
  width?: number
  height?: number
  type?: string
}

export type AppAssetDimensionConstraints = {
  requiredWidth?: number
  requiredHeight?: number
  minWidth?: number
  minHeight?: number
  aspectRatio?: number
  aspectTolerance?: number
  minAspect?: number
  acceptedTypes?: readonly string[]
}

export type AppPublicAssetRequirement = {
  key: AppPublicAssetKind
  label: string
  localPublicPath: string
  localRelativePath: string
  requirementsText: string
  requirementsHtml: string
  dimensions: AppAssetDimensionConstraints
  syncKind?: AppImageKind
  storageObjectName?: string
  firestoreField?: AppImageFirestoreField
}

import {
  APP_IMAGE_FIRESTORE_FIELDS,
  APP_IMAGE_LOCAL_PUBLIC_PATHS,
  APP_IMAGE_RELATIVE_PATHS,
  APP_PUBLIC_ASSET_REQUIREMENTS,
  APP_SYNCABLE_IMAGE_REQUIREMENTS,
} from './app-media-requirements'

export {
  APP_LOCAL_ONLY_ASSET_REQUIREMENTS,
  APP_PUBLIC_ASSET_REQUIREMENTS,
  APP_SYNCABLE_IMAGE_REQUIREMENTS,
} from './app-media-requirements'

export function appImageRequirement(kind: AppImageKind): AppPublicAssetRequirement {
  const requirement = APP_SYNCABLE_IMAGE_REQUIREMENTS.find(
    (asset) => asset.syncKind === kind
  )
  if (!requirement) {
    throw new Error(`[appMedia] Missing syncable app image requirement: ${kind}`)
  }
  return requirement
}

export function appPublicAssetRequirement(
  kind: AppPublicAssetKind
): AppPublicAssetRequirement {
  const requirement = APP_PUBLIC_ASSET_REQUIREMENTS.find(
    (asset) => asset.key === kind
  )
  if (!requirement) {
    throw new Error(`[appMedia] Missing app asset requirement: ${kind}`)
  }
  return requirement
}

function acceptedTypesLabel(types: readonly string[] | undefined) {
  const values = types?.length ? types : ['png']
  return values.map((type) => type.toUpperCase()).join(' or ')
}

export function validateAppAssetDimensions(
  _name: string,
  dim: AppAssetDimensions,
  constraints: AppAssetDimensionConstraints
): string | null {
  const type = (dim.type || '').toLowerCase()
  if (!type) return 'Unknown file type'

  const acceptedTypes = constraints.acceptedTypes ?? ['png']
  if (acceptedTypes.length && !acceptedTypes.includes(type)) {
    return `Must be ${acceptedTypesLabel(acceptedTypes)}`
  }

  const width = dim.width ?? 0
  const height = dim.height ?? 0

  if (constraints.requiredWidth && constraints.requiredHeight) {
    if (
      width === constraints.requiredWidth &&
      height === constraints.requiredHeight
    ) {
      return null
    }
    return `Must be exactly ${constraints.requiredWidth}x${constraints.requiredHeight} (got ${width}x${height})`
  }

  if (constraints.minWidth && width < constraints.minWidth) {
    return `Must be at least ${constraints.minWidth}px wide (got ${width}px)`
  }

  if (constraints.minHeight && height < constraints.minHeight) {
    return `Must be at least ${constraints.minHeight}px tall (got ${height}px)`
  }

  if (constraints.aspectRatio) {
    const tolerance = constraints.aspectTolerance ?? 0
    const aspect = height > 0 ? width / height : 0
    if (Math.abs(aspect - constraints.aspectRatio) > tolerance) {
      return `Must use ${constraints.aspectRatio.toFixed(2)}:1 aspect (got ${width}x${height})`
    }
  }

  if (constraints.minAspect) {
    const aspect = height > 0 ? width / height : 0
    if (aspect < constraints.minAspect) {
      return `Must use aspect at least ${constraints.minAspect}:1 (got ${width}x${height})`
    }
  }

  return null
}

export function appImageStoragePath(appId: string, kind: AppImageKind): string {
  // The owner prefix changes; the canonical role path and filename do not.
  return `apps/${appId}/${APP_IMAGE_RELATIVE_PATHS[kind]}`
}

export function appImageLocalPublicPath(kind: AppImageKind): string {
  return APP_IMAGE_LOCAL_PUBLIC_PATHS[kind]
}

export type AppImageSourceResolution = {
  kind: AppImageKind
  relativePath: string
  localUrl: string
  storageUrl: string
  candidates: readonly string[]
}

/**
 * Resolve one canonical App image role without changing its language.
 * The owning App may try its bundled file first, then the recorded Storage URL.
 * Cross-App consumers set `owningAppBundle` false and receive Storage only.
 */
export function resolveAppImageSources(
  kind: AppImageKind,
  storageUrl: unknown,
  options: { owningAppBundle: boolean }
): AppImageSourceResolution {
  const localUrl = appImageLocalPublicPath(kind)
  const resolvedStorageUrl = safeUrl(storageUrl)
  const candidates = options.owningAppBundle
    ? [localUrl, resolvedStorageUrl].filter(Boolean)
    : [resolvedStorageUrl].filter(Boolean)

  return {
    kind,
    relativePath: APP_IMAGE_RELATIVE_PATHS[kind],
    localUrl,
    storageUrl: resolvedStorageUrl,
    candidates,
  }
}

export function appImageFirestoreField(kind: AppImageKind): AppImageFirestoreField {
  return APP_IMAGE_FIRESTORE_FIELDS[kind]
}

export function isWordmarkKind(kind: AppImageKind): boolean {
  return kind === 'wordmarkLight' || kind === 'wordmarkDark'
}

function safeUrl(value: unknown): string {
  return typeof value === 'string' ? normalizePublicImgAsset(value) : ''
}

/** App initialization is incomplete until every canonical Storage role is recorded. */
export function isAppMediaComplete(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const media = value as AppMediaRecordLike
  return [
    media.thumbnail_url,
    media.logo_url,
    media.wordmark_light_url,
    media.wordmark_dark_url,
    media.cover_url,
  ].every((url) => Boolean(safeUrl(url)))
}

/** Resolve canonical App roles for a view without crossing App ownership. */
export function resolveAppMediaForView(
  media: AppMediaRecordLike | null | undefined,
  options?: {
    owningAppBundle?: boolean
    /** @deprecated Use owningAppBundle. */
    devLocalFallback?: boolean
  }
) {
  const owningAppBundle = Boolean(
    options?.owningAppBundle ?? options?.devLocalFallback
  )

  const thumbnailUrl =
    resolveAppImageSources('thumbnail', media?.thumbnail_url, {
      owningAppBundle,
    }).candidates[0] || ''

  const logoUrl =
    resolveAppImageSources('logo', media?.logo_url, {
      owningAppBundle,
    }).candidates[0] || ''

  const wordmarkLightUrl =
    resolveAppImageSources('wordmarkLight', media?.wordmark_light_url, {
      owningAppBundle,
    }).candidates[0] || ''

  const wordmarkDarkUrl =
    resolveAppImageSources('wordmarkDark', media?.wordmark_dark_url, {
      owningAppBundle,
    }).candidates[0] || ''

  const coverUrl =
    resolveAppImageSources('cover', media?.cover_url, {
      owningAppBundle,
    }).candidates[0] || ''

  return {
    thumbnailUrl,
    logoUrl,
    wordmarkLightUrl,
    wordmarkDarkUrl,
    coverUrl,
  }
}
