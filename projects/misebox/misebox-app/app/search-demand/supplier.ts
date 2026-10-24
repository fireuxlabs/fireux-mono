import { defineAppSearchDemand } from 'fireux-core/config/app/search-demand'

export const supplierResearch = defineAppSearchDemand({
  domain: 'Foodservice supply operations',
  operator:
    'Independent food producers, specialist distributors and wholesalers supplying professional Kitchens.',
  description:
    'Supplier-side research, separate from Kitchen-side purchasing. Start with a small Swiss supplier and a repeat Kitchen buyer; large distributors provide comparison evidence, not a mandatory ERP blueprint.',
  research_scope: {
    audience:
      'Small Swiss food suppliers selling repeatedly to independent Kitchens; producer, distributor and wholesaler differences require interviews.',
    geography: 'Switzerland first.',
    languages: ['German', 'English'],
    reviewed_at: '2026-10-05',
    limitations:
      'Desk research from supplier documentation and standards guidance. No original interviews, search volumes or paid-demand validation. Research ranking is product judgement; safety and information obligations apply throughout.',
  },
  observations: [
    {
      id: 'supplier-ordering',
      source: 'product-documentation',
      query: 'Swiss foodservice ordering and customer account workflow',
      source_url: 'https://www.transgourmet.ch/de/services/belieferung',
      finding:
        'Transgourmet combines a product catalogue, online ordering, account documents and delivery.',
      limitations:
        'One large distributor describes its offering; small-supplier adoption and willingness to pay are untested.',
      geography: 'Switzerland',
      language: 'German',
      observed_at: '2026-10-05',
    },
    {
      id: 'supplier-cutoffs',
      source: 'product-documentation',
      query: 'Delivery eligibility and order cutoff rules',
      source_url:
        'https://www.transgourmet.ch/de/webshop/bestellschlusszeiten-und-liefertermine-im-webshop',
      finding:
        'The supplier distinguishes delivery eligibility and cutoff times by product group.',
      limitations:
        'Vendor-specific rules; do not reuse its timings as Misebox defaults.',
      geography: 'Switzerland',
      language: 'German',
      observed_at: '2026-10-05',
    },
    {
      id: 'supplier-product-data',
      source: 'product-documentation',
      query: 'Product information supplied by food producers and importers',
      source_url: 'https://trustbox.gs1.ch/en/was-ist-trustbox',
      finding:
        'GS1 trustbox links supplier-maintained product identity with structured information and exchange.',
      limitations:
        'A standards service shows a data-exchange job; no Misebox connector, data licence or universal fresh-food coverage is implied.',
      geography: 'Switzerland',
      language: 'English',
      observed_at: '2026-10-05',
    },
    {
      id: 'supplier-traceability',
      source: 'operational-guidance',
      query: 'Identify product batches and supply-chain events',
      source_url: 'https://www.gs1.ch/de/aktuelles/themen/rueckverfolgbarkeit',
      finding:
        'GS1 describes linking product and location identifiers with batch and movement information.',
      limitations:
        'Standards guidance is not an exhaustive legal checklist or evidence that these records exist in FireUX.',
      geography: 'Switzerland',
      language: 'German',
      observed_at: '2026-10-05',
    },
  ],
  summary: {
    conclusion:
      'Prove a clear supplier offer leading to a buyer request and explicit supplier confirmation.',
    findings: [
      'Catalogue, commercial terms, order acceptance and fulfilment are different responsibilities.',
      'The current Supplier Workspace supplies read surfaces, not a complete trading platform.',
      'Kitchen purchase orders and receiving belong to the buyer; Supplier acceptance and delivery belong to the seller.',
      'Large-distributor portals show existing workflows but do not prove that small suppliers want another system.',
      'Traceability and product assurance need actual product, batch and jurisdiction evidence.',
    ],
    next_step:
      'Recruit one supplier and one Kitchen buyer; observe their current catalogue, pack/price agreement, repeat order and exception handling before implementing transactional Tools.',
  },
  analysis: {
    summary:
      'Seven distinct supplier jobs; no single vendor catalogue defines the entire domain.',
    clusters: [
      {
        id: 'catalogue',
        title: 'Product catalogue and specifications',
        operator_job:
          'Maintain a clear, current offer that a Kitchen can understand and reorder.',
        intents: ['perform', 'troubleshoot'],
        evidence_queries: [
          'Maintain a clear, current offer that a Kitchen can understand and reorder.',
        ],
        confidence: 'strong',
        source_observation_ids: ['supplier-ordering', 'supplier-product-data'],
        interpretation:
          'The sources support this operator responsibility; the proposed FireUX product and its priority remain an inference.',
        research_gap:
          'Test one supplier catalogue containing products, packs, identifiers and buyer-relevant specifications.',
      },
      {
        id: 'commercial-offers',
        title: 'Customer prices and terms',
        operator_job:
          'Quote the right pack, price, minimum quantity and customer terms.',
        intents: ['perform', 'troubleshoot'],
        evidence_queries: [
          'Quote the right pack, price, minimum quantity and customer terms.',
        ],
        confidence: 'moderate',
        source_observation_ids: ['supplier-ordering', 'supplier-cutoffs'],
        interpretation:
          'The sources support this operator responsibility; the proposed FireUX product and its priority remain an inference.',
        research_gap:
          'Validate how one supplier currently negotiates prices, minimum orders and substitutions.',
      },
      {
        id: 'orders',
        title: 'Customer relationships and order intake',
        operator_job:
          'Accept a repeat order and give the buyer an explicit confirmation.',
        intents: ['perform', 'troubleshoot'],
        evidence_queries: [
          'Accept a repeat order and give the buyer an explicit confirmation.',
        ],
        confidence: 'moderate',
        source_observation_ids: ['supplier-ordering'],
        interpretation:
          'The sources support this operator responsibility; the proposed FireUX product and its priority remain an inference.',
        research_gap:
          'Test catalogue to request to supplier confirmation without assuming an ERP integration.',
      },
      {
        id: 'delivery',
        title: 'Delivery and discrepancy handling',
        operator_job:
          'Fulfil an accepted order and resolve missing or substituted goods.',
        intents: ['perform', 'troubleshoot'],
        evidence_queries: [
          'Fulfil an accepted order and resolve missing or substituted goods.',
        ],
        confidence: 'moderate',
        source_observation_ids: ['supplier-ordering', 'supplier-cutoffs'],
        interpretation:
          'The sources support this operator responsibility; the proposed FireUX product and its priority remain an inference.',
        research_gap:
          'Interview suppliers on cutoff, picking, delivery evidence and exceptions before designing dispatch.',
      },
      {
        id: 'assurance',
        title: 'Product assurance and traceability',
        operator_job:
          'Keep product information and relevant batch evidence available for buyers.',
        intents: ['perform', 'troubleshoot'],
        evidence_queries: [
          'Keep product information and relevant batch evidence available for buyers.',
        ],
        confidence: 'strong',
        source_observation_ids: [
          'supplier-product-data',
          'supplier-traceability',
        ],
        interpretation:
          'The sources support this operator responsibility; the proposed FireUX product and its priority remain an inference.',
        research_gap:
          'Identify the actual products, jurisdiction, batch evidence and data rights; obligations apply regardless of validation rank.',
      },
      {
        id: 'availability',
        title: 'Availability and replenishment',
        operator_job:
          'Tell customers what can be supplied and offer an explicit replacement.',
        intents: ['perform', 'troubleshoot'],
        evidence_queries: [
          'Tell customers what can be supplied and offer an explicit replacement.',
        ],
        confidence: 'moderate',
        source_observation_ids: ['supplier-cutoffs', 'supplier-ordering'],
        interpretation:
          'The sources support this operator responsibility; the proposed FireUX product and its priority remain an inference.',
        research_gap:
          'Test availability and substitutions inside the order-request proof before building a stock engine.',
      },
      {
        id: 'billing',
        title: 'Invoices, credits and payment evidence',
        operator_job:
          'Reconcile delivered goods with invoices, credits and payment evidence.',
        intents: ['perform', 'troubleshoot'],
        evidence_queries: [
          'Reconcile delivered goods with invoices, credits and payment evidence.',
        ],
        confidence: 'moderate',
        source_observation_ids: ['supplier-ordering'],
        interpretation:
          'The sources support this operator responsibility; the proposed FireUX product and its priority remain an inference.',
        research_gap:
          'Establish the supplier accounting boundary and required exports before creating financial workflows.',
      },
    ],
    next_step:
      'Validate the catalogue and request boundary with a small supplier.',
  },
  tools: {
    summary: 'Bounded validation hypotheses, not shipped Tools.',
    tools: [
      {
        id: 'catalogue-proof',
        title: 'Product catalogue and specifications proof',
        source_cluster_ids: ['catalogue'],
        operator_job:
          'Maintain a clear, current offer that a Kitchen can understand and reorder.',
        outcome:
          'Test one supplier catalogue containing products, packs, identifiers and buyer-relevant specifications.',
        status: 'test-now',
      },
      {
        id: 'commercial-offers-proof',
        title: 'Customer prices and terms proof',
        source_cluster_ids: ['commercial-offers'],
        operator_job:
          'Quote the right pack, price, minimum quantity and customer terms.',
        outcome:
          'Validate how one supplier currently negotiates prices, minimum orders and substitutions.',
        status: 'research-next',
      },
      {
        id: 'orders-proof',
        title: 'Customer relationships and order intake proof',
        source_cluster_ids: ['orders'],
        operator_job:
          'Accept a repeat order and give the buyer an explicit confirmation.',
        outcome:
          'Test catalogue to request to supplier confirmation without assuming an ERP integration.',
        status: 'research-next',
      },
      {
        id: 'delivery-proof',
        title: 'Delivery and discrepancy handling proof',
        source_cluster_ids: ['delivery'],
        operator_job:
          'Fulfil an accepted order and resolve missing or substituted goods.',
        outcome:
          'Interview suppliers on cutoff, picking, delivery evidence and exceptions before designing dispatch.',
        status: 'later',
      },
      {
        id: 'assurance-proof',
        title: 'Product assurance and traceability proof',
        source_cluster_ids: ['assurance'],
        operator_job:
          'Keep product information and relevant batch evidence available for buyers.',
        outcome:
          'Identify the actual products, jurisdiction, batch evidence and data rights; obligations apply regardless of validation rank.',
        status: 'later',
      },
      {
        id: 'availability-proof',
        title: 'Availability and replenishment proof',
        source_cluster_ids: ['availability'],
        operator_job:
          'Tell customers what can be supplied and offer an explicit replacement.',
        outcome:
          'Test availability and substitutions inside the order-request proof before building a stock engine.',
        status: 'later',
      },
      {
        id: 'billing-proof',
        title: 'Invoices, credits and payment evidence proof',
        source_cluster_ids: ['billing'],
        operator_job:
          'Reconcile delivered goods with invoices, credits and payment evidence.',
        outcome:
          'Establish the supplier accounting boundary and required exports before creating financial workflows.',
        status: 'later',
      },
    ],
    next_step:
      'Run the catalogue proof, then observe a request and confirmation.',
  },
  capabilities: {
    summary:
      'Ranked proposals for validation; lower rank does not make legal or safety duties optional.',
    capabilities: [
      {
        id: 'catalogue',
        definition: {
          purpose:
            'Maintain the products a Supplier offers and the specifications buyers need.',
          manages: ['Supplier catalogue entries and product presentation'],
          uses: [
            'Canonical Product and Ingredient references',
            'Commercial offers and assurance evidence',
          ],
          tools: [
            'Create or edit a catalogue item',
            'Review specifications',
            'Prepare a buyer-facing catalogue',
          ],
          boundaries: [
            'Product specifications are separate from buyer-specific commercial terms.',
            'Catalogue visibility does not enable ordering or prove publication.',
          ],
          service_example:
            'Buyer ordering setup can combine a reviewed catalogue with eligible offers and order intake.',
        },
        title: 'Product catalogue and specifications',
        decision: 'proposed',
        priority: {
          rank: 1,
          rationale:
            'Test one supplier catalogue containing products, packs, identifiers and buyer-relevant specifications.',
        },
        source_cluster_ids: ['catalogue'],
        source_tool_ids: ['catalogue-proof'],
        rationale:
          'Maintain a clear, current offer that a Kitchen can understand and reorder.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'The cited primary sources establish the job or existing product supply, not demand for FireUX.',
            validation_gap:
              'No original supplier interviews, measured conversion or willingness-to-pay validation. Large-distributor evidence may not fit small producers.',
            source_observation_ids: [
              'supplier-ordering',
              'supplier-product-data',
            ],
          },
          implementation: {
            status: 'partial',
            assessed_at: '2026-10-05',
            scope:
              'Catalogue, Ingredient and Item readers exist. A complete authored offer, unit/pack model and publication workflow are not established. Source inspection only; no fresh operator acceptance test.',
            source_paths: [
              'packages/extensions/fireux-suppliers/src/runtime/supplier/models/capabilities.ts',
              'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/catalogue/useSupplierWorkspaceCatalogues.ts',
              'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/items/useSupplierWorkspaceItems.ts',
            ],
          },
        },
      },
      {
        id: 'commercial-offers',
        definition: {
          purpose:
            'Describe the prices, pack sizes and buying terms offered to a customer.',
          manages: [
            'Supplier commercial item terms',
            'Customer-specific offer and validity decisions',
          ],
          uses: ['Catalogue products and buyer relationships'],
          tools: [
            'Set pack and minimum quantity',
            'Review prices and lead times',
            'Prepare a customer offer',
          ],
          boundaries: [
            'Catalogue facts do not own negotiated prices.',
            'An offer is not an accepted Order or settled invoice.',
          ],
          service_example:
            'A quote-to-order journey can validate an offer before accepting a buyer request.',
        },
        title: 'Customer prices and terms',
        decision: 'proposed',
        priority: {
          rank: 2,
          rationale:
            'Validate how one supplier currently negotiates prices, minimum orders and substitutions.',
        },
        source_cluster_ids: ['commercial-offers'],
        source_tool_ids: ['commercial-offers-proof'],
        rationale:
          'Quote the right pack, price, minimum quantity and customer terms.',
        assessment: {
          market: {
            confidence: 'moderate',
            rationale:
              'The cited primary sources establish the job or existing product supply, not demand for FireUX.',
            validation_gap:
              'No original supplier interviews, measured conversion or willingness-to-pay validation. Large-distributor evidence may not fit small producers.',
            source_observation_ids: ['supplier-ordering', 'supplier-cutoffs'],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'No customer-specific quotation or terms lifecycle was proved in the inspected catalogue. Source inspection only; no fresh operator acceptance test.',
            source_paths: [
              'packages/extensions/fireux-suppliers/src/runtime/supplier/models/capabilities.ts',
            ],
          },
        },
      },
      {
        id: 'orders',
        definition: {
          purpose:
            'Maintain buyer relationships and handle incoming purchase requests.',
          manages: [
            'Buyer relationship context',
            'Supplier-side order acceptance and status',
          ],
          uses: ['Catalogue, commercial terms and delivery eligibility'],
          tools: [
            'Review a buyer request',
            'Accept or decline a request',
            'Confirm agreed lines',
          ],
          boundaries: [
            'Kitchen purchase orders and Supplier sales orders have distinct owners.',
            'Delivery and payment require separate evidence.',
          ],
          service_example:
            'Buyer request fulfilment can coordinate agreed terms, accepted lines and delivery.',
        },
        title: 'Customer relationships and order intake',
        decision: 'proposed',
        priority: {
          rank: 3,
          rationale:
            'Test catalogue to request to supplier confirmation without assuming an ERP integration.',
        },
        source_cluster_ids: ['orders'],
        source_tool_ids: ['orders-proof'],
        rationale:
          'Accept a repeat order and give the buyer an explicit confirmation.',
        assessment: {
          market: {
            confidence: 'moderate',
            rationale:
              'The cited primary sources establish the job or existing product supply, not demand for FireUX.',
            validation_gap:
              'No original supplier interviews, measured conversion or willingness-to-pay validation. Large-distributor evidence may not fit small producers.',
            source_observation_ids: ['supplier-ordering'],
          },
          implementation: {
            status: 'not-connected',
            assessed_at: '2026-10-05',
            scope:
              'Supplier Workspace currently exposes Catalogue, Ingredients and Items, not an order acceptance workflow. Kitchen purchase-order placeholders do not supply this. Source inspection only; no fresh operator acceptance test.',
            source_paths: [
              'packages/extensions/fireux-suppliers/src/runtime/supplier/models/capabilities.ts',
            ],
          },
        },
      },
      {
        id: 'delivery',
        definition: {
          purpose:
            'Record what was dispatched or delivered and resolve discrepancies.',
          manages: [
            'Dispatch and delivery evidence',
            'Shortages, substitutions and discrepancy decisions',
          ],
          uses: [
            'Accepted supplier orders',
            'Product traceability and buyer receipt evidence',
          ],
          tools: [
            'Prepare a delivery',
            'Record dispatch',
            'Resolve a discrepancy',
          ],
          boundaries: [
            'Dispatch is not proof of buyer receipt.',
            'Credits and stock changes require their own supported commands.',
          ],
          service_example:
            'Delivery resolution can reconcile dispatch, buyer receipt and an authorized credit decision.',
        },
        title: 'Delivery and discrepancy handling',
        decision: 'proposed',
        priority: {
          rank: 4,
          rationale:
            'Interview suppliers on cutoff, picking, delivery evidence and exceptions before designing dispatch.',
        },
        source_cluster_ids: ['delivery'],
        source_tool_ids: ['delivery-proof'],
        rationale:
          'Fulfil an accepted order and resolve missing or substituted goods.',
        assessment: {
          market: {
            confidence: 'moderate',
            rationale:
              'The cited primary sources establish the job or existing product supply, not demand for FireUX.',
            validation_gap:
              'No original supplier interviews, measured conversion or willingness-to-pay validation. Large-distributor evidence may not fit small producers.',
            source_observation_ids: ['supplier-ordering', 'supplier-cutoffs'],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'No Supplier delivery, proof-of-delivery or discrepancy lifecycle was proved. Source inspection only; no fresh operator acceptance test.',
            source_paths: [
              'packages/extensions/fireux-suppliers/src/runtime/supplier/models/capabilities.ts',
            ],
          },
        },
      },
      {
        id: 'assurance',
        definition: {
          purpose:
            'Maintain product evidence that supports safe buying and traceability.',
          manages: [
            'Supplier assurance documents and references',
            'Lot and traceability evidence where supported',
          ],
          uses: [
            'Canonical product specifications',
            'Origin and manufacturer evidence',
          ],
          tools: [
            'Attach assurance evidence',
            'Review specification changes',
            'Trace an affected lot',
          ],
          boundaries: [
            'Evidence does not certify compliance automatically.',
            'Kitchen preparation safety remains the Kitchen’s responsibility.',
          ],
          service_example:
            'An affected-product response can use traceability alongside order and delivery records.',
        },
        title: 'Product assurance and traceability',
        decision: 'proposed',
        priority: {
          rank: 5,
          rationale:
            'Identify the actual products, jurisdiction, batch evidence and data rights; obligations apply regardless of validation rank.',
        },
        source_cluster_ids: ['assurance'],
        source_tool_ids: ['assurance-proof'],
        rationale:
          'Keep product information and relevant batch evidence available for buyers.',
        assessment: {
          market: {
            confidence: 'strong',
            rationale:
              'The cited primary sources establish the job or existing product supply, not demand for FireUX.',
            validation_gap:
              'No original supplier interviews, measured conversion or willingness-to-pay validation. Large-distributor evidence may not fit small producers.',
            source_observation_ids: [
              'supplier-product-data',
              'supplier-traceability',
            ],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'Ingredient links and catalogue rows do not establish batch traceability, recall coverage or an approved safety system. Source inspection only; no fresh operator acceptance test.',
            source_paths: [
              'packages/extensions/fireux-suppliers/src/runtime/supplier/models/capabilities.ts',
            ],
          },
        },
      },
      {
        id: 'availability',
        definition: {
          purpose:
            'Describe what the Supplier can fulfil and identify replenishment needs.',
          manages: [
            'Availability assertions and fulfilment constraints',
            'Supplier replenishment decisions',
          ],
          uses: [
            'Product catalogue and confirmed demand',
            'Stock evidence where connected',
          ],
          tools: [
            'Review availability',
            'Record a shortage',
            'Prepare replenishment',
          ],
          boundaries: [
            'An availability claim is not a stock reservation.',
            'Accepted order and delivery quantities remain separate evidence.',
          ],
          service_example:
            'Order acceptance can use current availability before confirming fulfilment.',
        },
        title: 'Availability and replenishment',
        decision: 'proposed',
        priority: {
          rank: 6,
          rationale:
            'Test availability and substitutions inside the order-request proof before building a stock engine.',
        },
        source_cluster_ids: ['availability'],
        source_tool_ids: ['availability-proof'],
        rationale:
          'Tell customers what can be supplied and offer an explicit replacement.',
        assessment: {
          market: {
            confidence: 'moderate',
            rationale:
              'The cited primary sources establish the job or existing product supply, not demand for FireUX.',
            validation_gap:
              'No original supplier interviews, measured conversion or willingness-to-pay validation. Large-distributor evidence may not fit small producers.',
            source_observation_ids: ['supplier-cutoffs', 'supplier-ordering'],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'No authoritative Supplier stock, allocation or substitution engine was proved. Source inspection only; no fresh operator acceptance test.',
            source_paths: [
              'packages/extensions/fireux-suppliers/src/runtime/supplier/models/capabilities.ts',
            ],
          },
        },
      },
      {
        id: 'billing',
        definition: {
          purpose:
            'Keep invoices, credits and payment evidence tied to the Supplier’s trade.',
          manages: [
            'Supplier invoice and credit context',
            'Reconciliation decisions',
          ],
          uses: ['Accepted orders, deliveries and provider payment evidence'],
          tools: [
            'Review an invoice',
            'Prepare a supported credit',
            'Reconcile payment evidence',
          ],
          boundaries: [
            'An invoice is not a payment receipt.',
            'Statutory accounting and payment execution need their own validated scope.',
          ],
          service_example:
            'Trade close-out can reconcile an order, delivery, invoice and payment evidence.',
        },
        title: 'Invoices, credits and payment evidence',
        decision: 'proposed',
        priority: {
          rank: 7,
          rationale:
            'Establish the supplier accounting boundary and required exports before creating financial workflows.',
        },
        source_cluster_ids: ['billing'],
        source_tool_ids: ['billing-proof'],
        rationale:
          'Reconcile delivered goods with invoices, credits and payment evidence.',
        assessment: {
          market: {
            confidence: 'moderate',
            rationale:
              'The cited primary sources establish the job or existing product supply, not demand for FireUX.',
            validation_gap:
              'No original supplier interviews, measured conversion or willingness-to-pay validation. Large-distributor evidence may not fit small producers.',
            source_observation_ids: ['supplier-ordering'],
          },
          implementation: {
            status: 'not-assessed',
            assessed_at: '2026-10-05',
            scope:
              'Account documents in a vendor portal do not prove a FireUX invoice, tax or settlement system. Source inspection only; no fresh operator acceptance test.',
            source_paths: [
              'packages/extensions/fireux-suppliers/src/runtime/supplier/models/capabilities.ts',
            ],
          },
        },
      },
    ],
    next_step:
      'Keep current read ownership and prove one supplier-to-Kitchen exchange.',
  },
  reconciliation: {
    first_journey: {
      title: 'Supplier offer to one buyer request',
      purpose:
        'Let a Supplier describe an orderable pack and receive an explicit request from a Kitchen buyer.',
      capability_ids: ['catalogue', 'commercial-offers'],
      pages: [
        {
          label: 'Supplier catalogue',
          path: '/workspace/supplier/catalogue',
          availability: 'not-enabled',
        },
        {
          label: 'Supplier items',
          path: '/workspace/supplier/items',
          availability: 'not-enabled',
        },
      ],
      tools: [
        {
          label: 'Read catalogue and commercial items',
          status: 'connected',
          owner: 'Supplier',
          source_paths: [
            'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Workspace/Catalogue/Index.vue',
          ],
        },
        {
          label: 'Review an offer, submit buyer request and confirm receipt',
          status: 'planned',
          owner: 'Supplier / Kitchen',
          source_paths: [],
        },
      ],
      services: [
        {
          label: 'Maintain Supplier-owned commercial item records',
          status: 'connected',
          owner: 'Supplier',
          source_paths: [
            'packages/extensions/fireux-suppliers/src/runtime/supplier/server/items/commands.ts',
          ],
        },
        {
          label: 'Authorise buyer request and supplier acknowledgement',
          status: 'planned',
          owner: 'Supplier / Kitchen',
          source_paths: [],
        },
      ],
      acceptance: [
        'The buyer sees a named offer, pack, unit, price, currency and availability from the owning Supplier.',
        'The Kitchen explicitly submits one request; the Supplier acknowledges the same request without treating it as a paid or fulfilled order.',
        'Supplier offer ownership and Kitchen buyer authority remain distinct throughout the exchange.',
      ],
      gaps: [
        'Supplier runtime is not enabled in Misebox; its research brief does not enable routes.',
        'Buyer requests, acknowledgement and catalogue publication remain unbuilt.',
        'Commercial item mutation commands do not prove a complete catalogue-authoring tool.',
      ],
      checks: [],
    },
    workspace: 'Supplier',
    reviewed_at: '2026-10-05',
    summary:
      'Keep the three Supplier read surfaces as one connected offer-data starting point. Prove catalogue to buyer request before extending into orders, delivery or ERP. Product records remain Supplier-owned; Kitchen purchasing remains buyer-owned.',
    foundations: [
      'Home and selection, Overview, Identity and Team remain platform foundations.',
      'Calendar has a surface but no supplier dispatch schedule has been proved.',
      'Test is a development harness, not a supplier business capability.',
    ],
    entries: [
      {
        id: 'catalogue-read',
        title: 'Catalogue',
        action: 'improve',
        status: 'partial',
        rationale:
          'Keep the reader; validate authoring, publication, packs and specifications together.',
        source_paths: [
          'packages/extensions/fireux-suppliers/src/runtime/supplier/components/Workspace/Catalogue/Index.vue',
        ],
        source_capability_ids: ['catalogue'],
        source_observation_ids: ['supplier-ordering', 'supplier-product-data'],
      },
      {
        id: 'ingredient-links',
        title: 'Ingredients',
        action: 'keep',
        status: 'partial',
        rationale:
          'Ingredient links help buyer understanding; this does not justify copying Kitchen recipe or stock ownership.',
        source_paths: [
          'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/ingredients/useSupplierWorkspaceIngredients.ts',
        ],
        source_capability_ids: ['catalogue', 'assurance'],
        source_observation_ids: ['supplier-product-data'],
      },
      {
        id: 'supplier-items',
        title: 'Items',
        action: 'improve',
        status: 'partial',
        rationale:
          'Retain Supplier-owned commercial item rows; distinguish a sellable pack from the generic Ingredient it references.',
        source_paths: [
          'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/items/useSupplierWorkspaceItems.ts',
        ],
        source_capability_ids: ['catalogue', 'commercial-offers'],
        source_observation_ids: ['supplier-ordering', 'supplier-product-data'],
      },
    ],
  },
})
