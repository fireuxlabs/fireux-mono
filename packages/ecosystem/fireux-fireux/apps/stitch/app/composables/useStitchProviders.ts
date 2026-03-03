import { collection, query, where } from 'firebase/firestore'
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useCollection, useFirestore } from 'vuefire'
import { STITCH_PROVIDER_COLLECTION, type StitchProvider } from '../models/stitch.provider.model'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export interface StitchProviderListOptions {
  onlyPublic?: MaybeRef<boolean>
  createdByUid?: MaybeRef<string | null | undefined>
  search?: MaybeRef<string>
  tags?: MaybeRef<string[]>
}

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

function normalizeProvider(raw: unknown, fallbackId: string): StitchProvider {
  const doc = (raw || {}) as Record<string, unknown>
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
  const onlyPublic = computed(() => unref(options.onlyPublic) !== false)
  const createdByUid = computed(() => text(unref(options.createdByUid)))
  const search = computed(() => text(unref(options.search)).toLowerCase())
  const selectedTags = computed(() => textList(unref(options.tags)))

  const q = computed(() => {
    const constraints: any[] = []
    if (onlyPublic.value) constraints.push(where('is_public', '==', true))
    if (createdByUid.value) constraints.push(where('created_by_uid', '==', createdByUid.value))
    return query(collection(db, STITCH_PROVIDER_COLLECTION), ...constraints)
  })

  const docs = useCollection(q)

  const providers = computed<StitchProvider[]>(() => {
    const source = docs.value ?? []
    return source.map((entry: any) => normalizeProvider(entry, text(entry?.id)))
  })

  const filteredProviders = computed(() => {
    const queryText = search.value
    const tags = selectedTags.value

    return providers.value.filter((provider) => {
      const matchesSearch =
        !queryText ||
        [provider.display_name, provider.handle || '', provider.website_url || '', provider.bio || '']
          .join(' ')
          .toLowerCase()
          .includes(queryText)

      const matchesTags = !tags.length || tags.every((tag) => provider.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  })

  const availableTags = computed(() => {
    const set = new Set<string>()
    for (const provider of providers.value) {
      for (const tag of provider.tags) set.add(tag)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  })

  return {
    providers,
    filteredProviders,
    availableTags,
    pending: computed(() => docs.value === undefined),
  }
}
