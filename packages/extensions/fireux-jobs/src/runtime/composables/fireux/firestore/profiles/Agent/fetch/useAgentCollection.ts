// Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: keep the legacy alias on the safe Agent fetch.
import { useAgentFetch } from './useAgentFetch'

export function useAgentCollection() {
  const { coreAgents, appAgents } = useAgentFetch()

  return {
    coreAgents,
    appAgents,
  }
}
