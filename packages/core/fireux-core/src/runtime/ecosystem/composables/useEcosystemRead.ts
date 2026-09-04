import { computed, isRef, ref, type Ref } from 'vue'
import { doc } from 'firebase/firestore'
import { readRuntimeIdentityFirestoreDatabaseId, useDocument, useFirestore } from '../../composables/fireux/firestore/vuefire'
import type { Ecosystem } from '../models/ecosystem.model'

/** Live read of exactly one root Ecosystem document. */
export function useEcosystemRead(id: string | null | undefined | Ref<string | null | undefined>) {
  if (import.meta.server) return { ecosystem: ref<Ecosystem | undefined>(), pending: ref(false), error: ref<unknown>(null) }
  const ecosystemId = computed(() => String(isRef(id) ? id.value || '' : id || '').trim())
  const db = useFirestore(readRuntimeIdentityFirestoreDatabaseId())
  const reference = computed(() => ecosystemId.value ? doc(db, 'ecosystems', ecosystemId.value) : null)
  const state = useDocument<Ecosystem>(reference as any)
  return {
    ecosystem: computed<Ecosystem | null | undefined>(() => ecosystemId.value ? state.data.value ?? null : undefined),
    pending: state.pending,
    error: state.error,
  }
}
