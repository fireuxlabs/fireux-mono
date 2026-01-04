// Canonical app media naming:
// - Storage objects: apps/<appId>/media/{thumbnail|logo|wordmark-light|wordmark-dark}
// - Firestore fields: {thumbnail_url|logo_url|wordmark_light_url|wordmark_dark_url}
export type AppImageKind =
  | 'thumbnail'
  | 'logo'
  | 'wordmarkLight'
  | 'wordmarkDark'

type AppImageFirestoreField =
  | 'thumbnail_url'
  | 'logo_url'
  | 'wordmark_light_url'
  | 'wordmark_dark_url'

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
  }
}

export function appImageFirestoreField(kind: AppImageKind): AppImageFirestoreField {
  switch (kind) {
    case 'thumbnail':
      return 'thumbnail_url'
    case 'logo':
      return 'logo_url'
    case 'wordmarkLight':
      return 'wordmark_light_url'
    case 'wordmarkDark':
      return 'wordmark_dark_url'
  }
}

export function isWordmarkKind(kind: AppImageKind): boolean {
  return kind === 'wordmarkLight' || kind === 'wordmarkDark'
}
