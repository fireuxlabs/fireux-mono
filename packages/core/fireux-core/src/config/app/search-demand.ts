import { createJiti } from 'jiti'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export type SearchDemandMetric = {
  label: string
  value: string | number
}

export type ResearchConfidence = 'early' | 'moderate' | 'strong'

export type SearchDemandObservationBase = {
  id?: string
  query: string
  geography: string
  language: string
  observed_at: string
  published_at?: string
  period?: string
  metrics?: SearchDemandMetric[]
  finding?: string
  limitations?: string
  note?: string
  source_url?: string
}

// Existing search observations remain valid; direct evidence carries provenance.
export type SearchDemandObservation = SearchDemandObservationBase &
  (
    | {
        query: string
        source:
          | 'google-search-console'
          | 'google-trends'
          | 'google-autocomplete'
          | 'live-search-results'
      }
    | {
        id: string
        source:
          | 'official-statistics'
          | 'operator-survey'
          | 'operator-interview'
          | 'operator-discussion'
          | 'regulatory-guidance'
          | 'operational-guidance'
          | 'product-documentation'
          | 'operator-case-study'
        source_url: string
        finding: string
        limitations: string
      }
  )

export type SearchDemandCluster = {
  id: string
  title: string
  operator_job: string
  intents: Array<'learn' | 'compare' | 'choose' | 'perform' | 'troubleshoot'>
  evidence_queries: string[]
  confidence: ResearchConfidence
  source_observation_ids?: string[]
  interpretation: string
  boundary?: string
  research_gap?: string
}

export type SearchDemandToolHypothesis = {
  id: string
  title: string
  source_cluster_ids: string[]
  operator_job: string
  outcome: string
  status: 'test-now' | 'research-next' | 'later' | 'boundary'
}

export type ResearchCapabilityAssessment = {
  market: {
    confidence: ResearchConfidence
    rationale: string
    validation_gap: string
    source_observation_ids: string[]
  }
  implementation: {
    status:
      | 'not-assessed'
      | 'not-connected'
      | 'partial'
      | 'connected'
      | 'verified'
    assessed_at: string
    scope: string
    source_paths: string[]
  }
}

// App-authored target scope. No runtime enabling, storage ownership or release claim.
export type ResearchCapabilityDefinition = {
  purpose: string
  manages: string[]
  uses: string[]
  tools: string[]
  boundaries: string[]
  service_example: string
}

export type SearchDemandCapability = {
  definition?: ResearchCapabilityDefinition
  priority?: { rank: number; rationale: string }
  assessment?: ResearchCapabilityAssessment
  id: string
  title: string
  decision:
    | 'proposed'
    | 'establish-now'
    | 'establish-later'
    | 'context'
    | 'derived'
    | 'boundary'
  source_cluster_ids: string[]
  source_tool_ids: string[]
  rationale: string
  research_route?: string
}

export type SearchDemandWorkspaceProposal = {
  summary: string
  groups: Array<{
    label: string
    items: Array<{
      label: string
      icon: string
      capability_id?: string
      brief?: string
    }>
  }>
}

export type ResearchDeliveryBrief = {
  // Existing capability settings reused by this journey, not a runtime config registry.
  configuration?: Array<{
    label: string
    owner: string
    settings: string[]
    tool: string
    source_paths: string[]
  }>
  title: string
  purpose: string
  capability_ids: string[]
  pages: Array<{
    label: string
    path: string
    availability: 'enabled' | 'not-enabled' | 'planned'
  }>
  tools: Array<{
    label: string
    status: 'connected' | 'partial' | 'planned'
    owner: string
    source_paths: string[]
  }>
  services: Array<{
    label: string
    status: 'connected' | 'partial' | 'planned'
    owner: string
    source_paths: string[]
  }>
  acceptance: string[]
  gaps: string[]
  checks: string[]
}

export type ResearchReconciliation = {
  first_journey?: ResearchDeliveryBrief
  workspace: string
  reviewed_at: string
  summary: string
  foundations: string[]
  entries: Array<{
    id: string
    title: string
    action: 'keep' | 'improve' | 'validate' | 'defer'
    status: ResearchCapabilityAssessment['implementation']['status']
    rationale: string
    source_paths: string[]
    source_capability_ids: string[]
    source_observation_ids: string[]
  }>
}

export type AppSearchDemand = {
  related_research?: Record<string, AppSearchDemand>
  reconciliation?: ResearchReconciliation
  research_scope?: {
    audience: string
    geography: string
    languages: string[]
    reviewed_at: string
    limitations: string
  }
  domain: string
  operator: string
  description: string
  observations: SearchDemandObservation[]
  summary: {
    conclusion: string
    findings: string[]
    next_step: string
  }
  analysis: {
    summary: string
    clusters: SearchDemandCluster[]
    next_step: string
  }
  tools: {
    summary: string
    tools: SearchDemandToolHypothesis[]
    next_step: string
  }
  capabilities: {
    summary: string
    capabilities: SearchDemandCapability[]
    workspace?: SearchDemandWorkspaceProposal
    next_step: string
  }
}

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

export function loadAppSearchDemand(): AppSearchDemand | null {
  const source = resolve(process.cwd(), 'app/search-demand.ts')
  if (!existsSync(source)) return null

  const loadTypeScriptModule = createJiti(import.meta.url)
  const loaded = loadTypeScriptModule(source) as {
    searchDemand?: AppSearchDemand
  }

  if (!loaded.searchDemand) {
    throw new Error(
      `[fireux] App search-demand file must export searchDemand: ${source}`
    )
  }

  return loaded.searchDemand
}
