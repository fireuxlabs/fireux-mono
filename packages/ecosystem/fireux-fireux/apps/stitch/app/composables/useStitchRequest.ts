import { doc } from 'firebase/firestore'
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import {
  STITCH_REQUEST_COLLECTION,
  type StitchRequest,
} from '../models/stitch.request.model'

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

function normalizeRequest(raw: unknown, fallbackId: string): StitchRequest | null {
  if (!raw) return null
  const doc = raw as Record<string, unknown>

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

export function useStitchRequest(requestId: MaybeRef<string | null | undefined>) {
  const id = computed(() => normalizeString(unref(requestId)))

  if (import.meta.server) {
    return {
      request: computed<StitchRequest | null>(() => null),
      pending: computed(() => false),
    }
  }

  const db = useFirestore()

  const ref = computed(() => {
    if (!id.value) return null
    return doc(db, STITCH_REQUEST_COLLECTION, id.value)
  })

  const { data } = useDocument<Record<string, unknown> | undefined>(ref as any)

  const request = computed(() => normalizeRequest(data.value ?? null, id.value))
  const pending = computed(() => Boolean(ref.value) && data.value === undefined)

  return {
    request,
    pending,
  }
}
