export type ResolvedFireuxBrandAssets = {
  logo: string
  logoLight: string
  logoDark: string
  thumbnail: string
  cover: string
  favicon: string
  wordmarkLight: string
  wordmarkDark: string
  pwaIcon192: string
  pwaIcon512: string
}

export const GLOBAL_BRAND_ASSETS: ResolvedFireuxBrandAssets = Object.freeze({
  logo: '/img/app/logo.png',
  logoLight: '/img/app/logo.png',
  logoDark: '/img/app/logo.png',
  thumbnail: '/img/app/thumbnail.png',
  cover: '/img/app/cover.png',
  favicon: '/img/app/favicon.ico',
  wordmarkLight: '/img/app/wordmark-light.png',
  wordmarkDark: '/img/app/wordmark-dark.png',
  pwaIcon192: '/img/app/pwa/icon-192.png',
  pwaIcon512: '/img/app/pwa/icon-512.png',
})

export const CORE_BRAND_DEFAULT_ASSETS = Object.freeze({
  logo: '/img/core/brand/logo.svg',
  wordmarkLight: '/img/core/brand/wordmark-light.png',
  wordmarkDark: '/img/core/brand/wordmark-dark.png',
})

const IMAGE_FILENAME_RE =
  /^[A-Za-z0-9._-]+\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i

export function normalizePublicImgAsset(
  value: string | null | undefined,
  defaultValue = ''
): string {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) return defaultValue
  if (
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:') ||
    /^https?:\/\//i.test(normalized)
  ) {
    return normalized
  }
  if (normalized.startsWith('/img/')) return normalized
  if (normalized.startsWith('img/')) return `/${normalized}`
  if (normalized.startsWith('/public/img/')) {
    return normalized.replace(/^\/public/, '')
  }
  if (normalized.startsWith('public/img/')) {
    return `/${normalized.replace(/^public\//, '')}`
  }
  if (IMAGE_FILENAME_RE.test(normalized)) return `/img/app/${normalized}`
  return defaultValue
}

export function resolveFireuxBrandAssets(): ResolvedFireuxBrandAssets {
  return { ...GLOBAL_BRAND_ASSETS }
}
