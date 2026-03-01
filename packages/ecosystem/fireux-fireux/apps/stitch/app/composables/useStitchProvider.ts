import { doc } from 'firebase/firestore'
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import {
  STITCH_PROVIDER_COLLECTION,
  type StitchProvider,
} from '../models/stitch.provider.model'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

function normalizeString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => normalizeString(entry))
    .filter(Boolean)
}

function normalizeNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined
  return value
}

function normalizeProvider(raw: unknown, fallbackId: string): StitchProvider | null {
  if (!raw) return null
  const doc = raw as Record<string, unknown>

  const type = normalizeString(doc.type)
  const availability = normalizeString(doc.availability)

  return {
    id: normalizeString(doc.id) || fallbackId,
    display_name: normalizeString(doc.display_name),
    handle: normalizeString(doc.handle) || undefined,
    type: type === 'agency' ? 'agency' : 'individual',
    website_url: normalizeString(doc.website_url) || undefined,
    contact_email: normalizeString(doc.contact_email) || undefined,
    location: normalizeString(doc.location) || undefined,
    timezone: normalizeString(doc.timezone) || undefined,
    languages: normalizeStringArray(doc.languages),
    tags: normalizeStringArray(doc.tags),
    rate_hourly_min: normalizeNumber(doc.rate_hourly_min),
    rate_hourly_max: normalizeNumber(doc.rate_hourly_max),
    availability:
      availability === 'limited' || availability === 'unavailable'
        ? availability
        : 'available',
    bio: normalizeString(doc.bio) || undefined,
    linkedin_url: normalizeString(doc.linkedin_url) || undefined,
    created_at: (doc.created_at as any) ?? null,
    updated_at: (doc.updated_at as any) ?? null,
    created_by_uid: normalizeString(doc.created_by_uid),
    is_verified: Boolean(doc.is_verified),
    is_public: doc.is_public !== false,
  }
}

export function useStitchProvider(providerId: MaybeRef<string | null | undefined>) {
  const id = computed(() => normalizeString(unref(providerId)))

  if (import.meta.server) {
    return {
      provider: computed<StitchProvider | null>(() => null),
      pending: computed(() => false),
    }
  }

  const db = useFirestore()

  const ref = computed(() => {
    if (!id.value) return null
    return doc(db, STITCH_PROVIDER_COLLECTION, id.value)
  })

  const { data } = useDocument<Record<string, unknown> | undefined>(ref as any)

  const provider = computed(() => normalizeProvider(data.value ?? null, id.value))
  const pending = computed(() => Boolean(ref.value) && data.value === undefined)

  return {
    provider,
    pending,
  }
}
