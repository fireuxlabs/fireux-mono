import { collection, query, where } from 'firebase/firestore'
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useCollection, useFirestore } from 'vuefire'
import {
  STITCH_REQUEST_COLLECTION,
  type StitchRequest,
  type StitchRequestStatus,
} from '../models/stitch.request.model'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export interface StitchRequestListOptions {
  createdByUid?: MaybeRef<string | null | undefined>
  search?: MaybeRef<string>
  tags?: MaybeRef<string[]>
  status?: MaybeRef<StitchRequestStatus | 'all' | ''>
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

function normalizeRequest(raw: unknown, fallbackId: string): StitchRequest {
  const doc = (raw || {}) as Record<string, unknown>
  const status = normalizeString(doc.status)
  const budgetType = normalizeString(doc.budget_type)

  return {
    id: normalizeString(doc.id) || fallbackId,
    title: normalizeString(doc.title),
    summary: normalizeString(doc.summary),
    scope: normalizeString(doc.scope),
    tags: normalizeStringArray(doc.tags),
    budget_type:
      budgetType === 'fixed' || budgetType === 'retainer' ? budgetType : 'hourly',
    budget_min: normalizeNumber(doc.budget_min),
    budget_max: normalizeNumber(doc.budget_max),
    start_date: (doc.start_date as any) ?? null,
    duration: normalizeString(doc.duration) || undefined,
    timezone: normalizeString(doc.timezone) || undefined,
    status: status === 'paused' || status === 'closed' ? status : 'open',
    created_by_uid: normalizeString(doc.created_by_uid),
    created_at: (doc.created_at as any) ?? null,
    updated_at: (doc.updated_at as any) ?? null,
  }
}

export function useStitchRequests(options: StitchRequestListOptions = {}) {
  if (import.meta.server) {
    const empty = computed<StitchRequest[]>(() => [])
    return {
      requests: empty,
      filteredRequests: empty,
      pending: computed(() => false),
    }
  }

  const db = useFirestore()

  const createdByUid = computed(() => normalizeString(unref(options.createdByUid)))
  const search = computed(() => normalizeString(unref(options.search)).toLowerCase())
  const selectedTags = computed(() => normalizeStringArray(unref(options.tags)))
  const selectedStatus = computed(() => normalizeString(unref(options.status) || 'all'))

  const q = computed(() => {
    const constraints: any[] = []

    if (createdByUid.value) {
      constraints.push(where('created_by_uid', '==', createdByUid.value))
    }

    return query(collection(db, STITCH_REQUEST_COLLECTION), ...constraints)
  })

  const docs = useCollection(q)

  const requests = computed<StitchRequest[]>(() => {
    const source = docs.value ?? []
    return source.map((entry: any) => {
      const id = normalizeString(entry?.id)
      return normalizeRequest(entry, id)
    })
  })

  const filteredRequests = computed<StitchRequest[]>(() => {
    const queryText = search.value
    const tags = selectedTags.value
    const status = selectedStatus.value

    return requests.value.filter((request) => {
      const matchesSearch =
        !queryText ||
        [request.title, request.summary, request.scope].join(' ').toLowerCase().includes(queryText)
      const matchesTags = !tags.length || tags.every((tag) => request.tags.includes(tag))
      const matchesStatus = status === 'all' || !status || request.status === status

      return matchesSearch && matchesTags && matchesStatus
    })
  })

  const pending = computed(() => docs.value === undefined)

  return {
    requests,
    filteredRequests,
    pending,
  }
}
