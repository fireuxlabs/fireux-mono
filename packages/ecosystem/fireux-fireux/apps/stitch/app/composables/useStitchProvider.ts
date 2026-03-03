import { doc } from 'firebase/firestore'
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import { STITCH_PROVIDER_COLLECTION, type StitchProvider } from '../models/stitch.provider.model'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function textList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.map((entry) => text(entry)).filter(Boolean)
}

function numeric(value: unknown): number | undefined {
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined
}

function normalizeProvider(raw: unknown, fallbackId: string): StitchProvider | null {
  if (!raw) return null
  const doc = raw as Record<string, unknown>
  const type = text(doc.type)
  const availability = text(doc.availability)

  return {
    id: text(doc.id) || fallbackId,
    display_name: text(doc.display_name),
    handle: text(doc.handle) || undefined,
    type: type === 'agency' ? 'agency' : 'individual',
    website_url: text(doc.website_url) || undefined,
    contact_email: text(doc.contact_email) || undefined,
    location: text(doc.location) || undefined,
    timezone: text(doc.timezone) || undefined,
    languages: textList(doc.languages),
    tags: textList(doc.tags),
    rate_hourly_min: numeric(doc.rate_hourly_min),
    rate_hourly_max: numeric(doc.rate_hourly_max),
    availability: availability === 'limited' || availability === 'unavailable' ? availability : 'available',
    bio: text(doc.bio) || undefined,
    linkedin_url: text(doc.linkedin_url) || undefined,
    created_at: (doc.created_at as any) ?? null,
    updated_at: (doc.updated_at as any) ?? null,
    created_by_uid: text(doc.created_by_uid),
    is_verified: Boolean(doc.is_verified),
    is_public: doc.is_public !== false,
  }
}

export function useStitchProvider(providerId: MaybeRef<string | null | undefined>) {
  const id = computed(() => text(unref(providerId)))

  if (import.meta.server) {
    return { provider: computed<StitchProvider | null>(() => null), pending: computed(() => false) }
  }

  const db = useFirestore()
  const ref = computed(() => (id.value ? doc(db, STITCH_PROVIDER_COLLECTION, id.value) : null))
  const { data } = useDocument<Record<string, unknown> | undefined>(ref as any)

  return {
    provider: computed(() => normalizeProvider(data.value ?? null, id.value)),
    pending: computed(() => Boolean(ref.value) && data.value === undefined),
  }
}
