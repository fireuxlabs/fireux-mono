export type FireuxBrandRole = 'global' | 'tenant' | 'standalone'

export type ResolvedFireuxBrandAssets = {
  logo: string
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
  thumbnail: '/img/app/thumbnail.png',
  cover: '/img/app/cover.png',
  favicon: '/img/app/favicon.ico',
  wordmarkLight: '/img/app/wordmark-light.svg',
  wordmarkDark: '/img/app/wordmark-dark.png',
  pwaIcon192: '/img/app/pwa/icon-192.png',
  pwaIcon512: '/img/app/pwa/icon-512.png',
})

export const CORE_BRAND_FALLBACK_ASSETS = Object.freeze({
  logo: '/img/core/brand/logo.png',
  wordmarkLight: '/img/core/brand/wordmark-light.svg',
  wordmarkDark: '/img/core/brand/wordmark-dark.png',
})

type ResolveBrandAssetInput = {
  role?: FireuxBrandRole | string | null
  appLogo?: string | null
  appThumbnail?: string | null
}

const IMAGE_FILENAME_RE = /^[A-Za-z0-9._-]+\.(?:avif|gif|ico|jpe?g|png|svg|webp)$/i

export function normalizePublicImgAsset(
  value: string | null | undefined,
  fallback = ''
): string {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (!normalized) return fallback
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
  return fallback
}

export function resolveFireuxBrandAssets(
  input: ResolveBrandAssetInput = {}
): ResolvedFireuxBrandAssets {
  const base = GLOBAL_BRAND_ASSETS

  return {
    ...base,
    logo: normalizePublicImgAsset(input.appLogo, base.logo),
    thumbnail: normalizePublicImgAsset(input.appThumbnail, base.thumbnail),
  }
}
