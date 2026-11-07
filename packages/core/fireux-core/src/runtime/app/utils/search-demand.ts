import type { AppSearchDemand } from '../models/search-demand'

export function defineAppSearchDemand<const T extends AppSearchDemand>(
  demand: T
): T {
  const observations = new Set<string>()
  for (const observation of demand.observations) {
    if (!observation.id) continue
    if (observations.has(observation.id))
      throw new Error(`Duplicate research observation: ${observation.id}`)
    observations.add(observation.id)
  }
  const references = [
    ...(demand.reconciliation?.entries.map((entry) => ({
      owner: entry.id,
      ids: entry.source_observation_ids,
    })) ?? []),
    ...demand.analysis.clusters.map((cluster) => ({
      owner: cluster.id,
      ids: cluster.source_observation_ids ?? [],
    })),
    ...demand.capabilities.capabilities.map((capability) => ({
      owner: capability.id,
      ids: capability.assessment?.market.source_observation_ids ?? [],
    })),
  ]
  for (const { owner, ids } of references)
    for (const id of ids)
      if (!observations.has(id))
        throw new Error(
          `Unknown research observation ${id} referenced by ${owner}`
        )
  const capabilities = new Set(
    demand.capabilities.capabilities.map((c) => c.id)
  )
  for (const entry of demand.reconciliation?.entries ?? [])
    for (const id of entry.source_capability_ids)
      if (!capabilities.has(id))
        throw new Error(
          `Unknown research capability ${id} referenced by ${entry.id}`
        )
  for (const id of demand.reconciliation?.first_journey?.capability_ids ?? [])
    if (!capabilities.has(id))
      throw new Error(`Unknown delivery capability ${id}`)
  for (const page of demand.reconciliation?.first_journey?.pages ?? [])
    if (
      !page.path.startsWith('/') ||
      page.path.startsWith('//') ||
      /[\\?#]/.test(page.path)
    )
      throw new Error(`Delivery page must be an internal route: ${page.path}`)
  for (const brief of Object.values(demand.related_research ?? {}))
    defineAppSearchDemand(brief)
  return demand
}
