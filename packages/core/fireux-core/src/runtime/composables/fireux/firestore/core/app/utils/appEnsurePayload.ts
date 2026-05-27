import { deleteField } from 'firebase/firestore'
import { useRuntimeConfig } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { AppCreateInput } from '../../../../../../models/core/app.model'
import { normalizeString } from '../../../../../../utils/slug/normalizeSlug'

type FireuxConfig = ReturnType<typeof useFireUXConfig>

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function resolveRuntimeProjectId(): string {
  const runtime = useRuntimeConfig()
  return normalizeString(runtime.public?.firebaseEcosystem?.firebase?.projectId)
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
  const payload = pruneEmptyBootstrapValue({
    id: fireux.appId,
    project_id: normalizeString(fireux.ecosystem),
    ecosystem_id: fireux.ecosystem,
    database_id: resolveRuntimeDatabaseId(),
    slug: fireux.appId,
    status: 'active',
    app_name: fireux.appName,
    app_short_name: fireux.appShortName,
    role: fireux.role,
    ecosystem: fireux.ecosystem,
    social_links: {
      website: fireux.siteUrl,
    },
    media: {
      thumbnail_url: fireux.appThumbnail,
      logo_url: fireux.appLogo,
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
  const runtimeProjectId = resolveRuntimeProjectId()
  const projectId = normalizeString(fireux.ecosystem)
  const databaseId = resolveRuntimeDatabaseId()

  const ensureStringFields: Record<string, string> = {
    id: fireux.appId,
    ecosystem_id: fireux.ecosystem,
    slug: fireux.appId,
    status: 'active',
    app_name: fireux.appName,
    app_short_name: fireux.appShortName,
    role: fireux.role,
    ecosystem: fireux.ecosystem,
  }

  for (const [key, value] of Object.entries(ensureStringFields)) {
    if (!normalizeString(existing[key])) {
      patch[key] = value
    }
  }

  const existingProjectId = normalizeString(existing.project_id)
  if (projectId && (!existingProjectId || existingProjectId === runtimeProjectId)) {
    patch.project_id = projectId
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
    thumbnail_url: normalizeString(fireux.appThumbnail),
    logo_url: normalizeString(fireux.appLogo),
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
    'team',
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
