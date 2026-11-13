import type { AppPublicAssetKind } from './types'
import { APP_PUBLIC_ASSET_REQUIREMENTS } from './requirements'

export type AppAssetSurface = 'light' | 'dark'

export type AppAssetItem = {
  key: string
  label: string
  src: string
  description: string
  shape: 'square' | 'wide'
  surface?: AppAssetSurface
  requirements?: string
}

export type AppAssetGroup = {
  key: string
  title: string
  description: string
  items: AppAssetItem[]
}

const presentation: Record<
  AppPublicAssetKind,
  {
    group: string
    description: string
    shape: AppAssetItem['shape']
    surface?: AppAssetSurface
  }
> = {
  logo: {
    group: 'brand',
    description: 'The square mark used to identify this App.',
    shape: 'square',
  },
  wordmarkLight: {
    group: 'brand',
    description: 'The App name and mark for light backgrounds.',
    shape: 'wide',
    surface: 'light',
  },
  wordmarkDark: {
    group: 'brand',
    description: 'The App name and mark for dark backgrounds.',
    shape: 'wide',
    surface: 'dark',
  },
  thumbnail: {
    group: 'images',
    description: 'The image used when sharing a link to this App.',
    shape: 'wide',
  },
  cover: {
    group: 'images',
    description: 'The wide image used on the App profile and App cards.',
    shape: 'wide',
  },
  favicon: {
    group: 'browser',
    description: 'The small icon shown in browser tabs.',
    shape: 'square',
  },
  pwaIcon192: {
    group: 'browser',
    description: 'The icon used for installation and Apple touch.',
    shape: 'square',
  },
  pwaIcon512: {
    group: 'browser',
    description: 'The larger icon used by the installable App.',
    shape: 'square',
  },
}

export const APP_ASSET_GROUPS: AppAssetGroup[] = [
  {
    key: 'brand',
    title: 'Brand',
    description: 'Your logo and wordmarks, on light and dark backgrounds.',
  },
  {
    key: 'images',
    title: 'App images',
    description: 'Artwork for profiles, cards and shared links.',
  },
  {
    key: 'browser',
    title: 'Browser and install',
    description: 'Icons for tabs, home screens and installation.',
  },
].map((group) => ({
  ...group,
  items: APP_PUBLIC_ASSET_REQUIREMENTS.filter(
    (asset) => presentation[asset.key].group === group.key
  ).map((asset) => ({
    key: asset.key,
    label: asset.label,
    src: asset.localPublicPath,
    requirements: asset.requirementsText,
    ...presentation[asset.key],
  })),
}))

export function readAdditionalAppAssets(catalogue: unknown): AppAssetItem[] {
  if (!Array.isArray(catalogue)) return []
  const standard = APP_ASSET_GROUPS.flatMap((group) => group.items)
  const keys = new Set(standard.map((asset) => asset.key))
  const paths = new Set(standard.map((asset) => asset.src))
  const items: AppAssetItem[] = []

  for (const candidate of catalogue.slice(0, 24)) {
    if (!candidate || typeof candidate !== 'object') continue
    const text = (value: unknown) =>
      typeof value === 'string' ? value.trim() : ''
    const key = text(candidate.key)
    const label = text(candidate.label)
    const src = text(candidate.src)
    if (
      !key ||
      !label ||
      !src.startsWith('/img/app/') ||
      keys.has(key) ||
      paths.has(src)
    )
      continue

    keys.add(key)
    paths.add(src)
    items.push({
      key,
      label,
      src,
      description: text(candidate.description),
      shape: candidate.wide === true ? 'wide' : 'square',
      surface:
        candidate.surface === 'light' || candidate.surface === 'dark'
          ? candidate.surface
          : undefined,
    })
  }
  return items
}
