// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/fetch/useProfessionalCollection.ts

// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: keep the legacy alias on the safe Professional fetch.
import { useProfessionalFetch } from './useProfessionalFetch'

export function useProfessionalCollection() {
  const { coreProfessionals, appProfessionals } = useProfessionalFetch()

  return {
    coreProfessionals,
    appProfessionals,
  }
}
