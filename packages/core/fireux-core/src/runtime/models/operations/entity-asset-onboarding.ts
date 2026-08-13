export type EntityAssetStage = 'root' | 'console' | 'app'

export type EntityAssetRole =
  | 'logo'
  | 'wordmark'
  | 'wordmarkLight'
  | 'wordmarkDark'
  | 'cover'
  | 'thumbnail'
  | 'favicon'
  | 'pwaIcon192'
  | 'pwaIcon512'

export type EntityAssetSourceMap = Partial<Record<EntityAssetRole, string>>

export type EntityAssetDimensions = {
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  aspect?: number
  minAspect?: number
  aspectTolerance?: number
}

export type EntityAssetRequirement = {
  role: EntityAssetRole
  label: string
  filename: string
  requirement: string
  dimensions?: EntityAssetDimensions
}

export const EntityAssetRequirements = {
  logo: {
    role: 'logo', label: 'Logo', filename: 'logo.png',
    requirement: 'PNG · exactly 512×512',
    dimensions: { width: 512, height: 512 },
  },
  wordmark: {
    role: 'wordmark', label: 'Wordmark', filename: 'wordmark.png',
    requirement: 'PNG · approved master geometry',
  },
  wordmarkLight: {
    role: 'wordmarkLight', label: 'Wordmark · light surface',
    filename: 'wordmark-light.png', requirement: 'PNG · minimum 256×64 · at least 3:1',
    dimensions: { minWidth: 256, minHeight: 64, minAspect: 3 },
  },
  wordmarkDark: {
    role: 'wordmarkDark', label: 'Wordmark · dark surface',
    filename: 'wordmark-dark.png', requirement: 'PNG · minimum 256×64 · at least 3:1',
    dimensions: { minWidth: 256, minHeight: 64, minAspect: 3 },
  },
  cover: {
    role: 'cover', label: 'Cover', filename: 'cover.png',
    requirement: 'PNG · 16:9 · minimum 1280×720',
    dimensions: {
      minWidth: 1280,
      minHeight: 720,
      aspect: 16 / 9,
      aspectTolerance: 0.01,
    },
  },
  thumbnail: {
    role: 'thumbnail', label: 'Thumbnail', filename: 'thumbnail.png',
    requirement: 'PNG · exactly 1200×630',
    dimensions: { width: 1200, height: 630 },
  },
  favicon: {
    role: 'favicon', label: 'Favicon', filename: 'favicon.ico',
    requirement: 'ICO or PNG · square · minimum 32×32',
    dimensions: { minWidth: 32, minHeight: 32, aspect: 1, aspectTolerance: 0.01 },
  },
  pwaIcon192: {
    role: 'pwaIcon192', label: 'PWA icon · 192', filename: 'pwa/icon-192.png',
    requirement: 'PNG · exactly 192×192',
    dimensions: { width: 192, height: 192 },
  },
  pwaIcon512: {
    role: 'pwaIcon512', label: 'PWA icon · 512', filename: 'pwa/icon-512.png',
    requirement: 'PNG · exactly 512×512',
    dimensions: { width: 512, height: 512 },
  },
} as const satisfies Record<EntityAssetRole, EntityAssetRequirement>

export const EntityAssetStageRoles = {
  root: ['logo', 'wordmarkLight', 'wordmarkDark'],
  console: ['logo', 'wordmarkLight', 'wordmarkDark', 'cover', 'thumbnail'],
  app: ['logo', 'wordmarkLight', 'wordmarkDark', 'cover', 'thumbnail'],
} as const satisfies Record<EntityAssetStage, readonly EntityAssetRole[]>

export const entityAssetRequirementsForStage = (stage: EntityAssetStage) =>
  EntityAssetStageRoles[stage].map(role => EntityAssetRequirements[role])

export const entityAssetDimensionsMatch = (
  requirement: EntityAssetRequirement,
  width: number,
  height: number
) => {
  const expected = requirement.dimensions
  if (!expected) return true
  if (expected.width !== undefined && width !== expected.width) return false
  if (expected.height !== undefined && height !== expected.height) return false
  if (expected.minWidth !== undefined && width < expected.minWidth) return false
  if (expected.minHeight !== undefined && height < expected.minHeight) return false
  const aspect = width / height
  if (expected.minAspect !== undefined && aspect < expected.minAspect) return false
  if (
    expected.aspect !== undefined &&
    Math.abs(aspect - expected.aspect) > (expected.aspectTolerance ?? 0)
  ) return false
  return true
}
