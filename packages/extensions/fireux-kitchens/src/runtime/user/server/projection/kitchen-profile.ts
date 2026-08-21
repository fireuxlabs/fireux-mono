// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: allowlist Chef and Driver directory/detail fields.
// Concurrent edit — 2026-07-20 19:14 CEST — Repo Efficiency Pass 2 of 6: project exact Chef bounds with HTTPS-only images.
// Concurrent edit — 2026-07-20 22:45 CEST — Nitro import repair: resolve the concrete core HTTPS utility module.
import type {
  ProfileDirectoryConfig,
  ProfileDirectoryMapper,
} from 'fireux-core/runtime/user/server/directory/profile-directory'
import { readHttpsUrl } from 'fireux-core/runtime/utils/httpsUrl'
import { CHEF_GALLERY_MAX_ITEMS } from '../../models/chef.model.ts'

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function strings(value: unknown, maxItems: number, maxLength = 160): string[] {
  if (
    !Array.isArray(value) ||
    value.length > maxItems ||
    value.some(
      (entry) => typeof entry !== 'string' || entry.trim().length > maxLength
    )
  ) {
    return []
  }
  return value.map((entry) => entry.trim()).filter(Boolean)
}

function gallery(value: unknown) {
  if (!Array.isArray(value) || value.length > CHEF_GALLERY_MAX_ITEMS) return []
  const mapped = value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return []
    const source = entry as Record<string, unknown>
    if (
      !Object.keys(source).every((key) =>
        ['name', 'image_url'].includes(key)
      ) ||
      !Object.hasOwn(source, 'name') ||
      !Object.hasOwn(source, 'image_url') ||
      typeof source.name !== 'string' ||
      source.name.length > 240
    ) {
      return []
    }
    const imageUrl = readHttpsUrl(source.image_url)
    if (!imageUrl) return []
    return [{ name: text(source.name, 240), image_url: imageUrl }]
  })
  return mapped.length === value.length ? mapped : []
}

export const mapChefProfile: ProfileDirectoryMapper = (data, mode) => ({
  title: text(data.title, 120),
  summary: text(data.summary, 1_000),
  chef_bio: text(data.chef_bio, 4_000),
  chef_image: readHttpsUrl(data.chef_image),
  ...(mode === 'detail'
    ? {
        chef_signature_dishes: strings(data.chef_signature_dishes, 20, 240),
        chef_gallery: gallery(data.chef_gallery),
        kitchen_ids: strings(data.kitchen_ids, 20, 1_500),
        chef_organization_name: text(data.chef_organization_name, 160),
      }
    : {}),
})

export const mapDriverProfile: ProfileDirectoryMapper = (data) => {
  const rawCoverage =
    data.coverage &&
    typeof data.coverage === 'object' &&
    !Array.isArray(data.coverage)
      ? (data.coverage as Record<string, unknown>)
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

export const chefProfileDirectory: ProfileDirectoryConfig = {
  kind: 'chef',
  mapProfile: mapChefProfile,
}

export const driverProfileDirectory: ProfileDirectoryConfig = {
  kind: 'driver',
  mapProfile: mapDriverProfile,
}
