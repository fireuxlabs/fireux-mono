import { doc } from 'firebase/firestore'
import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import { STITCH_REQUEST_COLLECTION, type StitchRequest } from '../models/stitch.request.model'

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

function normalizeRequest(raw: unknown, fallbackId: string): StitchRequest | null {
  if (!raw) return null
  const doc = raw as Record<string, unknown>

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

export function useStitchRequest(requestId: MaybeRef<string | null | undefined>) {
  const id = computed(() => text(unref(requestId)))

  if (import.meta.server) {
    return { request: computed<StitchRequest | null>(() => null), pending: computed(() => false) }
  }

  const db = useFirestore()
  const ref = computed(() => (id.value ? doc(db, STITCH_REQUEST_COLLECTION, id.value) : null))
  const { data } = useDocument<Record<string, unknown> | undefined>(ref as any)

  return {
    request: computed(() => normalizeRequest(data.value ?? null, id.value)),
    pending: computed(() => Boolean(ref.value) && data.value === undefined),
  }
}
