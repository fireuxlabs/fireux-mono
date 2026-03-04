// packages/core/fireux-core/src/runtime/composables/fireux/app/runtime-app/useRuntimeAppDocument.ts

import { computed, type Ref } from 'vue'
import { useAppFetch } from '../../firestore/core/app/fetch/useAppFetch'
import { getReadOnlyAppScenario } from './read-only-scenarios'

/**
 * App runtime document resolver.
 *
 * Canon contract:
 * - doc: the resolved doc for the current runtime surface (defaulting to privateDoc for now)
 * - publicDoc: safe doc for public/SEO surfaces (currently same source as privateDoc)
 * - privateDoc: console/internal doc (currently same source)
 * - pending: fetch state
 *
 * NOTE:
 * Right now both publicDoc and privateDoc come from the same fetch.
 * Later you can swap publicDoc to a public collection/path without changing callers.
 */
export function useRuntimeAppDocument(params: {
  id: Ref<string>
  isReadOnly: Ref<boolean>
  collectionPath: Ref<string>
}) {
  // For now, use the existing fetch (likely apps/{id}).
  // When you introduce separate public vs private docs, keep this API stable.
  const { app, pending } = useAppFetch(params.id)

  const readOnlyScenario = computed(() => {
    if (!params.isReadOnly.value || !params.id.value) return null
    return getReadOnlyAppScenario(params.id.value)
  })

  const privateDoc = computed(() => {
    if (!params.id.value) return null
    if (params.isReadOnly.value) return readOnlyScenario.value?.app ?? null
    return app.value ?? null
  })

  const publicDoc = computed(() => {
    if (!params.id.value) return null
    if (params.isReadOnly.value) return readOnlyScenario.value?.app ?? null
    // placeholder: same as private until public collection exists
    return app.value ?? null
  })

  // Default resolved doc used by runtime console surfaces
  const doc = computed(() => privateDoc.value)
  const pendingState = computed(() => (params.isReadOnly.value ? false : pending.value))

  return {
    doc,
    publicDoc,
    privateDoc,
    pending: pendingState,
  }
}
