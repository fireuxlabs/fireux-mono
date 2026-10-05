import { researchReconciliation } from './research-reconciliation'
import { defineAppSearchDemand } from 'fireux-core/config/app/search-demand'

export const searchDemand = defineAppSearchDemand({
  reconciliation: researchReconciliation,
  domain: 'Guest and stay operations',
  operator:
    'Independent holiday-rental hosts with a small number of Swiss properties.',
  description:
    'App-owned industry research using the shared FireUX contract. Ranked areas are proposals and do not change runtime navigation or domain ownership.',
  research_scope: {
    audience:
      'Independent holiday-rental hosts with a small number of Swiss properties.',
    geography:
      'Switzerland first; international product guidance is identified separately.',
    languages: ['German', 'English'],
    reviewed_at: '2026-10-05',
    limitations:
      'Desk research and bounded source inspection. No operator interviews, search-volume measurements or paid-demand validation. Ranking is product judgement; legal and safety responsibilities do not become optional because of rank.',
  },
  observations: [
    {
      id: 'accommodation-context',
      source: 'official-statistics',
      query: 'Swiss holiday accommodation market context',
      source_url:
        'https://opendata.swiss/en/dataset/ankunfte-und-logiernachte-in-ferienwohnungen-und-kollektivunterkunften-nach-grossregion1',
      finding:
        'The FSO dataset separates annual arrivals and nights by accommodation type, region and guest origin, with coverage through 2025.',
      limitations:
        'Dataset metadata reviewed; no market-size calculation or software demand inference. Holiday homes and collective accommodation are distinct segments.',
      geography: 'Switzerland',
      language: 'English',
      observed_at: '2026-10-05',
      period: '2017–2025',
      published_at: '2026-05-29',
    },
    {
      id: 'arrival-guide',
      source: 'operational-guidance',
      query: 'Guest arrival and departure information',
      source_url:
        'https://www.airbnb.com/resources/hosting-homes/a/make-check-in-and-checkout-easy-662',
      finding:
        'The guidance recommends clear directions, access instructions, house information and tested check-in steps.',
      limitations:
        'Platform guidance establishes a workflow expectation, not demand for another guest-guide product. Sensitive entry details need appropriate guest access.',
      geography: 'International platform guidance',
      language: 'English',
      observed_at: '2026-10-05',
    },
    {
      id: 'channel-sync',
      source: 'product-documentation',
      query: 'External calendar freshness and booking conflicts',
      source_url: 'https://www.airbnb.com/help/article/99',
      finding:
        'Airbnb documents automatic imported-calendar refresh every three hours and separate refresh times for multiple calendars.',
      limitations:
        'This is Airbnb calendar behaviour, not a BuenoHost integration. Calendar imports cannot be assumed to provide atomic cross-channel booking protection.',
      geography: 'International platform documentation',
      language: 'English',
      observed_at: '2026-10-05',
    },
    {
      id: 'turnover',
      source: 'operational-guidance',
      query: 'Prepare accommodation between stays',
      source_url:
        'https://www.airbnb.com/resources/hosting-homes/a/prepare-your-space-656',
      finding:
        'The guidance covers repeatable cleaning, fresh linens, towels and stocking essentials before check-in.',
      limitations:
        'Platform guidance, not a staffing study or proven software ROI. Turnover effort varies by property and operating model.',
      geography: 'International platform guidance',
      language: 'English',
      observed_at: '2026-10-05',
    },
    {
      id: 'local-guest-process',
      source: 'operational-guidance',
      query: 'Interlaken guest registration and guest-card process',
      source_url:
        'https://www.interlaken.swiss/interlaken-digital/interlaken-pass-fuer-berherbergende',
      finding:
        'Local provider information connects booking, guest registration, guest cards and tourist-tax administration.',
      limitations:
        'Interlaken-specific process; verify the exact municipality and current requirements. No automated submission or approved integration is implied.',
      geography: 'Switzerland',
      language: 'German',
      observed_at: '2026-10-05',
    },
  ],
  summary: {
    conclusion:
      'Start with a dependable guest-arrival and stay-guide journey linked to the correct reservation.',
    findings: [
      'Start with a dependable guest-arrival and stay-guide journey linked to the correct reservation.',
      'Reservations need authoritative local allocation and explicit channel provenance. External calendar refresh is not atomic multi-channel inventory.',
      'Arrival, turnover and guest support are distinct jobs. Local guest-card and registration processes require municipality-specific handling.',
      'Reservation totals are booked amounts, not proof of receipts, costs or profit.',
      'Property is shared with Granite, while short stays, guest access and turnover remain hospitality-specific.',
    ],
    next_step:
      'Prove a host can publish appropriate arrival information for a specific stay and a guest can use it. Then validate turnover and channel-integration needs; preserve Reservation authority.',
  },
  analysis: {
    summary:
      'Operator jobs traced to direct evidence, with explicit segment and validation limits.',
    clusters: [
      {
        id: 'guest-guide',
        title: 'Guest arrival and stay guide',
        operator_job: 'Help each guest find, enter and use the accommodation.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['arrival-guide'],
        confidence: 'strong',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'reservations',
        title: 'Reservations and availability',
        operator_job:
          'Keep one reliable stay record and avoid conflicting allocations.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['channel-sync', 'accommodation-context'],
        confidence: 'strong',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'turnover',
        title: 'Turnover and readiness',
        operator_job: 'Prepare the accommodation before the next arrival.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['turnover'],
        confidence: 'strong',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'guest-requests',
        title: 'Guest requests and support',
        operator_job: 'Resolve guest questions and problems during a stay.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['arrival-guide'],
        confidence: 'moderate',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'offer',
        title: 'Accommodation offer and pricing',
        operator_job:
          'Describe the accommodation and maintain its bookable terms.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['accommodation-context', 'channel-sync'],
        confidence: 'moderate',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'local-obligations',
        title: 'Local guest obligations',
        operator_job:
          'Complete the relevant local guest-registration and tourist-tax process.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['local-guest-process'],
        confidence: 'strong',
        interpretation:
          'A candidate responsibility inferred from the cited operator work and product context.',
        research_gap:
          'Validate frequency, current method, integration needs, adoption effort and willingness to pay with the initial audience.',
      },
      {
        id: 'financial-evidence',
        title: 'Stay financial evidence',
        operator_job:
          'Understand booked amounts, receipts, fees and costs without conflating them.',
        intents: ['perform'],
        evidence_queries: [],
        source_observation_ids: ['accommodation-context'],
        confidence: 'early',
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
        id: 'guest-guide-tool',
        title: 'Publish arrival guide',
        source_cluster_ids: ['guest-guide'],
        operator_job: 'Help each guest find, enter and use the accommodation.',
        outcome: 'A reviewed guide with appropriate guest access.',
        status: 'test-now',
      },
      {
        id: 'reservations-tool',
        title: 'Record or amend reservation',
        source_cluster_ids: ['reservations'],
        operator_job:
          'Keep one reliable stay record and avoid conflicting allocations.',
        outcome: 'An authoritative stay and consistent local night allocation.',
        status: 'test-now',
      },
      {
        id: 'turnover-tool',
        title: 'Complete turnover check',
        source_cluster_ids: ['turnover'],
        operator_job: 'Prepare the accommodation before the next arrival.',
        outcome:
          'A dated readiness result with responsible person and evidence.',
        status: 'research-next',
      },
      {
        id: 'guest-requests-tool',
        title: 'Record and resolve guest request',
        source_cluster_ids: ['guest-requests'],
        operator_job: 'Resolve guest questions and problems during a stay.',
        outcome: 'A scoped request with ownership, status and closure.',
        status: 'research-next',
      },
      {
        id: 'offer-tool',
        title: 'Review accommodation offer',
        source_cluster_ids: ['offer'],
        operator_job:
          'Describe the accommodation and maintain its bookable terms.',
        outcome:
          'Accurate public description, capacity and supported price terms.',
        status: 'research-next',
      },
      {
        id: 'local-obligations-tool',
        title: 'Prepare local guest-registration handoff',
        source_cluster_ids: ['local-obligations'],
        operator_job:
          'Complete the relevant local guest-registration and tourist-tax process.',
        outcome:
          'Required information checked and handed to the responsible local system.',
        status: 'research-next',
      },
      {
        id: 'financial-evidence-tool',
        title: 'Review stay financial evidence',
        source_cluster_ids: ['financial-evidence'],
        operator_job:
          'Understand booked amounts, receipts, fees and costs without conflating them.',
        outcome:
          'A report separating booked amounts, actual receipts and supported costs.',
        status: 'research-next',
      },
    ],
    next_step:
      'Prove a host can publish appropriate arrival information for a specific stay and a guest can use it. Then validate turnover and channel-integration needs; preserve Reservation authority.',
  },
  capabilities: {
    summary:
      'Ranked candidate areas. Need evidence, product choice and implementation readiness are independent.',
    capabilities: [
      {
        id: 'guest-guide',
        definition: {
          purpose:
            'Prepare the information an eligible guest needs to arrive and use the property.',
          manages: [
            'Guest-facing directions, stay instructions and guide publication context',
          ],
          uses: [
            'Property identity and reviewed facilities',
            'Reservation eligibility and local information',
          ],
          tools: [
            'Prepare arrival instructions',
            'Review sensitive access details',
            'Publish a guide for eligible guests',
          ],
          boundaries: [
            'Private host notes are not a guest guide.',
            'A published guide does not grant arbitrary access to entry credentials.',
          ],
          service_example:
            'Arrival preparation can combine a valid reservation with an approved guest guide and delivery.',
        },
        title: 'Guest arrival and stay guide',
        decision: 'proposed',
        priority: {
          rank: 1,
          rationale:
            'Begin with the arrival promise already visible in BuenoHost: it is a bounded guest outcome that can be proved using existing Property manual fields.',
        },
        source_cluster_ids: ['guest-guide'],
        source_tool_ids: ['guest-guide-tool'],
        rationale: 'Help each guest find, enter and use the accommodation.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'Airbnb identifies directions, entry method and house guidance as explicit arrival work. This supports the job, while BuenoHost adoption remains untested.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['arrival-guide'],
          },
          implementation: {
            status: 'partial',
            assessed_at: '2026-10-05',
            scope:
              'Property manual fields and tenant presentation exist. A complete reusable publication/access journey has not been proved. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-properties/src/runtime/property/models/property.model.ts',
              'projects/buenohost/buenohost-app/app/components/Landing/landing-content.ts',
            ],
          },
        },
      },
      {
        id: 'reservations',
        definition: {
          purpose:
            'Record stays and protect availability within the supported booking authority.',
          manages: [
            'Reservation dates, guest context and lifecycle',
            'Property night-lock and availability evidence',
          ],
          uses: [
            'Property identity and offer terms',
            'External channel information where supported',
          ],
          tools: [
            'Create or amend a reservation',
            'Review availability',
            'Cancel a reservation',
          ],
          boundaries: [
            'Local night protection is not atomic cross-channel protection.',
            'Payment, guest communication and turnover have separate owners.',
          ],
          service_example:
            'Booking intake can coordinate availability validation, a reservation and confirmation delivery.',
        },
        title: 'Reservations and availability',
        decision: 'proposed',
        priority: {
          rank: 2,
          rationale:
            'Validate the Reservation and availability foundation next because it identifies the stay that arrival information and subsequent work must belong to.',
        },
        source_cluster_ids: ['reservations'],
        source_tool_ids: ['reservations-tool'],
        rationale:
          'Keep one reliable stay record and avoid conflicting allocations.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'Airbnb documents delayed calendar imports, supporting the need to distinguish local allocation from channel freshness; the Swiss dataset only supplies accommodation context.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['channel-sync', 'accommodation-context'],
          },
          implementation: {
            status: 'connected',
            assessed_at: '2026-10-05',
            scope:
              'Reservation UI and trusted commands with local night allocation exist. Live acceptance and channel integrations remain separate. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-reservations/src/runtime/property/server/reservations/command.ts',
              'packages/extensions/fireux-reservations/src/runtime/property/components/Workspace/Reservations/Index.vue',
            ],
          },
        },
      },
      {
        id: 'turnover',
        definition: {
          purpose: 'Track whether the property is ready between stays.',
          manages: ['Proposed turnover tasks, checks and readiness evidence'],
          uses: [
            'Reservation arrival and departure times',
            'Property condition and maintenance context',
          ],
          tools: [
            'Plan turnover',
            'Assign a check',
            'Record readiness',
            'Report a problem',
          ],
          boundaries: [
            'A task marked done is not evidence of every readiness check.',
            'Reservation and maintenance lifecycles remain separate.',
          ],
          service_example:
            'Stay preparation can combine departure timing, turnover work and arrival readiness.',
        },
        title: 'Turnover and readiness',
        decision: 'proposed',
        priority: {
          rank: 3,
          rationale:
            'Test readiness once a stay is known: cleaning and replenishment directly affect the next arrival and can reveal whether task reuse is appropriate.',
        },
        source_cluster_ids: ['turnover'],
        source_tool_ids: ['turnover-tool'],
        rationale: 'Prepare the accommodation before the next arrival.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'Airbnb describes cleaning, fresh linens and replenishment before arrival. This supports readiness work, without proving demand for a separate BuenoHost tool.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['turnover'],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'No turnover implementation was established in the bounded Property/Reservation source inspection. This is not a repository-wide absence claim. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-properties/src/runtime/property/models/capabilities.ts',
            ],
          },
        },
      },
      {
        id: 'guest-requests',
        definition: {
          purpose:
            'Track a guest’s question or issue through response and resolution.',
          manages: ['Proposed guest request, response and resolution context'],
          uses: [
            'Reservation and Property references',
            'Available operational contacts',
          ],
          tools: ['Record a request', 'Assign a response', 'Record resolution'],
          boundaries: [
            'A request does not itself change booking dates or issue a refund.',
            'Only authorized tools can invoke those domain commands.',
          ],
          service_example:
            'Guest issue resolution can coordinate a response with a required repair or booking action.',
        },
        title: 'Guest requests and support',
        decision: 'proposed',
        priority: {
          rank: 4,
          rationale:
            'Validate request handling after arrival and readiness, so support is attached to a concrete guest and stay rather than a generic inbox.',
        },
        source_cluster_ids: ['guest-requests'],
        source_tool_ids: ['guest-requests-tool'],
        rationale: 'Resolve guest questions and problems during a stay.',
        assessment: {
          market: {
            confidence: 'moderate',
            rationale:
              'Arrival guidance shows a need for clear communication, but a dedicated request lifecycle is a product inference requiring host and guest interviews.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['arrival-guide'],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'No reusable guest-request workflow was established in the inspected Property/Reservation catalogue. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-properties/src/runtime/property/models/capabilities.ts',
            ],
          },
        },
      },
      {
        id: 'offer',
        definition: {
          purpose:
            'Describe the accommodation being offered and its supported pricing terms.',
          manages: ['Property offer presentation and pricing decisions'],
          uses: [
            'Canonical Property identity and facilities',
            'Availability and booking terms',
          ],
          tools: [
            'Review the accommodation offer',
            'Set supported price terms',
            'Review public presentation',
          ],
          boundaries: [
            'An offer does not reserve a night or establish payment.',
            'Channel-specific publication requires a proved integration.',
          ],
          service_example:
            'Booking setup can combine a reviewed offer with availability and reservation creation.',
        },
        title: 'Accommodation offer and pricing',
        decision: 'proposed',
        priority: {
          rank: 5,
          rationale:
            'Test bookable terms after the operational journey; the current tenant offer presentation is a starting point, while pricing and distribution need separate proof.',
        },
        source_cluster_ids: ['offer'],
        source_tool_ids: ['offer-tool'],
        rationale:
          'Describe the accommodation and maintain its bookable terms.',
        assessment: {
          market: {
            confidence: 'moderate',
            rationale:
              'The accommodation dataset establishes the sector and channel guidance establishes distribution constraints; the proposed pricing responsibility remains an inference.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['accommodation-context', 'channel-sync'],
          },
          implementation: {
            status: 'partial',
            assessed_at: '2026-10-05',
            scope:
              'Property identity/unit models and tenant offer presentation exist; reusable pricing and channel distribution are unproved. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-properties/src/runtime/property/models/property.model.ts',
              'packages/extensions/fireux-properties/src/runtime/property/models/unit.model.ts',
              'projects/buenohost/ausfinn-apartments/app/pages/stays.vue',
            ],
          },
        },
      },
      {
        id: 'local-obligations',
        definition: {
          purpose:
            'Prepare the information and evidence required by the property’s locality.',
          manages: [
            'Proposed registration and guest-pass handoff context',
            'Submission or completion evidence where supported',
          ],
          uses: [
            'Reservation guest information',
            'Current local authority requirements',
          ],
          tools: [
            'Review required information',
            'Prepare an authorized registration handoff',
            'Record completion evidence',
          ],
          boundaries: [
            'An internal record does not prove submission to an authority.',
            'Guest identity and sensitive data require their actual access policy.',
          ],
          service_example:
            'Arrival administration can coordinate eligible guest data with the locality’s supported submission process.',
        },
        title: 'Local guest obligations',
        decision: 'proposed',
        priority: {
          rank: 6,
          rationale:
            'Validate one municipality-specific process before attempting broad automation. Its actual obligations apply from the start, independent of this research order.',
        },
        source_cluster_ids: ['local-obligations'],
        source_tool_ids: ['local-obligations-tool'],
        rationale:
          'Complete the relevant local guest-registration and tourist-tax process.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'Interlaken documents a local registration, guest-card and tourist-tax process. Confidence applies to that local job, not to a universal Swiss workflow.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['local-guest-process'],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'No automated local registration or tourist-tax integration was established. Do not infer it from Reservation guest fields. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-reservations/src/runtime/property/models/reservation.model.ts',
            ],
          },
        },
      },
      {
        id: 'financial-evidence',
        definition: {
          purpose:
            'Explain the amounts and payment evidence associated with a stay.',
          manages: ['Stay financial review and reconciliation context'],
          uses: [
            'Reservation amounts',
            'Authoritative payment, refund and fee records',
          ],
          tools: [
            'Review stay amounts',
            'Inspect payment evidence',
            'Reconcile a discrepancy',
          ],
          boundaries: [
            'A recorded reservation amount is not settled money.',
            'Accounting and payment execution keep their separate authority.',
          ],
          service_example:
            'Stay close-out can reconcile reservation charges with actual payment and refund evidence.',
        },
        title: 'Stay financial evidence',
        decision: 'proposed',
        priority: {
          rank: 7,
          rationale:
            'First establish which financial records operators need; an optional booking total alone cannot support a credible receipts, costs or margin workflow.',
        },
        source_cluster_ids: ['financial-evidence'],
        source_tool_ids: ['financial-evidence-tool'],
        rationale:
          'Understand booked amounts, receipts, fees and costs without conflating them.',
        assessment: {
          market: {
            confidence: 'early',
            rationale:
              'Financial evidence is an exploratory proposal. The accommodation dataset supplies sector context but no direct validation of this accounting job or product demand.',
            validation_gap:
              'Desk research only; no original interviews, measured conversion or willingness-to-pay validation.',
            source_observation_ids: ['accommodation-context'],
          },
          implementation: {
            status: 'partial',
            assessed_at: '2026-10-05',
            scope:
              'Reservation total exists as optional money. It does not prove settlement, expenses, margin or accounting. Source inspection only, not fresh live acceptance testing.',
            source_paths: [
              'packages/extensions/fireux-reservations/src/runtime/property/models/reservation.model.ts',
            ],
          },
        },
      },
    ],
    next_step:
      'Prove a host can publish appropriate arrival information for a specific stay and a guest can use it. Then validate turnover and channel-integration needs; preserve Reservation authority.',
  },
})
