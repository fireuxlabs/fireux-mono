// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: allowlist Chef and Driver directory/detail fields.
import type {
  PublicProfileHandlerConfig,
  PublicProfileMapper,
} from 'fireux-core/runtime/server/utils/public-projection/public-profile.ts'

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function strings(value: unknown, maxItems: number, maxLength = 160): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

export const mapChefPublicProfile: PublicProfileMapper = (data, mode) => ({
  title: text(data.title, 120),
  summary: text(data.summary, 1_000),
  chef_bio: text(data.chef_bio, 4_000),
  chef_image: text(data.chef_image, 2_048),
  tags: strings(data.tags, 20),
  ...(mode === 'detail'
    ? {
        chef_signature_dishes: strings(data.chef_signature_dishes, 20, 240),
        kitchen_ids: strings(data.kitchen_ids, 50, 1_500),
        chef_organization_name: text(data.chef_organization_name, 160),
        subtitle: text(data.subtitle, 240),
        tagline: text(data.tagline, 240),
        bio_long: text(data.bio_long, 4_000),
        specialties: strings(data.specialties, 20),
        locations: strings(data.locations, 30),
        organization_name: text(data.organization_name, 160),
      }
    : {}),
})

export const mapDriverPublicProfile: PublicProfileMapper = (data) => {
  const rawCoverage =
    data.coverage && typeof data.coverage === 'object' && !Array.isArray(data.coverage)
      ? data.coverage as Record<string, unknown>
      : {}
  const radius = Number(rawCoverage.radius_m)
  if (!Number.isInteger(radius) || radius < 0 || radius > 200_000) return null

  return {
    title: text(data.title, 120),
    subtitle: text(data.subtitle, 240),
    tagline: text(data.tagline, 240),
    tags: strings(data.tags, 20),
    coverage: { radius_m: radius },
  }
}

export const publicChefProfileConfig: PublicProfileHandlerConfig = {
  collection: 'chefs',
  kind: 'chef',
  mapProfile: mapChefPublicProfile,
}

export const publicDriverProfileConfig: PublicProfileHandlerConfig = {
  collection: 'drivers',
  kind: 'driver',
  mapProfile: mapDriverPublicProfile,
}
