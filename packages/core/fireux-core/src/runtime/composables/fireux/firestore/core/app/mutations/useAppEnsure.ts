// FILE: packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppEnsure.ts

import { deleteField, doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { $fetch } from 'ofetch'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { useFirestoreEcosystemEnsure } from '../../../system/ecosystem/mutations/useFirestoreEcosystemEnsure'
import { useFirestoreProjectEnsure } from '../../../system/project/mutations/useFirestoreProjectEnsure'
import type { AppMediaSyncResponse } from '../utils/appMedia'
import { useAppCreate, type CreateAppInput } from './useAppCreate'

type EnsureAppResult = {
  created: boolean
  id: string
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function pruneEmptyBootstrapValue(value: unknown): unknown {
  if (value == null) return undefined

  if (typeof value === 'string') {
    const trimmed = value.trim()
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

function buildCreatePayload(fireux: ReturnType<typeof useFireUXConfig>): CreateAppInput {
  const payload = pruneEmptyBootstrapValue({
    id: fireux.appId,
    project_id: fireux.ecosystem,
    ecosystem_id: fireux.ecosystem,
    slug: fireux.appId,
    status: 'active',
    app_name: fireux.appName,
    app_short_name: fireux.appShortName,
    role: fireux.role,
    ecosystem: fireux.ecosystem,
    console_enabled: true,
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

  return (payload ?? {}) as CreateAppInput
}

function buildRepairPatch(
  existing: Record<string, unknown>,
  fireux: ReturnType<typeof useFireUXConfig>
) {
  const patch: Record<string, unknown> = {}

  const ensureStringFields: Record<string, string> = {
    id: fireux.appId,
    project_id: fireux.ecosystem,
    ecosystem_id: fireux.ecosystem,
    slug: fireux.appId,
    status: 'active',
    app_name: fireux.appName,
    app_short_name: fireux.appShortName,
    role: fireux.role,
    ecosystem: fireux.ecosystem,
  }

  for (const [key, value] of Object.entries(ensureStringFields)) {
    if (!asTrimmedString(existing[key])) {
      patch[key] = value
    }
  }

  if (typeof existing.console_enabled !== 'boolean') {
    patch.console_enabled = true
  }

  const websiteUrl = asTrimmedString(fireux.siteUrl)
  const socialLinks = isPlainRecord(existing.social_links) ? existing.social_links : {}
  if (websiteUrl && !asTrimmedString(socialLinks.website)) {
    patch['social_links.website'] = websiteUrl
  }

  const media = isPlainRecord(existing.media) ? existing.media : {}
  const mediaDefaults: Record<string, string> = {
    thumbnail_url: asTrimmedString(fireux.appThumbnail),
    logo_url: asTrimmedString(fireux.appLogo),
  }

  for (const [key, value] of Object.entries(mediaDefaults)) {
    if (!value) continue
    if (!asTrimmedString(media[key])) {
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
    const current = asTrimmedString(media[key])
    if (current.startsWith('/img/')) {
      patch[`media.${key}`] = deleteField()
    }
  }

  const deleteIfEmpty = [
    'team',
    'tagline',
    'description',
    'short_bio',
    'long_bio',
    'moderation_state',
  ]

  for (const key of deleteIfEmpty) {
    if (key in existing && !asTrimmedString(existing[key])) {
      patch[key] = deleteField()
    }
  }

  const deleteEmptyArrays = ['join_requests', 'ban_reasons']
  for (const key of deleteEmptyArrays) {
    if (Array.isArray(existing[key]) && existing[key].length === 0) {
      patch[key] = deleteField()
    }
  }

  if (isPlainRecord(existing.social_links)) {
    const hasAnySocialValue = Object.values(existing.social_links).some((value) =>
      Boolean(asTrimmedString(value))
    )
    if (!hasAnySocialValue && !('social_links.website' in patch)) {
      patch.social_links = deleteField()
    }
  }

  return patch
}

export function useAppEnsure() {
  const db = useFirestore()
  const { createApp } = useAppCreate()
  const { updateDocument } = useFirestoreUpdate()
  const { ensureFirestoreProjectDoc } = useFirestoreProjectEnsure()
  const { ensureFirestoreEcosystemDoc } = useFirestoreEcosystemEnsure()

  async function syncAppMedia(appId?: string): Promise<AppMediaSyncResponse> {
    const fireux = useFireUXConfig()
    const targetAppId = String(appId || fireux.appId || '').trim()
    if (!targetAppId) {
      throw new Error('[useAppEnsure] Missing appId for media sync')
    }

    return await $fetch<AppMediaSyncResponse>('/api/internal/app/sync-media', {
      method: 'POST',
      body: { appId: targetAppId },
    })
  }

  async function ensureApp(): Promise<EnsureAppResult> {
    const fireux = useFireUXConfig()
    await ensureFirestoreProjectDoc()
    await ensureFirestoreEcosystemDoc()

    const createPayload = buildCreatePayload(fireux)

    const ref = doc(db, 'apps', fireux.appId)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      const repairPatch = buildRepairPatch(
        (snap.data() as Record<string, unknown>) ?? {},
        fireux
      )

      if (Object.keys(repairPatch).length) {
        await updateDocument('apps', fireux.appId, repairPatch)
      }
      return { created: false, id: fireux.appId }
    }

    // NOTE: App creation does NOT imply user membership.
    // User ↔ App binding is handled explicitly elsewhere.

    await createApp(createPayload)

    return { created: true, id: fireux.appId }
  }

  return { ensureApp, syncAppMedia }
}
