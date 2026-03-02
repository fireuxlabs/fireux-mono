import { collection, query, where } from 'firebase/firestore'
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useCollection, useFirestore } from 'vuefire'
import {
  STITCH_PROVIDER_COLLECTION,
  type StitchProvider,
} from '../models/stitch.provider.model'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export interface StitchProviderListOptions {
  onlyPublic?: MaybeRef<boolean>
  createdByUid?: MaybeRef<string | null | undefined>
  search?: MaybeRef<string>
  tags?: MaybeRef<string[]>
}

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

function normalizeProvider(raw: unknown, fallbackId: string): StitchProvider {
  const doc = (raw || {}) as Record<string, unknown>

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

export function useStitchProviders(options: StitchProviderListOptions = {}) {
  if (import.meta.server) {
    const empty = computed<StitchProvider[]>(() => [])
    return {
      providers: empty,
      filteredProviders: empty,
      availableTags: computed<string[]>(() => []),
      pending: computed(() => false),
    }
  }

  const db = useFirestore()

  const onlyPublic = computed(() => {
    const value = unref(options.onlyPublic)
    return value !== false
  })

  const createdByUid = computed(() => normalizeString(unref(options.createdByUid)))
  const search = computed(() => normalizeString(unref(options.search)).toLowerCase())
  const selectedTags = computed(() => normalizeStringArray(unref(options.tags)))

  const q = computed(() => {
    const constraints: any[] = []

    if (onlyPublic.value) {
      constraints.push(where('is_public', '==', true))
    }

    if (createdByUid.value) {
      constraints.push(where('created_by_uid', '==', createdByUid.value))
    }

    return query(collection(db, STITCH_PROVIDER_COLLECTION), ...constraints)
  })

  const docs = useCollection(q)

  const providers = computed<StitchProvider[]>(() => {
    const source = docs.value ?? []
    return source.map((entry: any) => {
      const id = normalizeString(entry?.id)
      return normalizeProvider(entry, id)
    })
  })

  const filteredProviders = computed<StitchProvider[]>(() => {
    const queryText = search.value
    const tags = selectedTags.value

    return providers.value.filter((provider) => {
      const matchesSearch =
        !queryText ||
        [
          provider.display_name,
          provider.handle || '',
          provider.website_url || '',
          provider.bio || '',
        ]
          .join(' ')
          .toLowerCase()
          .includes(queryText)

      const matchesTags = !tags.length || tags.every((tag) => provider.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  })

  const availableTags = computed<string[]>(() => {
    const set = new Set<string>()
    for (const provider of providers.value) {
      for (const tag of provider.tags) {
        set.add(tag)
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  })

  const pending = computed(() => docs.value === undefined)

  return {
    providers,
    filteredProviders,
    availableTags,
    pending,
  }
}
