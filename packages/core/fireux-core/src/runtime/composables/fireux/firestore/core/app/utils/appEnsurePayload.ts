import { deleteField } from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAssets } from 'fireux-core/runtime/composables/fireux/app/useAssets'
import type { AppCreateInput } from '../../../../../../models/core/app.model'
import { normalizeString } from '../../../../../../utils/string'

type FireuxConfig = ReturnType<typeof useFireUXConfig>

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function resolveRuntimeDatabaseId(): string {
  const runtime = useRuntimeConfig()
  return normalizeString(runtime.public?.firebaseEcosystem?.firebase?.databaseId)
}

function pruneEmptyBootstrapValue(value: unknown): unknown {
  if (value == null) return undefined

  if (typeof value === 'string') {
    const trimmed = normalizeString(value)
    return trimmed ? trimmed : undefined
  }

  if (Array.isArray(value)) {
    const next = value
      .map((entry) => pruneEmptyBootstrapValue(entry))
      .filter((entry) => entry !== undefined)
    return next.length ? next : undefined
  }

  if (isPlainRecord(value)) {
    const nextEntries = Object.entries(value).flatMap(([key, entry]) => {
      const pruned = pruneEmptyBootstrapValue(entry)
      return pruned === undefined ? [] : [[key, pruned] as const]
    })

    return nextEntries.length ? Object.fromEntries(nextEntries) : undefined
  }

  return value
}

export function buildAppEnsureCreateInput(fireux: FireuxConfig): AppCreateInput {
  const brandAssets = useAssets()
  const payload = pruneEmptyBootstrapValue({
    id: fireux.appId,
    project_id: fireux.projectId,
    ecosystem_id: fireux.ecosystemId,
    database_id: resolveRuntimeDatabaseId(),
    slug: fireux.appId,
    status: 'active',
    app_name: fireux.appName,
    app_short_name: fireux.appShortName,
    role: fireux.role,
    social_links: {
      website: fireux.siteUrl,
    },
    media: {
      thumbnail_url: brandAssets.thumbnail,
      logo_url: brandAssets.logo,
    },
    derived: {
      user_count: 0,
    },
  })

  return (payload ?? {}) as AppCreateInput
}

export function buildAppEnsureRepairPatch(
  existing: Record<string, unknown>,
  fireux: FireuxConfig
) {
  const patch: Record<string, unknown> = {}
  const brandAssets = useAssets()
  const projectId = normalizeString(fireux.projectId)
  const ecosystemId = normalizeString(fireux.ecosystemId)
  const databaseId = resolveRuntimeDatabaseId()

  const ensureStringFields: Record<string, string> = {
    id: fireux.appId,
    slug: fireux.appId,
    status: 'active',
    app_name: fireux.appName,
    app_short_name: fireux.appShortName,
    role: fireux.role,
  }

  for (const [key, value] of Object.entries(ensureStringFields)) {
    if (!normalizeString(existing[key])) {
      patch[key] = value
    }
  }

  if (projectId && normalizeString(existing.project_id) !== projectId) {
    patch.project_id = projectId
  }

  if (ecosystemId) {
    if (normalizeString(existing.ecosystem_id) !== ecosystemId) {
      patch.ecosystem_id = ecosystemId
    }
  } else if ('ecosystem_id' in existing) {
    patch.ecosystem_id = deleteField()
  }

  for (const legacyField of ['ecosystem', 'team']) {
    if (legacyField in existing) patch[legacyField] = deleteField()
  }

  if (databaseId && !normalizeString(existing.database_id)) {
    patch.database_id = databaseId
  }

  const websiteUrl = normalizeString(fireux.siteUrl)
  const socialLinks = isPlainRecord(existing.social_links) ? existing.social_links : {}
  if (websiteUrl && !normalizeString(socialLinks.website)) {
    patch['social_links.website'] = websiteUrl
  }

  const media = isPlainRecord(existing.media) ? existing.media : {}
  const mediaDefaults: Record<string, string> = {
    thumbnail_url: normalizeString(brandAssets.thumbnail),
    logo_url: normalizeString(brandAssets.logo),
  }

  for (const [key, value] of Object.entries(mediaDefaults)) {
    if (value && !normalizeString(media[key])) {
      patch[`media.${key}`] = value
    }
  }

  for (const key of [
    'thumbnail_url',
    'logo_url',
    'wordmark_light_url',
    'wordmark_dark_url',
    'cover_url',
  ]) {
    const current = normalizeString(media[key])
    if (current.startsWith('/img/')) {
      patch[`media.${key}`] = deleteField()
    }
  }

  for (const key of [
    'tagline',
    'description',
    'short_bio',
    'long_bio',
    'moderation_state',
  ]) {
    if (key in existing && !normalizeString(existing[key])) {
      patch[key] = deleteField()
    }
  }

  for (const key of ['join_requests', 'ban_reasons']) {
    if (Array.isArray(existing[key]) && existing[key].length === 0) {
      patch[key] = deleteField()
    }
  }

  if (isPlainRecord(existing.social_links)) {
    const hasAnySocialValue = Object.values(existing.social_links).some((value) =>
      Boolean(normalizeString(value))
    )
    if (!hasAnySocialValue && !('social_links.website' in patch)) {
      patch.social_links = deleteField()
    }
  }

  return patch
}
