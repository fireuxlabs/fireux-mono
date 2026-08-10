import type {
  AppImageKind,
  AppImageFirestoreField,
  AppLocalOnlyAssetKind,
  AppPublicAssetRequirement,
} from './appAssets'

export const APP_IMAGE_STORAGE_OBJECT_NAMES = {
  thumbnail: 'thumbnail',
  logo: 'logo',
  wordmark: 'wordmark',
  wordmarkLight: 'wordmark-light',
  wordmarkDark: 'wordmark-dark',
  cover: 'cover',
} as const satisfies Record<AppImageKind, string>

export const APP_IMAGE_LOCAL_PUBLIC_PATHS = {
  thumbnail: '/img/app/thumbnail.png',
  logo: '/img/app/logo.png',
  wordmark: '/img/app/wordmark.png',
  wordmarkLight: '/img/app/wordmark-light.png',
  wordmarkDark: '/img/app/wordmark-dark.png',
  cover: '/img/app/cover.png',
} as const satisfies Record<AppImageKind, string>

export const APP_LOCAL_ONLY_PUBLIC_PATHS = {
  favicon: '/img/app/favicon.ico',
  pwaIcon192: '/img/app/pwa/icon-192.png',
  pwaIcon512: '/img/app/pwa/icon-512.png',
} as const satisfies Record<AppLocalOnlyAssetKind, string>

export const APP_IMAGE_FIRESTORE_FIELDS = {
  thumbnail: 'assets.thumbnail',
  logo: 'assets.logo',
  wordmark: 'assets.wordmark',
  wordmarkLight: 'assets.wordmark_light',
  wordmarkDark: 'assets.wordmark_dark',
  cover: 'assets.cover',
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
    key: 'wordmark',
    label: 'Wordmark',
    localPublicPath: APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmark,
    localRelativePath: relativePath(APP_IMAGE_LOCAL_PUBLIC_PATHS.wordmark),
    requirementsText: 'Required. PNG, at least 256x64, aspect at least 3:1.',
    requirementsHtml:
      'Required. PNG, at least <span class="font-mono">256&times;64</span> with aspect <span class="font-mono">&ge;3:1</span>.',
    dimensions: {
      minWidth: 256,
      minHeight: 64,
      minAspect: 3,
      acceptedTypes: ['png'],
    },
    syncKind: 'wordmark',
    storageObjectName: APP_IMAGE_STORAGE_OBJECT_NAMES.wordmark,
    firestoreField: APP_IMAGE_FIRESTORE_FIELDS.wordmark,
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
