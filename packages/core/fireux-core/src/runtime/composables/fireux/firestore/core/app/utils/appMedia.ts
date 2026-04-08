// Canonical app media naming:
// - Storage objects: apps/<appId>/media/{thumbnail|logo|wordmark-light|wordmark-dark|cover}
// - Firestore fields:
//   {media.thumbnail_url|media.logo_url|media.wordmark_light_url|media.wordmark_dark_url|media.cover_url}
export type AppImageKind =
  | 'thumbnail'
  | 'logo'
  | 'wordmarkLight'
  | 'wordmarkDark'
  | 'cover'

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

export function appImageStoragePath(appId: string, kind: AppImageKind): string {
  // "Public bucket" convention: a stable object path that can be overwritten.
  // The UI refresh resolves the current download URL and saves it to Firestore.
  switch (kind) {
    case 'thumbnail':
      return `apps/${appId}/media/thumbnail`
    case 'logo':
      return `apps/${appId}/media/logo`
    case 'wordmarkLight':
      return `apps/${appId}/media/wordmark-light`
    case 'wordmarkDark':
      return `apps/${appId}/media/wordmark-dark`
    case 'cover':
      return `apps/${appId}/media/cover`
  }
}

export function appImageLocalPublicPath(kind: AppImageKind): string {
  switch (kind) {
    case 'thumbnail':
      return '/img/app/thumbnail.png'
    case 'logo':
      return '/img/app/logo.png'
    case 'wordmarkLight':
      return '/img/app/wordmark-light.png'
    case 'wordmarkDark':
      return '/img/app/wordmark-dark.png'
    case 'cover':
      return '/img/app/cover.png'
  }
}

export function appImageFirestoreField(kind: AppImageKind): AppImageFirestoreField {
  switch (kind) {
    case 'thumbnail':
      return 'media.thumbnail_url'
    case 'logo':
      return 'media.logo_url'
    case 'wordmarkLight':
      return 'media.wordmark_light_url'
    case 'wordmarkDark':
      return 'media.wordmark_dark_url'
    case 'cover':
      return 'media.cover_url'
  }
}

export function isWordmarkKind(kind: AppImageKind): boolean {
  return kind === 'wordmarkLight' || kind === 'wordmarkDark'
}

function safeUrl(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
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
