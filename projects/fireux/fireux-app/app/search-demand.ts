import { defineAppSearchDemand } from 'fireux-core/config/app/search-demand'
import { demandAnalysis, demandSummary } from './search-demand/analysis'
import { demandCapabilities } from './search-demand/capabilities'
import { demandObservations } from './search-demand/evidence'
import { demandTools } from './search-demand/tools'

export const searchDemand = defineAppSearchDemand({
  domain: 'SaaS App creation and operation',
  operator: 'SaaS App owners and operators',
  description:
    'The domain covers the work required to take a SaaS App from an accepted brief or working prototype through configuration, production launch and continued operation. Generic project and task management remain outside that lifecycle.',
  summary: demandSummary,
  analysis: demandAnalysis,
  tools: demandTools,
  capabilities: demandCapabilities,
  observations: demandObservations,
})
