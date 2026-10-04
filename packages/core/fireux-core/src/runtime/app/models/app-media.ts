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

export type AppImageSourceResolution = {
  kind: AppImageKind
  relativePath: string
  localUrl: string
  storageUrl: string
  candidates: readonly string[]
}
