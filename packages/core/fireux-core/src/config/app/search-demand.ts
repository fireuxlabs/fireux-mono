import { createJiti } from 'jiti'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export type SearchDemandMetric = {
  label: string
  value: string | number
}

export type SearchDemandObservation = {
  query: string
  source: 'google-search-console' | 'google-trends' | 'google-autocomplete' | 'live-search-results'
  geography: string
  language: string
  observed_at: string
  period?: string
  metrics?: SearchDemandMetric[]
  note?: string
  source_url?: string
}

export type SearchDemandCluster = {
  id: string
  title: string
  operator_job: string
  intents: Array<'learn' | 'compare' | 'choose' | 'perform' | 'troubleshoot'>
  evidence_queries: string[]
  confidence: 'early' | 'moderate' | 'strong'
  interpretation: string
  boundary?: string
  research_gap?: string
}

export type SearchDemandCapability = {
  id: string
  title: string
  decision: 'establish-now' | 'establish-later' | 'context' | 'derived' | 'boundary'
  source_cluster_ids: string[]
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

export type AppSearchDemand = {
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
    throw new Error(`[fireux] App search-demand file must export searchDemand: ${source}`)
  }

  return loaded.searchDemand
}
