import { researchReconciliation } from './research-reconciliation'
import { defineAppSearchDemand } from 'fireux-core/config/app/search-demand'

export const searchDemand = defineAppSearchDemand({
  reconciliation: researchReconciliation,
  domain: 'Residential property-portfolio operations',
  operator:
    'Independent landlords and small residential portfolio managers in Switzerland.',
  description:
    'App-owned industry research using the shared FireUX contract. Ranked areas are proposals and do not change runtime navigation or domain ownership.',
  research_scope: {
    audience:
      'Independent landlords and small residential portfolio managers in Switzerland.',
    geography:
      'Switzerland first; international product guidance is identified separately.',
    languages: ['German', 'English'],
    reviewed_at: '2026-10-05',
    limitations:
      'Desk research and bounded source inspection. No operator interviews, search-volume measurements or paid-demand validation. Ranking is product judgement; legal and safety responsibilities do not become optional because of rank.',
  },
  observations: [
    {
      id: 'manager-work',
      source: 'operational-guidance',
      query: 'Swiss property-manager responsibilities',
      source_url:
        'https://www.berufsberatung.ch/de/berufe/immobilienbewirtschafter-in-bp',
      finding:
        'The professional role includes property condition, repairs, handovers, leasing, owner/tenant coordination and financial administration.',
      limitations:
        'Occupational scope is not buyer research. Residential, commercial and condominium portfolios differ; begin with small residential portfolios.',
      geography: 'Switzerland',
      language: 'German',
      observed_at: '2026-10-05',
    },
    {
      id: 'resident-requests',
      source: 'operator-case-study',
      query: 'A Swiss operator provides request tracking',
      source_url:
        'https://wincasa.ch/de-ch/mieter-innen/wincasa-home-mieterportal',
      finding:
        'Wincasa Home lets residents submit requests outside office hours and follow their status.',
      limitations:
        'One large operator describes its own process. This is not an independent effectiveness study or proof that smaller landlords will adopt Granite.',
      geography: 'Switzerland',
      language: 'German',
      observed_at: '2026-10-05',
    },
    {
      id: 'portfolio-workflows',
      source: 'product-documentation',
      query: 'Leasing, maintenance, accounting and communication workflows',
      source_url: 'https://www.appfolio.com/property-management-software',
      finding:
        'The product describes leasing, maintenance requests/work orders, accounting and resident/owner communication as distinct connected workflows.',
      limitations:
        'US vendor material demonstrates product supply, not Swiss adoption, compliance or return on investment.',
      geography: 'United States product documentation',
      language: 'English',
      observed_at: '2026-10-05',
    },
    {
      id: 'tenancy-jurisdiction',
      source: 'regulatory-guidance',
      query: 'Swiss rental-law authority and advice boundaries',
      source_url:
        'https://www.bwo.admin.ch/de/virtueller-schalter-rechtsdienst',
      finding:
        'The Federal Office for Housing identifies its rental-law remit and routes legal questions to the appropriate advice channels.',
      limitations:
        'This authority entrypoint is not an exhaustive legal checklist. Lease changes, deadlines and deposits require specific current jurisdictional review.',
      geography: 'Switzerland',
      language: 'German',
      observed_at: '2026-10-05',
    },
    {
      id: 'vacancy-context',
      source: 'official-statistics',
      query: 'Swiss housing vacancy context in 2026',
      source_url: 'https://www.bazg.admin.ch/de/newnsb/kgvqAd91MYZr',
      finding:
        'The FSO release reports 45,493 vacant dwellings and a national vacancy rate of 0.93% on 1 June 2026, with regional differences.',
      limitations:
        'A housing-market statistic does not establish property-management software demand or an individual portfolio occupancy rate.',
      geography: 'Switzerland',
      language: 'German',
      observed_at: '2026-10-05',
      period: '1 June 2026',
      published_at: '2026-09-10',
    },
  ],
  summary: {
    conclusion:
      'Start with a property issue carried through assignment, evidence and closure, alongside an understandable property register.',
    findings: [
      'Start with a property issue carried through assignment, evidence and closure, alongside an understandable property register.',
      'Existing Portfolio Tasks, Documents and Compliance are useful foundations; their presence does not prove a complete landlord service.',
      'Long-term occupancy, leases and notices are distinct from hospitality Reservations. FireUX tenant App roles are also distinct from rental residents.',
      'Financial reporting needs rent, payment and expense producers; the current Portfolio Finance page is unconnected.',
      'The national vacancy statistic is context, not demand for Granite. Commercial portfolios and condominium administration need separate validation.',
    ],
    next_step:
      'Prove one property-linked issue from report to assignment, document evidence and closure. Compare actual domain requirements before reusing its workflow for BuenoHost guest requests or turnover.',
  },
  analysis: {
    summary:
      'Operator jobs traced to direct evidence, with explicit segment and validation limits.',
    clusters: [
      {
        id: 'properties',
        title: 'Property and unit register',
        operator_job:
          'Know the properties, units and relationships being managed.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['manager-work', 'vacancy-context'],
        confidence: 'strong',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'maintenance',
        title: 'Issues and maintenance',
        operator_job:
          'Carry a reported property problem through responsibility, work and closure.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: [
          'manager-work',
          'resident-requests',
          'portfolio-workflows',
        ],
        confidence: 'strong',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'occupancy',
        title: 'Occupancy and tenancy',
        operator_job:
          'Know who occupies each unit under which agreement and dates.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['manager-work', 'tenancy-jurisdiction'],
        confidence: 'strong',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'documents',
        title: 'Documents and evidence',
        operator_job:
          'Find the correct agreements, condition records and supporting files.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['manager-work', 'portfolio-workflows'],
        confidence: 'strong',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'obligations',
        title: 'Obligations and inspections',
        operator_job:
          'Track applicable obligations, evidence and follow-up work.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['tenancy-jurisdiction', 'manager-work'],
        confidence: 'moderate',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'finance',
        title: 'Rent, costs and owner reporting',
        operator_job:
          'Distinguish rent due, receipts, expenses and owner results.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['manager-work', 'portfolio-workflows'],
        confidence: 'strong',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'communication',
        title: 'Resident and owner communication',
        operator_job:
          'Keep parties informed about relevant work and decisions.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['resident-requests', 'portfolio-workflows'],
        confidence: 'moderate',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
    ],
    next_step:
      'Review these jobs with operators before treating the proposed grouping as a runtime capability decision.',
  },
  tools: {
    summary:
      'Bounded tool hypotheses; existing code readiness is assessed separately.',
    tools: [
      {
        id: 'properties-tool',
        title: 'Review or connect property',
        source_cluster_ids: ['properties'],
        operator_job:
          'Know the properties, units and relationships being managed.',
        outcome:
          'A clear portfolio-to-property relationship with correct authority.',
        status: 'test-now',
      },
      {
        id: 'maintenance-tool',
        title: 'Assign and close property issue',
        source_cluster_ids: ['maintenance'],
        operator_job:
          'Carry a reported property problem through responsibility, work and closure.',
        outcome:
          'A property-linked issue with assignment, evidence and verified closure.',
        status: 'test-now',
      },
      {
        id: 'occupancy-tool',
        title: 'Record tenancy and handover',
        source_cluster_ids: ['occupancy'],
        operator_job:
          'Know who occupies each unit under which agreement and dates.',
        outcome: 'An explicit unit occupancy and agreement history.',
        status: 'research-next',
      },
      {
        id: 'documents-tool',
        title: 'Upload and link document',
        source_cluster_ids: ['documents'],
        operator_job:
          'Find the correct agreements, condition records and supporting files.',
        outcome: 'A document linked to its real subject and authorized owner.',
        status: 'research-next',
      },
      {
        id: 'obligations-tool',
        title: 'Record obligation review',
        source_cluster_ids: ['obligations'],
        operator_job:
          'Track applicable obligations, evidence and follow-up work.',
        outcome:
          'A scoped obligation with evidence, responsible person and follow-up.',
        status: 'research-next',
      },
      {
        id: 'finance-tool',
        title: 'Reconcile rent and expense evidence',
        source_cluster_ids: ['finance'],
        operator_job:
          'Distinguish rent due, receipts, expenses and owner results.',
        outcome:
          'Financial measures traceable to their transactions and accounting source.',
        status: 'research-next',
      },
      {
        id: 'communication-tool',
        title: 'Share issue progress',
        source_cluster_ids: ['communication'],
        operator_job:
          'Keep parties informed about relevant work and decisions.',
        outcome:
          'An authorized update with recipient scope and delivery evidence.',
        status: 'research-next',
      },
    ],
    next_step:
      'Prove one property-linked issue from report to assignment, document evidence and closure. Compare actual domain requirements before reusing its workflow for BuenoHost guest requests or turnover.',
  },
  capabilities: {
    summary:
      'Ranked candidate areas. Need evidence, product choice and implementation readiness are independent.',
    capabilities: [
      {
        id: 'properties',
        definition: {
          purpose:
            'Maintain an understandable register of the properties and units a Portfolio manages.',
          manages: [
            'Portfolio-to-Property relationships',
            'Portfolio-specific unit and management context',
          ],
          uses: ['Canonical Property identity'],
          tools: [
            'Connect a property',
            'Review the register',
            'Update portfolio management context',
          ],
          boundaries: [
            'A Portfolio reference does not duplicate Property ownership.',
            'Leases, maintenance and financial records have their own responsibilities.',
          ],
          service_example:
            'Property onboarding can connect a verified Property to the correct Portfolio.',
        },
        title: 'Property and unit register',
        decision: 'proposed',
        priority: {
          rank: 1,
          rationale:
            'Establish the property and unit context first; repairs, occupancy and records need a clear owner, and the current Portfolio Properties view is still a limited shell.',
        },
        source_cluster_ids: ['properties'],
        source_tool_ids: ['properties-tool'],
        rationale:
          'Know the properties, units and relationships being managed.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'The Swiss professional profile identifies management of properties, condition and handovers. Vacancy statistics are market context rather than evidence of demand for this tool.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['manager-work', 'vacancy-context'],
          },
          implementation: {
            status: 'partial',
            assessed_at: '2026-10-05',
            scope:
              'Property identity and a Portfolio property reader exist, but the Properties surface remains a limited shell rather than a complete management journey. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-properties/src/runtime/portfolio/components/Workspace/Properties/Read.vue',
              'packages/extensions/fireux-properties/src/runtime/property/models/property.model.ts',
            ],
          },
        },
      },
      {
        id: 'maintenance',
        definition: {
          purpose:
            'Track a property issue through responsibility, work and evidenced closure.',
          manages: [
            'Portfolio task and issue records',
            'Status, due times and proposed assignment or closure evidence',
          ],
          uses: ['Property links', 'Documents and relevant obligations'],
          tools: [
            'Record an issue',
            'Update its status',
            'Assign responsibility',
            'Record completion evidence',
          ],
          boundaries: [
            'Existing task status does not prove assignment or evidenced closure.',
            'Documents remain with their owning records; costs need financial producers.',
          ],
          service_example:
            'Issue resolution can coordinate a task, supporting documents and a recorded closure decision.',
        },
        title: 'Issues and maintenance',
        decision: 'proposed',
        priority: {
          rank: 2,
          rationale:
            'Use maintenance as the first complete service proof: the operator job is evidenced and existing Tasks and Documents provide concrete foundations.',
        },
        source_cluster_ids: ['maintenance'],
        source_tool_ids: ['maintenance-tool'],
        rationale:
          'Carry a reported property problem through responsibility, work and closure.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'The Swiss professional profile identifies repairs; Wincasa exposes resident request tracking; AppFolio offers work orders. Together they support the job, not Granite adoption.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: [
              'manager-work',
              'resident-requests',
              'portfolio-workflows',
            ],
          },
          implementation: {
            status: 'partial',
            assessed_at: '2026-10-05',
            scope:
              'Portfolio Tasks has a live UI and trusted commands. A full property-issue, contractor, cost and closure workflow is not established. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-tasks/src/runtime/pages/workspace/portfolio/tasks.vue',
              'packages/extensions/fireux-tasks/src/runtime/portfolio/server/tasks/commands.ts',
            ],
          },
        },
      },
      {
        id: 'occupancy',
        definition: {
          purpose:
            'Understand who occupies a unit and the lifecycle of a long-term tenancy.',
          manages: [
            'Proposed tenancy relationships and occupancy periods',
            'Lease, handover and vacancy evidence',
          ],
          uses: [
            'Property and unit register',
            'Resident identity and applicable jurisdiction',
          ],
          tools: ['Record a tenancy', 'Review occupancy', 'Prepare a handover'],
          boundaries: [
            'Rental residents are not FireUX tenant Apps.',
            'Hospitality Reservations are not a long-term tenancy model.',
          ],
          service_example:
            'A tenancy handover can coordinate occupancy, documents, condition evidence and communication.',
        },
        title: 'Occupancy and tenancy',
        decision: 'proposed',
        priority: {
          rank: 3,
          rationale:
            'Validate occupancy next because long-term agreements and resident relationships affect access and obligations; hospitality Reservations cannot supply that model.',
        },
        source_cluster_ids: ['occupancy'],
        source_tool_ids: ['occupancy-tool'],
        rationale:
          'Know who occupies each unit under which agreement and dates.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'The professional profile identifies leasing and contracts, while the housing authority clarifies legal remit. The exact small-landlord tenancy lifecycle still needs interviews.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['manager-work', 'tenancy-jurisdiction'],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'No long-term tenancy lifecycle was established in the inspected Portfolio capability catalogue. Hospitality Reservation is not a substitute. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-properties/src/runtime/portfolio/models/capabilities.ts',
              'packages/extensions/fireux-reservations/src/runtime/property/models/reservation.model.ts',
            ],
          },
        },
      },
      {
        id: 'documents',
        definition: {
          purpose:
            'Organise documents and evidence needed to manage the Portfolio.',
          manages: ['Portfolio document records and supporting metadata'],
          uses: ['Property, task and obligation references'],
          tools: [
            'Add a document',
            'Find supporting evidence',
            'Review document relevance',
          ],
          boundaries: [
            'Document storage does not own the underlying obligation or task.',
            'A file’s presence does not prove review, validity or legal compliance.',
          ],
          service_example:
            'Issue resolution can attach supporting documents without moving task ownership.',
        },
        title: 'Documents and evidence',
        decision: 'proposed',
        priority: {
          rank: 4,
          rationale:
            'Prove document evidence alongside maintenance before expanding document features; existing upload and link commands provide a bounded starting point.',
        },
        source_cluster_ids: ['documents'],
        source_tool_ids: ['documents-tool'],
        rationale:
          'Find the correct agreements, condition records and supporting files.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'Leasing, condition records and the vendor workflow support document evidence as part of property administration. Retention and disclosure requirements remain unvalidated.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['manager-work', 'portfolio-workflows'],
          },
          implementation: {
            status: 'connected',
            assessed_at: '2026-10-05',
            scope:
              'Portfolio document page and upload/link commands exist. They do not establish e-signature, retention policy or tenant disclosure. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-documents/src/runtime/pages/workspace/portfolio/documents.vue',
              'packages/extensions/fireux-documents/src/runtime/portfolio/server/documents/upload.ts',
              'packages/extensions/fireux-documents/src/runtime/portfolio/server/documents/link.ts',
            ],
          },
        },
      },
      {
        id: 'obligations',
        definition: {
          purpose:
            'Keep recurring obligations, inspections and their evidence visible.',
          manages: [
            'Portfolio obligation records and due context',
            'Inspection and compliance review evidence',
          ],
          uses: ['Property register', 'Documents and related tasks'],
          tools: [
            'Record an obligation',
            'Review a due inspection',
            'Attach evidence',
            'Create a related task',
          ],
          boundaries: [
            'A due-date checklist is not a legal-compliance certification.',
            'Current jurisdictional requirements require specific review.',
          ],
          service_example:
            'Inspection follow-up can coordinate an obligation, evidence and a corrective task.',
        },
        title: 'Obligations and inspections',
        decision: 'proposed',
        priority: {
          rank: 5,
          rationale:
            'Validate jurisdiction-specific obligations and their evidence after the basic record/workflow is clear. Applicable safety and legal duties apply throughout.',
        },
        source_cluster_ids: ['obligations'],
        source_tool_ids: ['obligations-tool'],
        rationale: 'Track applicable obligations, evidence and follow-up work.',
        assessment: {
          market: {
            confidence: 'moderate',
            rationale:
              'The professional profile and housing authority support regulated responsibilities; neither supplies a complete property-specific obligations catalogue.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['tenancy-jurisdiction', 'manager-work'],
          },
          implementation: {
            status: 'partial',
            assessed_at: '2026-10-05',
            scope:
              'Portfolio Compliance presentation and records exist; it is not an exhaustive Swiss legal catalogue or compliance certification. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-compliance/src/runtime/pages/workspace/portfolio/compliance.vue',
              'packages/extensions/fireux-compliance/src/runtime/portfolio/models/compliance-record.model.ts',
            ],
          },
        },
      },
      {
        id: 'finance',
        definition: {
          purpose:
            'Explain supported rent, expense and owner-reporting figures from authoritative records.',
          manages: ['Portfolio financial review context and derived reports'],
          uses: [
            'Rent, payment and expense producers',
            'Property and tenancy references',
          ],
          tools: [
            'Review a period',
            'Inspect supporting transactions',
            'Prepare an owner summary',
          ],
          boundaries: [
            'No financial total should be inferred from absent transaction producers.',
            'Accounting, payment execution and tax advice are separate scope.',
          ],
          service_example:
            'An owner-reporting journey can reconcile supported records before sharing an approved summary.',
        },
        title: 'Rent, costs and owner reporting',
        decision: 'proposed',
        priority: {
          rank: 6,
          rationale:
            'Validate required financial producers before implementing reports; the current Finance page is parked, so rent and expense data cannot be assumed.',
        },
        source_cluster_ids: ['finance'],
        source_tool_ids: ['finance-tool'],
        rationale:
          'Distinguish rent due, receipts, expenses and owner results.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'The professional profile includes financial administration and AppFolio supplies accounting workflows. Swiss small-landlord reporting requirements and buying intent remain untested.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['manager-work', 'portfolio-workflows'],
          },
          implementation: {
            status: 'not-connected',
            assessed_at: '2026-10-05',
            scope:
              'Portfolio Finance explicitly says its views are not wired. No rent ledger or accounting claim is supported. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-properties/src/runtime/pages/workspace/portfolio/finance.vue',
            ],
          },
        },
      },
      {
        id: 'communication',
        definition: {
          purpose:
            'Keep resident and owner communication tied to a specific property matter.',
          manages: ['Proposed conversation context and delivery evidence'],
          uses: [
            'Resident or owner relationships',
            'Property, task and tenancy records',
          ],
          tools: [
            'Prepare a message',
            'Send through an authorized channel',
            'Track a response',
          ],
          boundaries: [
            'A drafted message is not a delivered message.',
            'Communication does not update a lease or task unless an explicit command does so.',
          ],
          service_example:
            'Issue resolution can coordinate a property task with an authorized resident update.',
        },
        title: 'Resident and owner communication',
        decision: 'proposed',
        priority: {
          rank: 7,
          rationale:
            'Test communication through the maintenance proof first; establish audience, disclosure and delivery needs before proposing a general messaging system.',
        },
        source_cluster_ids: ['communication'],
        source_tool_ids: ['communication-tool'],
        rationale: 'Keep parties informed about relevant work and decisions.',
        assessment: {
          market: {
            confidence: 'moderate',
            rationale:
              'Wincasa provides resident request status and AppFolio describes resident/owner communication. Granite audience boundaries and channel choices remain product hypotheses.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: [
              'resident-requests',
              'portfolio-workflows',
            ],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'Team exists, but a roster is not a resident/owner messaging or disclosure workflow. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-properties/src/runtime/portfolio/components/Workspace/Team/Index.vue',
            ],
          },
        },
      },
    ],
    next_step:
      'Prove one property-linked issue from report to assignment, document evidence and closure. Compare actual domain requirements before reusing its workflow for BuenoHost guest requests or turnover.',
  },
})
