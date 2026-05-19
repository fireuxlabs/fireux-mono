// Canonical app media naming:
// - Local files: public/img/app/{thumbnail|logo|wordmark-light|wordmark-dark|cover}.*
// - Browser URLs: /img/app/{thumbnail|logo|wordmark-light|wordmark-dark|cover}.*
// - Storage objects: apps/<appId>/media/{thumbnail|logo|wordmark-light|wordmark-dark|cover}
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

type AppImageFirestoreField =
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

const APP_IMAGE_STORAGE_OBJECT_NAMES = {
  thumbnail: 'thumbnail',
  logo: 'logo',
  wordmarkLight: 'wordmark-light',
  wordmarkDark: 'wordmark-dark',
  cover: 'cover',
} as const satisfies Record<AppImageKind, string>

const APP_IMAGE_LOCAL_PUBLIC_PATHS = {
  thumbnail: '/img/app/thumbnail.png',
  logo: '/img/app/logo.png',
  wordmarkLight: '/img/app/wordmark-light.png',
  wordmarkDark: '/img/app/wordmark-dark.png',
  cover: '/img/app/cover.png',
} as const satisfies Record<AppImageKind, string>

const APP_LOCAL_ONLY_PUBLIC_PATHS = {
  favicon: '/img/app/favicon.ico',
  pwaIcon192: '/img/app/pwa/icon-192.png',
  pwaIcon512: '/img/app/pwa/icon-512.png',
} as const satisfies Record<AppLocalOnlyAssetKind, string>

const APP_IMAGE_FIRESTORE_FIELDS = {
  thumbnail: 'media.thumbnail_url',
  logo: 'media.logo_url',
  wordmarkLight: 'media.wordmark_light_url',
  wordmarkDark: 'media.wordmark_dark_url',
  cover: 'media.cover_url',
} as const satisfies Record<AppImageKind, AppImageFirestoreField>

const relativePath = (publicPath: string) => publicPath.replace(/^\/+/, '')

export const APP_SYNCABLE_IMAGE_REQUIREMENTS = [
  {
    key: 'logo',
    label: 'Logo',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.logo,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.logo),
    requirementsText: 'Required. PNG, exactly 512x512.',
    requirementsHtml:
      'Required. PNG, exactly <span class="font-mono">512&times;512</span>.',
    dimensions: {
      requiredWidth: 512,
      requiredHeight: 512,
      acceptedTypes: ['png'],
    },
    syncKind: 'logo',
    storageObjectName: APP_IMAGE_STORAGE_OBJECT_NAMES.logo,
    firestoreField: APP_IMAGE_FIRESTORE_FIELDS.logo,
  },
  {
    key: 'wordmarkLight',
    label: 'Wordmark (light)',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkLight,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkLight),
    requirementsText: 'Required. PNG, at least 256x64, aspect at least 3:1.',
    requirementsHtml:
      'Required. PNG, at least <span class="font-mono">256&times;64</span> with aspect <span class="font-mono">&ge;3:1</span>.',
    dimensions: {
      minWidth: 256,
      minHeight: 64,
      minAspect: 3,
      acceptedTypes: ['png'],
    },
    syncKind: 'wordmarkLight',
    storageObjectName: APP_IMAGE_STORAGE_OBJECT_NAMES.wordmarkLight,
    firestoreField: APP_IMAGE_FIRESTORE_FIELDS.wordmarkLight,
  },
  {
    key: 'wordmarkDark',
    label: 'Wordmark (dark)',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkDark,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkDark),
    requirementsText: 'Required. PNG, at least 256x64, aspect at least 3:1.',
    requirementsHtml:
      'Required. PNG, at least <span class="font-mono">256&times;64</span> with aspect <span class="font-mono">&ge;3:1</span>.',
    dimensions: {
      minWidth: 256,
      minHeight: 64,
      minAspect: 3,
      acceptedTypes: ['png'],
    },
    syncKind: 'wordmarkDark',
    storageObjectName: APP_IMAGE_STORAGE_OBJECT_NAMES.wordmarkDark,
    firestoreField: APP_IMAGE_FIRESTORE_FIELDS.wordmarkDark,
  },
  {
    key: 'thumbnail',
    label: 'Thumbnail',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.thumbnail,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.thumbnail),
    requirementsText: 'Required. PNG, exactly 1200x630.',
    requirementsHtml:
      'Required. PNG, exactly <span class="font-mono">1200&times;630</span>.',
    dimensions: {
      requiredWidth: 1200,
      requiredHeight: 630,
      acceptedTypes: ['png'],
    },
    syncKind: 'thumbnail',
    storageObjectName: APP_IMAGE_STORAGE_OBJECT_NAMES.thumbnail,
    firestoreField: APP_IMAGE_FIRESTORE_FIELDS.thumbnail,
  },
  {
    key: 'cover',
    label: 'Cover',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.cover,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.cover),
    requirementsText: 'Required. PNG, 16:9, at least 1280x720.',
    requirementsHtml:
      'Required. PNG, <span class="font-mono">16:9</span>, at least <span class="font-mono">1280&times;720</span>.',
    dimensions: {
      minWidth: 1280,
      minHeight: 720,
      aspectRatio: 16 / 9,
      aspectTolerance: 0.01,
      acceptedTypes: ['png'],
    },
    syncKind: 'cover',
    storageObjectName: APP_IMAGE_STORAGE_OBJECT_NAMES.cover,
    firestoreField: APP_IMAGE_FIRESTORE_FIELDS.cover,
  },
] as const satisfies readonly AppPublicAssetRequirement[]

export const APP_LOCAL_ONLY_ASSET_REQUIREMENTS = [
  {
    key: 'favicon',
    label: 'Favicon',
    localPublicPath: APP_LOCAL_ONLY_PUBLIC_PATHS.favicon,
    localRelativePath: relativePath(APP_LOCAL_ONLY_PUBLIC_PATHS.favicon),
    requirementsText: 'Required. ICO or PNG, square, at least 32x32.',
    requirementsHtml:
      'Required. ICO or PNG, square, at least <span class="font-mono">32&times;32</span>.',
    dimensions: {
      minWidth: 32,
      minHeight: 32,
      aspectRatio: 1,
      aspectTolerance: 0.01,
      acceptedTypes: ['ico', 'png'],
    },
  },
  {
    key: 'pwaIcon192',
    label: 'PWA icon (192)',
    localPublicPath: APP_LOCAL_ONLY_PUBLIC_PATHS.pwaIcon192,
    localRelativePath: relativePath(APP_LOCAL_ONLY_PUBLIC_PATHS.pwaIcon192),
    requirementsText: 'Required. PNG, exactly 192x192.',
    requirementsHtml:
      'Required. PNG, exactly <span class="font-mono">192&times;192</span>.',
    dimensions: {
      requiredWidth: 192,
      requiredHeight: 192,
      acceptedTypes: ['png'],
    },
  },
  {
    key: 'pwaIcon512',
    label: 'PWA icon (512)',
    localPublicPath: APP_LOCAL_ONLY_PUBLIC_PATHS.pwaIcon512,
    localRelativePath: relativePath(APP_LOCAL_ONLY_PUBLIC_PATHS.pwaIcon512),
    requirementsText: 'Required. PNG, exactly 512x512.',
    requirementsHtml:
      'Required. PNG, exactly <span class="font-mono">512&times;512</span>.',
    dimensions: {
      requiredWidth: 512,
      requiredHeight: 512,
      acceptedTypes: ['png'],
    },
  },
] as const satisfies readonly AppPublicAssetRequirement[]

export const APP_PUBLIC_ASSET_REQUIREMENTS = [
  ...APP_SYNCABLE_IMAGE_REQUIREMENTS,
  ...APP_LOCAL_ONLY_ASSET_REQUIREMENTS,
] as const satisfies readonly AppPublicAssetRequirement[]

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
  // "Public bucket" convention: a stable object path that can be overwritten.
  // The UI refresh resolves the current download URL and saves it to Firestore.
  return `apps/${appId}/media/${APP_IMAGE_STORAGE_OBJECT_NAMES[kind]}`
}

export function appImageLocalPublicPath(kind: AppImageKind): string {
  return APP_IMAGE_LOCAL_PUBLIC_PATHS[kind]
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

/**
 * Dev-only visual backup:
 * - Canonical record and storage paths remain Firestore + Storage based.
 * - When an app is new and media has not been synced yet, local public assets can
 *   be rendered for development surfaces without rewriting canonical data.
 */
export function resolveAppMediaForView(
  media: AppMediaRecordLike | null | undefined,
  options?: {
    devLocalFallback?: boolean
  }
) {
  const devLocalFallback = Boolean(options?.devLocalFallback)

  const thumbnailUrl =
    safeUrl(media?.thumbnail_url) ||
    (devLocalFallback ? appImageLocalPublicPath('thumbnail') : '')

  const logoUrl =
    safeUrl(media?.logo_url) ||
    (devLocalFallback ? appImageLocalPublicPath('logo') : '')

  const wordmarkLightUrl =
    safeUrl(media?.wordmark_light_url) ||
    (devLocalFallback ? appImageLocalPublicPath('wordmarkLight') : '')

  const wordmarkDarkUrl =
    safeUrl(media?.wordmark_dark_url) ||
    (devLocalFallback ? appImageLocalPublicPath('wordmarkDark') : '')

  const coverUrl =
    safeUrl(media?.cover_url) ||
    (devLocalFallback ? appImageLocalPublicPath('cover') : '')

  return {
    thumbnailUrl,
    logoUrl,
    wordmarkLightUrl,
    wordmarkDarkUrl,
    coverUrl,
  }
}
