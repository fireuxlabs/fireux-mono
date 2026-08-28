import type { AppSearchDemand } from 'fireux-core/config/app/search-demand'
import { foodDemandFamilies } from './analysis-food'
import { operationsDemandFamilies } from './analysis-operations'

export type DemandFamily = {
  id: string
  title: string
  operatorJob: string
  confidence: 'early' | 'moderate' | 'strong'
  intents: AppSearchDemand['analysis']['clusters'][number]['intents']
  interpretation: string
  boundary?: string
  gap?: string
  seeds: Array<{ seed: string; suggestions: string[] }>
}

export const demandFamilies: DemandFamily[] = [...foodDemandFamilies, ...operationsDemandFamilies]

export const demandAnalysis: AppSearchDemand['analysis'] = {
  summary: 'This coverage-validation pass contains fourteen Kitchen demand families and tests both operator jobs and Kitchen formats. It prevents one software category, compliance concern or restaurant format from defining the domain while retaining explicit gaps where evidence depth remains limited.',
  clusters: demandFamilies.map((family) => ({
    id: family.id, title: family.title, operator_job: family.operatorJob, intents: family.intents,
    evidence_queries: family.seeds.flatMap((seed) => seed.suggestions), confidence: family.confidence,
    interpretation: family.interpretation, boundary: family.boundary, research_gap: family.gap,
  })),
  next_step: 'Measure impressions, qualified visits, starts and completions for the two bounded tests, then compare those results with the existing capability-owned research before changing build priority.',
}

