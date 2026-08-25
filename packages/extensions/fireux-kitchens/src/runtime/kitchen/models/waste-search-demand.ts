export type KitchenWasteDemandCluster = {
  id: string
  title: string
  operatorJob: string
  evidenceQueries: string[]
  interpretation: string
}

export type KitchenWasteToolHypothesis = {
  id: `kitchen.waste.${string}`
  label: string
  layer: 'human' | 'ai-assisted' | 'compound'
  purpose: string
  inputs: readonly string[]
  outputs: readonly string[]
  evidence: readonly string[]
  authority: string
  approval: string
  status: 'requested' | 'available'
}

export const kitchenWasteSearchDemand = {
  observedAt: '2026-08-23',
  geography: 'Switzerland',
  language: 'English',
  domain: 'Restaurant food waste management',
  question: 'What are Kitchen operators trying to do about food waste?',
  method:
    'Google Autocomplete seeds establish current search language. Independent operational literature validates the work behind those searches without being counted as search-demand evidence.',
  seeds: [
    {
      seed: 'restaurant food waste',
      queries: [
        'restaurant food waste app',
        'restaurant food waste management',
        'restaurant food waste recycling',
        'restaurant food waste log template',
        'restaurant food waste statistics',
        'restaurant food waste log',
        'restaurant food waste percentage',
        'restaurant food waste dataset',
        'restaurant food waste disposal regulations',
      ],
    },
    {
      seed: 'restaurant waste log',
      queries: [
        'restaurant waste log template',
        'restaurant waste log template free',
        'restaurant waste log pdf',
        'restaurant waste log sheet',
        'printable restaurant waste log',
      ],
    },
    {
      seed: 'restaurant waste management',
      queries: [
        'restaurant waste management plan',
        'restaurant waste management system',
        'restaurant waste management software',
      ],
    },
    {
      seed: 'food waste log template',
      queries: [
        'food waste log template excel',
        'food waste log template free',
        'food waste log template pdf',
        'food waste log template free printable',
        'free food waste log template excel',
        'food waste log sheet template',
      ],
    },
    {
      seed: 'food waste tracking app',
      queries: ['food waste tracking app', 'food waste tracking apps'],
    },
  ],
  clusters: [
    {
      id: 'capture',
      title: 'Record waste at the point it happens',
      operatorJob:
        'Replace memory, paper or an improvised spreadsheet with a quick Waste record.',
      evidenceQueries: [
        'restaurant food waste log',
        'restaurant waste log sheet',
        'food waste tracking app',
      ],
      interpretation:
        'Log, sheet, printable, Excel and app modifiers describe the same immediate capture job in different formats.',
    },
    {
      id: 'classify',
      title: 'Understand what was wasted and why',
      operatorJob:
        'Separate spoilage, preparation loss, overproduction, cooking mistakes and returned food.',
      evidenceQueries: [
        'restaurant food waste management',
        'restaurant waste management plan',
      ],
      interpretation:
        'A useful record needs consistent reasons and operational sources so repeated causes can be compared.',
    },
    {
      id: 'measure',
      title: 'Measure quantity and supported cost',
      operatorJob:
        'Understand the scale of Waste without inventing financial evidence.',
      evidenceQueries: [
        'restaurant food waste percentage',
        'restaurant food waste statistics',
        'restaurant food waste dataset',
      ],
      interpretation:
        'Quantity can be recorded directly. Cost must be derived only when Ingredient, Recipe or Dish cost evidence is authoritative.',
    },
    {
      id: 'improve',
      title: 'Find a practical reduction action',
      operatorJob:
        'Use recurring Waste patterns to improve ordering, storage, prep, production or portions.',
      evidenceQueries: [
        'restaurant waste management software',
        'restaurant food waste app',
      ],
      interpretation:
        'The valuable outcome is not a dashboard alone; it is a defensible operational change connected to the cause.',
    },
    {
      id: 'dispose',
      title: 'Handle disposal and reporting obligations',
      operatorJob:
        'Understand recycling, disposal and regulatory requirements for the operator’s location.',
      evidenceQueries: [
        'restaurant food waste recycling',
        'restaurant food waste disposal regulations',
      ],
      interpretation:
        'This is adjacent to the Kitchen Waste record but jurisdiction-specific guidance must not be presented as universal legal advice.',
    },
  ] satisfies KitchenWasteDemandCluster[],
  validationSources: [
    {
      label: 'UNEP Food Waste Index Report 2024',
      url: 'https://www.unep.org/resources/publication/food-waste-index-report-2024',
      note: 'Measurement guidance for food-service waste and the transition from measurement to reduction.',
    },
    {
      label: 'WRAP hospitality and food-service measurement guidance',
      url: 'https://www.wrap.ngo/resources/measuring-and-reporting-food-waste-hospitality-and-food-service',
      note: 'Supports consistent measurement, monitoring and reporting in hospitality and food service.',
    },
    {
      label: 'US EPA resources for assessing wasted food',
      url: 'https://www.epa.gov/sustainable-management-food/resources-assessing-wasted-food',
      note: 'Supports tracking amount, type and source, then using results to reduce Waste.',
    },
  ],
  records: [
  {
    id: 'kitchen.waste.event',
    label: 'Waste event',
    kind: 'owned',
    status: 'available',
    owner: 'Waste',
    authority: 'WasteEvent records one immutable observed loss without adjusting Inventory or inventing supported cost.',
    facts: [ 'item name', 'quantity and unit', 'reason and source', 'occurrence and actor', 'optional notes' ],
    readBy: [ 'kitchen.waste.review-patterns', 'kitchen.waste.calculate-supported-cost', 'kitchen.waste.propose-reduction' ],
    writtenBy: [ 'kitchen.waste.record-event' ]
  },
  {
    id: 'kitchen.waste.analysis',
    label: 'Waste analysis',
    kind: 'projection',
    status: 'requested',
    owner: 'Waste',
    authority: 'Patterns, supported cost and reduction proposals are traceable deductions over events and owner evidence, never replacement records.',
    facts: [
      'scope and compatible quantities',
      'source events and coverage',
      'supported cost evidence',
      'patterns, uncertainty and exclusions'
    ],
    readBy: [ 'kitchen.waste.review-patterns', 'kitchen.waste.calculate-supported-cost', 'kitchen.waste.propose-reduction' ],
    writtenBy: []
  }
],
  recordQuestions: [
    'What was wasted: Ingredient, Recipe, Dish, Drink or an unstructured item?',
    'How much was wasted, in which unit, and when?',
    'Why was it wasted and at which operational stage?',
    'Which Kitchen, Station, service, Order or preparation task provides context?',
    'Is an authoritative unit cost available, or must cost remain unknown?',
    'What evidence and actor stamp make the record reviewable?',
  ],
  toolHypotheses: [
    {
      id: 'kitchen.waste.record-event',
      label: 'Record Waste',
      layer: 'human',
      purpose: 'Capture one Waste event at the point it occurs.',
      inputs: [
        'item or item reference',
        'quantity and unit',
        'reason',
        'operational source',
        'occurred time',
      ],
      outputs: ['one reviewable Kitchen Waste event'],
      evidence: [
        'current Kitchen',
        'actor identity',
        'optional Ingredient, Recipe, Dish, Drink, Station, Mise or Order reference',
      ],
      authority:
        'The guarded Waste create mutation targets the selected Kitchen, stamps the actor and relies on Firestore rules for write authority.',
      approval:
        'The operator explicitly submits the record before anything is written.',
      status: 'available',
    },
    {
      id: 'kitchen.waste.review-patterns',
      label: 'Review Waste Patterns',
      layer: 'human',
      purpose: 'Group recorded Waste by item, reason, source and period.',
      inputs: [
        'authorized Waste events',
        'period',
        'optional reason, source or item filters',
      ],
      outputs: ['traceable quantities and recurring-pattern summaries'],
      evidence: ['only recorded Waste events inside the requested period'],
      authority:
        'A bounded reader returns only Waste records the current identity may inspect.',
      approval: 'Reading requires authority but no mutation approval.',
      status: 'requested',
    },
    {
      id: 'kitchen.waste.calculate-supported-cost',
      label: 'Calculate Supported Waste Cost',
      layer: 'ai-assisted',
      purpose:
        'Attach or aggregate cost only when an authoritative operational cost can be resolved.',
      inputs: [
        'Waste event quantity',
        'unit',
        'item reference',
        'authoritative unit-cost evidence',
      ],
      outputs: [
        'supported cost with source identity',
        'unknown when evidence is absent',
      ],
      evidence: [
        'Ingredient purchase price, Recipe cost or Dish cost with compatible units',
      ],
      authority:
        'The calculation reads bounded source evidence and never substitutes an estimate for a missing cost.',
      approval:
        'A read-only calculation needs no mutation approval; persisting a result would require a separate approved command.',
      status: 'requested',
    },
    {
      id: 'kitchen.waste.propose-reduction',
      label: 'Propose a Waste Reduction Action',
      layer: 'compound',
      purpose:
        'Turn a repeated, evidenced Waste pattern into a contextual operational proposal.',
      inputs: [
        'pattern summary',
        'supporting Waste events',
        'available downstream Tools',
      ],
      outputs: [
        'reasoned suggestion',
        'supporting evidence',
        'optional proposed Tool invocation',
      ],
      evidence: [
        'repeated pattern plus relevant Inventory, Purchasing, Mise, Recipe, Dish or Order context when available',
      ],
      authority:
        'WasteAI may propose from authorized evidence but cannot change another capability directly.',
      approval:
        'Suggestions need no approval; every proposed mutation requires the destination Tool’s own approval.',
      status: 'requested',
    },
  ] satisfies KitchenWasteToolHypothesis[],
  aiContract: {
    wasteAI: [
      'Own Waste interpretation, evidence requirements and the Waste Tool catalogue.',
      'Answer general Waste questions without claiming live Kitchen evidence.',
      'Use only authorized Waste context and currently available Tools.',
      'Expose requested Tools as unavailable language, never as executable actions.',
      'Return evidence, uncertainty and any approval requirement with a proposal.',
    ],
    kitchenAI: [
      'Recognise Waste intent and delegate it to WasteAI.',
      'Pass current Kitchen orientation and authorized context without copying Waste expertise.',
      'Discover Waste Tool availability through WasteAI registration rather than hard-coded Tool knowledge.',
      'Present WasteAI results and preserve approval boundaries for any future action.',
    ],
    activation: [
      'The required canonical records exist.',
      'A trusted reader or command implements the Tool contract.',
      'The Tool is registered to WasteAI with its real availability and approval policy.',
      'Authorization, UI, audit behaviour and verification are complete.',
    ],
  },
  conclusion:
    'Waste is a distinct operational capability. Its first producer should be a fast, structured Waste event; reporting and AI deductions follow from those records rather than replacing them.',
  nextStep:
    'Confirm the Waste event shape, then define the smallest recording tool and the evidence WasteAI may use for suggestions.',
} as const
