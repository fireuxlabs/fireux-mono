import { collection, query, where } from 'firebase/firestore'
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useCollection, useFirestore } from 'vuefire'
import { STITCH_REQUEST_COLLECTION, type StitchRequest, type StitchRequestStatus } from '../models/stitch.request.model'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export interface StitchRequestListOptions {
  createdByUid?: MaybeRef<string | null | undefined>
  search?: MaybeRef<string>
  tags?: MaybeRef<string[]>
  status?: MaybeRef<StitchRequestStatus | 'all' | ''>
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

function normalizeRequest(raw: unknown, fallbackId: string): StitchRequest {
  const doc = (raw || {}) as Record<string, unknown>
  const status = text(doc.status)
  const budgetType = text(doc.budget_type)

  return {
    id: text(doc.id) || fallbackId,
    title: text(doc.title),
    summary: text(doc.summary),
    scope: text(doc.scope),
    tags: textList(doc.tags),
    budget_type: budgetType === 'fixed' || budgetType === 'retainer' ? budgetType : 'hourly',
    budget_min: numeric(doc.budget_min),
    budget_max: numeric(doc.budget_max),
    start_date: (doc.start_date as any) ?? null,
    duration: text(doc.duration) || undefined,
    timezone: text(doc.timezone) || undefined,
    status: status === 'paused' || status === 'closed' ? status : 'open',
    created_by_uid: text(doc.created_by_uid),
    created_at: (doc.created_at as any) ?? null,
    updated_at: (doc.updated_at as any) ?? null,
  }
}

export function useStitchRequests(options: StitchRequestListOptions = {}) {
  if (import.meta.server) {
    const empty = computed<StitchRequest[]>(() => [])
    return { requests: empty, filteredRequests: empty, pending: computed(() => false) }
  }

  const db = useFirestore()
  const createdByUid = computed(() => text(unref(options.createdByUid)))
  const search = computed(() => text(unref(options.search)).toLowerCase())
  const selectedTags = computed(() => textList(unref(options.tags)))
  const selectedStatus = computed(() => text(unref(options.status) || 'all'))

  const q = computed(() => {
    const constraints: any[] = []
    if (createdByUid.value) constraints.push(where('created_by_uid', '==', createdByUid.value))
    return query(collection(db, STITCH_REQUEST_COLLECTION), ...constraints)
  })

  const docs = useCollection(q)

  const requests = computed(() => {
    const source = docs.value ?? []
    return source.map((entry: any) => normalizeRequest(entry, text(entry?.id)))
  })

  const filteredRequests = computed(() => {
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

  return { requests, filteredRequests, pending: computed(() => docs.value === undefined) }
}
