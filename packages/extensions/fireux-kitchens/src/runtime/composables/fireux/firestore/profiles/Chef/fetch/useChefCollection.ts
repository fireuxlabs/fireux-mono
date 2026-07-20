// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: keep the legacy alias on the safe Chef fetch.
import { useChefFetch } from './useChefFetch'

export function useChefCollection() {
  const { coreChefs, appChefs } = useChefFetch()

  return {
    coreChefs,
    appChefs,
  }
}
