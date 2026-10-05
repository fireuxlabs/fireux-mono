import { currentProjectEvidence } from './search-demand/current-evidence'
import { projectReconciliation } from './search-demand/reconciliation'
import { defineAppSearchDemand } from 'fireux-core/config/app/search-demand'
import { demandAnalysis, demandSummary } from './search-demand/analysis'
import { demandCapabilities } from './search-demand/capabilities'
import { demandObservations } from './search-demand/evidence'
import { demandTools } from './search-demand/tools'

export const searchDemand = defineAppSearchDemand({
  domain: 'Industry SaaS ignition and operation',
  research_scope: {
    audience:
      'Creators and operators building an industry SaaS, with branded Apps inside a connected ecosystem where justified.',
    geography:
      'Switzerland-first product context; international platform documentation is comparison evidence.',
    languages: ['English', 'German'],
    reviewed_at: '2026-10-05',
    limitations:
      'Desk research and bounded source inspection. No operator interviews, measured conversion or willingness-to-pay validation. Earlier search observations retain their dates; platform features do not prove FireUX generation or market fit.',
  },
  reconciliation: projectReconciliation,
  operator: 'Creators and operators of industry SaaS products',
  description:
    'Help creators ignite and organise Projects: identify industry jobs, create an owned SaaS App, reuse supported behaviour for branded Apps and ecosystems, then release and operate it. This research records the ambition and hypotheses separately from current implementation.',
  summary: demandSummary,
  analysis: demandAnalysis,
  tools: demandTools,
  capabilities: demandCapabilities,
  observations: [...demandObservations, ...currentProjectEvidence],
})
