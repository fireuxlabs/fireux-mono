import { defineAppSearchDemand } from 'fireux-core/config/app/search-demand'
import { demandAnalysis } from './search-demand/analysis'
import { capabilities } from './search-demand/capabilities'
import {
  autocompleteObservations,
  validationObservations,
} from './search-demand/evidence'
import { demandTools } from './search-demand/tools'
import { industryObservations } from './search-demand/industry-evidence'

export const searchDemand = defineAppSearchDemand({
  domain: 'Kitchen operations',
  research_scope: {
    audience:
      'Independent restaurants and cafés as the initial validation audience; broader Kitchen formats remain comparison contexts.',
    geography:
      'Switzerland first, with DACH and US comparisons labelled separately.',
    languages: ['German', 'English'],
    reviewed_at: '2026-10-05',
    limitations:
      'Desk research only. No original operator interviews, measured search volumes or willingness-to-pay validation. Older pricing observations retain their historical dates. Capability groupings remain proposals; this research does not change Workspace navigation or grant tool authority.',
  },
  operator: 'Kitchen operators',
  description:
    'The domain covers people operating professional food-service Kitchens across restaurant, hotel, catering, bakery, cloud, commissary, institutional and multi-site settings. It investigates what they need to understand, create, record, coordinate, monitor or improve. Front-of-House guest service, tables, payments, payroll and general accounting remain adjacent unless Kitchen work directly crosses their boundary.',
  summary: {
    conclusion:
      'Current market and operator evidence supports a focused Ingredient–Recipe–Menu value chain, especially Menu digitisation and Recipe Costing, while broader Kitchen operations remain distinct jobs rather than one proven “all-in-one” purchase.',
    findings: [
      'The newer sourced brief identifies Safety, Menu, Service, Costs and sales, Stock, Production and Supply as candidate areas. They are research groupings, not a replacement of existing capability owners or navigation. Need confidence, product adoption and source implementation readiness remain separate.',
      'Current client-delivery priority is Hotel Bären website ordering: customer request, Kitchen confirmation, payment choice, fulfilment and ticket/Sale evidence. This comes from the stated client requirement and is separate from broad search-demand or market validation.',
      'HACCP, food-safety plans and temperature records are a first-class Kitchen demand family and must inform the Workspace architecture.',
      'Template, spreadsheet, PDF, free and app modifiers reveal immediate jobs currently handled with paper or general-purpose tools.',
      'The connected Kitchen graph remains valuable, but every capability must answer a named operator job rather than merely mirror stored entities.',
      'Google Autocomplete establishes query language and breadth; it does not establish absolute volume, commercial value or final build priority.',
      'Public prices show existing commercial offerings around Recipe Costing, Inventory and invoice automation. They do not prove adoption or Swiss willingness to pay.',
      'Qualitatively, Menu digitisation ranks first on demand, intent, current readiness, strategic fit and bounded implementation cost; Recipe management and scaling rank next, while authoritative Recipe Costing remains a high-demand validation hypothesis until quantities, yields, conversions and purchase prices are complete.',
      'Allergen and HACCP evidence establishes jurisdiction-specific obligations and operator work, not search volume, legal advice or an automatic product priority.',
      'Inventory and supplier-price automation have established operator jobs and commercial offerings, but low Misebox readiness and substantial integration needs; a broad restaurant ERP has no evidence-backed first-build case.',
    ],
    next_step:
      'Complete the bounded Hotel Bären website-ordering delivery proof first; retain separate Swiss/DACH and English conversion tests for managed Menu digitisation and Recipe/portion costing, recording operator role, venue type, current method and willingness-to-pay without presenting requested costing Tools as available.',
  },
  analysis: demandAnalysis,
  capabilities,
  tools: demandTools,
  observations: [
    ...autocompleteObservations,
    ...validationObservations,
    ...industryObservations,
  ],
})
