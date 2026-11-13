import type {
  AppImageKind,
  AppImageFirestoreField,
  AppLocalOnlyAssetKind,
  AppPublicAssetRequirement,
} from './types'

export const APP_IMAGE_RELATIVE_PATHS = {
  thumbnail: 'img/app/thumbnail.png',
  logo: 'img/app/logo.png',
  wordmarkLight: 'img/app/wordmark-light.png',
  wordmarkDark: 'img/app/wordmark-dark.png',
  cover: 'img/app/cover.png',
} as const satisfies Record<AppImageKind, string>

export const APP_IMAGE_LOCAL_PUBLIC_PATHS = {
  thumbnail: `/${APP_IMAGE_RELATIVE_PATHS.thumbnail}`,
  logo: `/${APP_IMAGE_RELATIVE_PATHS.logo}`,
  wordmarkLight: `/${APP_IMAGE_RELATIVE_PATHS.wordmarkLight}`,
  wordmarkDark: `/${APP_IMAGE_RELATIVE_PATHS.wordmarkDark}`,
  cover: `/${APP_IMAGE_RELATIVE_PATHS.cover}`,
} as const satisfies Record<AppImageKind, string>

export const APP_LOCAL_ONLY_PUBLIC_PATHS = {
  favicon: '/img/app/favicon.ico',
  pwaIcon192: '/img/app/pwa/icon-192.png',
  pwaIcon512: '/img/app/pwa/icon-512.png',
} as const satisfies Record<AppLocalOnlyAssetKind, string>

export const APP_FAVICON_SIZES = [16, 32, 48, 64] as const

export const APP_IMAGE_FIRESTORE_FIELDS = {
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
    requirementsHtml: 'Required. PNG, exactly <code>512&times;512</code>.',
    dimensions: {
      requiredWidth: 512,
      requiredHeight: 512,
      acceptedTypes: ['png'],
    },
    syncKind: 'logo',
  },
  {
    key: 'wordmarkLight',
    label: 'Wordmark (light)',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkLight,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkLight),
    requirementsText: 'Required. PNG, at least 256x64, aspect at least 3:1.',
    requirementsHtml:
      'Required. PNG, at least <code>256&times;64</code> with aspect <code>&ge;3:1</code>.',
    dimensions: {
      minWidth: 256,
      minHeight: 64,
      minAspect: 3,
      acceptedTypes: ['png'],
    },
    syncKind: 'wordmarkLight',
  },
  {
    key: 'wordmarkDark',
    label: 'Wordmark (dark)',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkDark,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmarkDark),
    requirementsText: 'Required. PNG, at least 256x64, aspect at least 3:1.',
    requirementsHtml:
      'Required. PNG, at least <code>256&times;64</code> with aspect <code>&ge;3:1</code>.',
    dimensions: {
      minWidth: 256,
      minHeight: 64,
      minAspect: 3,
      acceptedTypes: ['png'],
    },
    syncKind: 'wordmarkDark',
  },
  {
    key: 'thumbnail',
    label: 'Thumbnail',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.thumbnail,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.thumbnail),
    requirementsText: 'Required. PNG, exactly 1200x630.',
    requirementsHtml: 'Required. PNG, exactly <code>1200&times;630</code>.',
    dimensions: {
      requiredWidth: 1200,
      requiredHeight: 630,
      acceptedTypes: ['png'],
    },
    syncKind: 'thumbnail',
  },
  {
    key: 'cover',
    label: 'Cover',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.cover,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.cover),
    requirementsText: 'Required. PNG, 16:9, at least 1280x720.',
    requirementsHtml:
      'Required. PNG, <code>16:9</code>, at least <code>1280&times;720</code>.',
    dimensions: {
      minWidth: 1280,
      minHeight: 720,
      aspectRatio: 16 / 9,
      aspectTolerance: 0.01,
      acceptedTypes: ['png'],
    },
    syncKind: 'cover',
  },
] as const satisfies readonly AppPublicAssetRequirement[]

export const APP_LOCAL_ONLY_ASSET_REQUIREMENTS = [
  {
    key: 'favicon',
    label: 'Favicon',
    localPublicPath: APP_LOCAL_ONLY_PUBLIC_PATHS.favicon,
    localRelativePath: relativePath(APP_LOCAL_ONLY_PUBLIC_PATHS.favicon),
    requirementsText:
      'Required. ICO with 16x16, 32x32, 48x48 and 64x64 images.',
    requirementsHtml:
      'Required. ICO with <code>16&times;16</code>, <code>32&times;32</code>, <code>48&times;48</code> and <code>64&times;64</code> images.',
    requiredIconSizes: APP_FAVICON_SIZES,
    dimensions: {
      minWidth: 32,
      minHeight: 32,
      aspectRatio: 1,
      aspectTolerance: 0.01,
      acceptedTypes: ['ico'],
    },
  },
  {
    key: 'pwaIcon192',
    label: 'PWA icon (192)',
    localPublicPath: APP_LOCAL_ONLY_PUBLIC_PATHS.pwaIcon192,
    localRelativePath: relativePath(APP_LOCAL_ONLY_PUBLIC_PATHS.pwaIcon192),
    requirementsText: 'Required. PNG, exactly 192x192.',
    requirementsHtml: 'Required. PNG, exactly <code>192&times;192</code>.',
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
    requirementsHtml: 'Required. PNG, exactly <code>512&times;512</code>.',
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
