// Canonical App asset naming:
// - Local files: public/img/app/{thumbnail|logo|wordmark|wordmark-light|wordmark-dark|cover}.*
// - Browser URLs: /img/app/{thumbnail|logo|wordmark|wordmark-light|wordmark-dark|cover}.*
// - Storage objects: apps/<appId>/{thumbnail|logo|wordmark|wordmark-light|wordmark-dark|cover}
// - Firestore fields: assets.{thumbnail|logo|wordmark|wordmark_light|wordmark_dark|cover}
import { normalizePublicImgAsset } from '../../../../../../../utils/brandAssets'
import { AppAssetsStorage } from '../../../../../../models/core/app.model'

export type AppImageKind =
  | 'thumbnail'
  | 'logo'
  | 'wordmark'
  | 'wordmarkLight'
  | 'wordmarkDark'
  | 'cover'

export type AppLocalOnlyAssetKind = 'favicon' | 'pwaIcon192' | 'pwaIcon512'
export type AppPublicAssetKind = AppImageKind | AppLocalOnlyAssetKind

export const APP_IMAGE_SYNC_KINDS = [
  'thumbnail',
  'logo',
  'wordmark',
  'wordmarkLight',
  'wordmarkDark',
  'cover',
] as const satisfies readonly AppImageKind[]

export type AppAssetSyncFailure = {
  kind: AppImageKind
  message: string
}

export type AppAssetSyncResponse = {
  appId: string
  uploaded: Partial<Record<AppImageKind, string>>
  failed: AppAssetSyncFailure[]
}

type AppAssetsRecordLike = {
  thumbnail?: string
  logo?: string
  wordmark?: string
  wordmark_light?: string
  wordmark_dark?: string
  cover?: string
}

export type AppImageFirestoreField =
  | 'assets.thumbnail'
  | 'assets.logo'
  | 'assets.wordmark'
  | 'assets.wordmark_light'
  | 'assets.wordmark_dark'
  | 'assets.cover'

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
  APP_IMAGE_STORAGE_OBJECT_NAMES,
  APP_PUBLIC_ASSET_REQUIREMENTS,
  APP_SYNCABLE_IMAGE_REQUIREMENTS,
} from './app-asset-requirements'

export {
  APP_LOCAL_ONLY_ASSET_REQUIREMENTS,
  APP_PUBLIC_ASSET_REQUIREMENTS,
  APP_SYNCABLE_IMAGE_REQUIREMENTS,
} from './app-asset-requirements'

export function appImageRequirement(kind: AppImageKind): AppPublicAssetRequirement {
  const requirement = APP_SYNCABLE_IMAGE_REQUIREMENTS.find(
    (asset) => asset.syncKind === kind
  )
  if (!requirement) {
    throw new Error(`[appAssets] Missing syncable App image requirement: ${kind}`)
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
    throw new Error(`[appAssets] Missing App asset requirement: ${kind}`)
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
  // "Public bucket" convention: a stable object path that can be overwritten.
  // The UI refresh resolves the current download URL and saves it to Firestore.
  return AppAssetsStorage[kind].replace('{appId}', appId)
}

export function appImageLocalPublicPath(kind: AppImageKind): string {
  return APP_IMAGE_LOCAL_PUBLIC_PATHS[kind]
}

export function appImageFirestoreField(kind: AppImageKind): AppImageFirestoreField {
  return APP_IMAGE_FIRESTORE_FIELDS[kind]
}

export function isWordmarkKind(kind: AppImageKind): boolean {
  return kind === 'wordmark' || kind === 'wordmarkLight' || kind === 'wordmarkDark'
}

function safeUrl(value: unknown): string {
  return typeof value === 'string' ? normalizePublicImgAsset(value) : ''
}

/**
 * Dev-only visual backup:
 * - Canonical record and storage paths remain Firestore + Storage based.
 * - When an App is new and assets have not been synced yet, local public files can
 *   be rendered for development surfaces without rewriting canonical data.
 */
export function resolveAppAssetsForView(
  assets: AppAssetsRecordLike | null | undefined,
  options?: {
    devLocalFallback?: boolean
  }
) {
  const devLocalFallback = Boolean(options?.devLocalFallback)

  const thumbnailUrl =
    safeUrl(assets?.thumbnail) ||
    (devLocalFallback ? appImageLocalPublicPath('thumbnail') : '')

  const logoUrl =
    safeUrl(assets?.logo) ||
    (devLocalFallback ? appImageLocalPublicPath('logo') : '')

  const wordmarkLightUrl =
    safeUrl(assets?.wordmark_light) ||
    (devLocalFallback ? appImageLocalPublicPath('wordmarkLight') : '')

  const wordmarkDarkUrl =
    safeUrl(assets?.wordmark_dark) ||
    (devLocalFallback ? appImageLocalPublicPath('wordmarkDark') : '')

  const coverUrl =
    safeUrl(assets?.cover) ||
    (devLocalFallback ? appImageLocalPublicPath('cover') : '')

  return {
    thumbnailUrl,
    logoUrl,
    wordmarkLightUrl,
    wordmarkDarkUrl,
    coverUrl,
  }
}
