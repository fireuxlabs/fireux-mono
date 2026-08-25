export type KitchenPerformanceToolHypothesis = { id: `kitchen.performance.${string}`; label: string; layer: 'human' | 'ai-assisted' | 'compound'; purpose: string; inputs: readonly string[]; outputs: readonly string[]; evidence: readonly string[]; authority: string; approval: string; status: 'requested' }

export const kitchenPerformanceSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do when they search for Kitchen Performance reporting?',
  method: 'Current search results establish operator language. Official KDS and hospitality literature validates reporting jobs. FireUX may expose only measures produced by complete, timestamped operational records.',
  seeds: [
    { seed: 'Kitchen ticket Performance', queries: ['kitchen ticket time report', 'KDS performance report', 'restaurant preparation time analysis', 'kitchen speed of service report'] },
    { seed: 'Station Performance', queries: ['kitchen station performance report', 'KDS station ticket time', 'restaurant station bottleneck analysis', 'kitchen tickets by station'] },
    { seed: 'production and prep', queries: ['kitchen production report', 'restaurant prep completion report', 'kitchen prep productivity report', 'mise en place completion dashboard'] },
    { seed: 'Kitchen operations dashboard', queries: ['kitchen operations dashboard', 'restaurant operational performance report', 'kitchen readiness report', 'compare kitchen performance periods'] },
  ],
  clusters: [
    { id: 'service', title: 'Understand service timing', operatorJob: 'Measure complete Order lifecycle durations such as accepted-to-ready or fired-to-completed using explicit transition timestamps.', evidenceQueries: ['kitchen ticket time report', 'kitchen speed of service report'], interpretation: 'The start and end event definitions must be named. FireUX Orders do not yet retain the complete transition history required for authoritative ticket-time reporting.' },
    { id: 'station', title: 'Locate evidenced Station bottlenecks', operatorJob: 'Compare ticket volume and timing by the Station that actually received and completed work.', evidenceQueries: ['kitchen station performance report', 'KDS station ticket time'], interpretation: 'Stable Station routing plus Station-specific work timestamps are required. A device, assignee or current mapping cannot reconstruct historical routing.' },
    { id: 'production', title: 'Review prep completion and blockers', operatorJob: 'Compare planned Mise work with recorded starts, completions, lateness and blocked outcomes.', evidenceQueries: ['restaurant prep completion report', 'mise en place completion dashboard'], interpretation: 'Task counts and duration are operational measures. They do not prove human productivity, labour efficiency or individual performance.' },
    { id: 'readiness', title: 'Review time-bound readiness', operatorJob: 'Understand whether required Station and Food Safety checks were completed before the relevant service.', evidenceQueries: ['kitchen readiness report', 'kitchen operations dashboard'], interpretation: 'Configuration is not completion evidence. Each readiness result needs requirement version, service context, actor and time.' },
    { id: 'compare', title: 'Compare like periods and definitions', operatorJob: 'Compare supported measures across equivalent Kitchen-local services or periods with workload context.', evidenceQueries: ['restaurant operational performance report', 'compare kitchen performance periods'], interpretation: 'Volume, item mix and missing records remain visible. A change does not by itself establish cause, quality, staffing need or profit impact.' },
  ],
  validationSources: [
    { label: 'Oracle Simphony KDS reports', url: 'https://docs.oracle.com/en/industries/food-beverage/simphony/19.4/kdscu/c_kds_reports.htm', note: 'Validates speed-of-service reporting by business date, time period and order type from KDS-produced timing evidence.' },
    { label: 'Toast Kitchen operations reporting', url: 'https://central.toasttab.com/articles/Knowledge/Kitchen-Reports-Overview', note: 'Validates fulfillment timing from receipt through completion and handoff, while explicitly depending on KDS records.' },
    { label: 'Lightspeed KDS statistics', url: 'https://k-series-support.lightspeedhq.com/hc/en-us/articles/4403156122651-KDS-Statistics', note: 'Validates product-level preparation counts and timing by selected period when a KDS provides the source events.' },
  ],
  records: [
  {
    id: 'kitchen.performance.operational-evidence',
    label: 'Operational performance evidence',
    kind: 'reference',
    status: 'partial',
    owner: 'Orders, Mise, Stations, Waste, Inventory and Sales',
    authority: 'Performance reads bounded events from their owners and never stores a copied operational history.',
    facts: [
      'Order timestamps and transitions',
      'Mise completion evidence',
      'Station routing',
      'Waste and Inventory observations',
      'KitchenSales'
    ],
    readBy: [
      'kitchen.performance.review-service-timing',
      'kitchen.performance.review-stations',
      'kitchen.performance.review-production',
      'kitchen.performance.compare-periods'
    ],
    writtenBy: []
  },
  {
    id: 'kitchen.performance.review',
    label: 'Performance review',
    kind: 'projection',
    status: 'requested',
    owner: 'Performance',
    authority: 'A review is a source-linked comparison with coverage and uncertainty, not a stored causal or personnel judgement.',
    facts: [ 'scope and period', 'measure definitions', 'source links and coverage', 'observations, uncertainty and exclusions' ],
    readBy: [],
    writtenBy: []
  }
],
  recordQuestions: ['Which Kitchen, owner-local service or period and measure definition apply?', 'Which explicit lifecycle event starts and ends each duration?', 'Does every included Order or work item contain both authoritative timestamps?', 'Which Station mapping applied when the work occurred?', 'Which volume, item count, order type, channel or complexity context accompanies timing?', 'Which Mise tasks were planned, started, completed, blocked or late under the same definitions?', 'Which readiness requirement version and service context produced each check result?', 'Which missing, anomalous or excluded records affect coverage?', 'Are percentiles, averages and on-time measures calculated over the same eligible population?', 'Which observation is a supported measure rather than a claim about people, quality, cause or profit?'],
  toolHypotheses: [
    { id: 'kitchen.performance.review-service-timing', label: 'Service Timing Report', layer: 'ai-assisted', purpose: 'Summarise complete Order lifecycle durations, volumes and coverage for an explicit Kitchen-local period.', inputs: ['completed Order transition histories', 'period', 'named start and end events'], outputs: ['count, duration distribution, percentiles, on-time measures and missing coverage'], evidence: ['authoritative timestamped Order transitions only'], authority: 'The Tool cannot derive observed timing from estimates, current status or one update stamp.', approval: 'Read-only reporting needs no mutation approval.', status: 'requested' },
    { id: 'kitchen.performance.review-stations', label: 'Station Performance Report', layer: 'compound', purpose: 'Compare eligible work volume and timing by historically applicable Station routing.', inputs: ['Station work projections', 'routing history', 'complete lifecycle timestamps', 'period'], outputs: ['Station-grouped measures, workload context and unresolved routing'], evidence: ['Order and Station-owned operational records'], authority: 'The Tool does not infer individual performance, staffing cause or historical Station from current configuration.', approval: 'Read-only reporting needs no mutation approval.', status: 'requested' },
    { id: 'kitchen.performance.review-production', label: 'Prep Completion Report', layer: 'ai-assisted', purpose: 'Compare planned Mise tasks with recorded completion, lateness and blocked outcomes.', inputs: ['Mise tasks', 'service period', 'explicit due, start, status and completion evidence'], outputs: ['task-state counts, supported timing and visible missing evidence'], evidence: ['actor-stamped Mise records'], authority: 'The Tool reports work records—not labour productivity, paid time, quality or individual ranking.', approval: 'Read-only reporting needs no mutation approval.', status: 'requested' },
    { id: 'kitchen.performance.compare-periods', label: 'Kitchen Performance Comparison', layer: 'compound', purpose: 'Compare the same supported operational measures across two equivalent periods.', inputs: ['two complete report projections', 'matching definitions and eligibility rules'], outputs: ['measure differences, workload context, coverage and investigation prompts'], evidence: ['same owning operational sources for both periods'], authority: 'The Tool does not invent causes, benchmarks, staffing recommendations, customer impact or profit.', approval: 'Read-only comparison needs no mutation approval.', status: 'requested' },
  ] satisfies KitchenPerformanceToolHypothesis[],
  aiContract: {
    performanceAI: ['Own measure definitions, eligibility, coverage, comparison and the Performance Tool catalogue.', 'Consume timestamped Orders, Station work, Mise tasks and readiness evidence from their owning capabilities.', 'Keep operational record, report projection, benchmark, comparison and deduction distinct.', 'Never invent a timestamp, route, completion, productivity measure, cause, quality result, staffing need or profit impact.', 'Expose every current Tool as requested until complete producers, readers and registration exist.'],
    kitchenAI: ['Recognise Kitchen Performance intent and delegate it to PerformanceAI.', 'Ask which operational outcome and measure definition the operator means.', 'Pass selected Kitchen, period and authorized context without copying report semantics.', 'Route operational action proposals to the owning capability and preserve approvals.'],
    activation: ['Orders retain complete timestamped lifecycle transitions.', 'Station work preserves historical routing and completion evidence.', 'Mise and readiness records have complete service-scoped timestamps and semantics.', 'Bounded projections define eligibility, timezone, coverage, limits and reconciliation.', 'Tool registration, authorization, UI and end-to-end verification are complete.'],
  },
  conclusion: 'Performance is a read-only comparison layer over proven operational events. Current source does not yet support authoritative ticket-time, Station, readiness or production reports; every proposed measure remains unavailable until its complete producer and definition exist.',
} as const
