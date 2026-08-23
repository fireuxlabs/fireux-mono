export type KitchenInventoryToolHypothesis = {
  id: `kitchen.inventory.${string}`
  label: string
  layer: 'human' | 'ai-assisted' | 'compound'
  purpose: string
  inputs: readonly string[]
  outputs: readonly string[]
  evidence: readonly string[]
  authority: string
  approval: string
  status: 'requested'
}

export const kitchenInventorySearchDemand = {
  observedAt: '2026-08-23',
  geography: 'English-language web',
  language: 'English',
  question: 'What are Kitchen operators trying to do with Inventory?',
  method: 'Current search results establish the language operators use. Independent product and operational guidance validates the work behind those searches without being treated as proof that Misebox already performs it.',
  seeds: [
    {
      seed: 'restaurant inventory',
      queries: ['restaurant inventory management software', 'restaurant inventory app', 'restaurant inventory system', 'restaurant inventory spreadsheet'],
    },
    {
      seed: 'restaurant stocktake',
      queries: ['restaurant stocktake app', 'restaurant stocktake template', 'food stocktake sheet', 'restaurant inventory count'],
    },
    {
      seed: 'food inventory',
      queries: ['food inventory spreadsheet', 'food inventory tracking app', 'restaurant freezer inventory app', 'kitchen stock control system'],
    },
    {
      seed: 'restaurant stock control',
      queries: ['restaurant par levels', 'restaurant reorder points', 'restaurant inventory variance', 'restaurant expiry tracking'],
    },
  ],
  clusters: [
    {
      id: 'organise',
      title: 'Organise what must be counted',
      operatorJob: 'Keep one countable list of Ingredients and other stock arranged by storage location.',
      evidenceQueries: ['restaurant inventory spreadsheet', 'food stocktake sheet'],
      interpretation: 'Operators commonly count in walk-through order across dry store, fridges, freezers, bar and other locations.',
    },
    {
      id: 'count',
      title: 'Record a physical stocktake',
      operatorJob: 'Capture on-hand quantities quickly in units that match how each item is stored and counted.',
      evidenceQueries: ['restaurant stocktake app', 'restaurant inventory count'],
      interpretation: 'A count needs item, location, quantity, unit, time and actor evidence; it is not a mutable current-number field without history.',
    },
    {
      id: 'levels',
      title: 'Know what is low, available or expiring',
      operatorJob: 'Compare supported on-hand evidence with par levels, reorder points and expiry information.',
      evidenceQueries: ['restaurant par levels', 'restaurant reorder points', 'restaurant expiry tracking'],
      interpretation: 'Inventory can identify a replenishment need, while Purchasing owns deciding and approving what to buy.',
    },
    {
      id: 'variance',
      title: 'Explain stock variance',
      operatorJob: 'Compare physical counts with supported receipts, usage and Waste evidence.',
      evidenceQueries: ['restaurant inventory variance', 'kitchen stock control system'],
      interpretation: 'A variance is a deduction over evidence. It must retain its period and inputs instead of pretending to be an observed fact.',
    },
    {
      id: 'value',
      title: 'Understand supported stock value',
      operatorJob: 'Calculate value only when quantities, units and authoritative item costs are compatible.',
      evidenceQueries: ['restaurant inventory management software', 'food inventory spreadsheet'],
      interpretation: 'Inventory supplies quantities. It must not invent purchase prices, recipe costs, COGS or profit when their evidence is absent.',
    },
  ],
  validationSources: [
    {
      label: 'Toast inventory and par-level guidance',
      url: 'https://support.toasttab.com/en/article/Manage-Your-Inventory-for-Restaurant-Retail',
      note: 'Validates on-hand tracking and item-level minimum and maximum par levels.',
    },
    {
      label: 'Stockcount restaurant inventory template',
      url: 'https://stockcount.io/tools/restaurant-inventory-template',
      note: 'Validates storage-area ordering, count units, on-hand quantities, vendor references, reorder points and par levels.',
    },
    {
      label: 'US Foods CHEF’STORE inventory checklist',
      url: 'https://chefstore.com/downloads/files/blog/2023/CHECKLIST-INVENTORY-MANAGEMENT-JAN-2022.PDF',
      note: 'Validates item-and-unit counts, inventory sheets and variance as operational inventory concerns.',
    },
  ],
  recordQuestions: [
    'Which Ingredient or other countable stock item is being counted?',
    'Where is it stored, how much is present, and in which count unit?',
    'When was the count taken and who recorded it?',
    'Is the quantity a physical observation or a deduction from other records?',
    'Which par level, reorder point, batch or expiry evidence applies?',
    'Can Receiving, usage and Waste evidence explain a variance for the period?',
    'Is an authoritative compatible unit cost available, or must value remain unknown?',
  ],
  toolHypotheses: [
    {
      id: 'kitchen.inventory.prepare-count', label: 'Prepare Inventory Count', layer: 'human',
      purpose: 'Prepare a count session arranged by Kitchen storage location.',
      inputs: ['authorized stock catalogue', 'storage locations', 'optional prior count'],
      outputs: ['one bounded Inventory count session'],
      evidence: ['Ingredient identity', 'count unit', 'storage location'],
      authority: 'A trusted reader includes only stock belonging to the selected Kitchen.',
      approval: 'Preparing a session is read-only; saving its scope requires explicit operator confirmation.', status: 'requested',
    },
    {
      id: 'kitchen.inventory.record-count', label: 'Record Inventory Count', layer: 'human',
      purpose: 'Record observed on-hand quantities for one count session.',
      inputs: ['count session', 'item quantities and units', 'counted time'],
      outputs: ['immutable, actor-stamped count observations'],
      evidence: ['current Kitchen', 'actor identity', 'countable items and locations'],
      authority: 'A trusted command verifies Kitchen write authority and compatible units.',
      approval: 'The operator reviews and explicitly submits the count.', status: 'requested',
    },
    {
      id: 'kitchen.inventory.review-levels', label: 'Review Stock Levels', layer: 'ai-assisted',
      purpose: 'Compare latest supported counts with par, reorder and expiry evidence.',
      inputs: ['latest count observations', 'par levels', 'reorder points', 'expiry evidence'],
      outputs: ['traceable low-stock, overstock and expiry findings'],
      evidence: ['only authorized Inventory records and configured thresholds'],
      authority: 'The deduction preserves its evidence time and never presents an estimate as a physical count.',
      approval: 'Findings are read-only; changing thresholds or stock requires a separate approved command.', status: 'requested',
    },
    {
      id: 'kitchen.inventory.propose-replenishment', label: 'Propose Replenishment', layer: 'compound',
      purpose: 'Turn supported shortages into a draft request for Purchasing.',
      inputs: ['stock-level findings', 'par targets', 'available Purchasing Tools'],
      outputs: ['quantified replenishment proposal with evidence'],
      evidence: ['current count, threshold and optional usage evidence'],
      authority: 'InventoryAI may propose; Purchasing retains supplier, price, order and approval authority.',
      approval: 'The proposal changes nothing. Any purchase uses the Purchasing Tool’s own approval.', status: 'requested',
    },
  ] satisfies KitchenInventoryToolHypothesis[],
  aiContract: {
    inventoryAI: [
      'Own Inventory interpretation, evidence requirements and the Inventory Tool catalogue.',
      'Distinguish physical observations from derived stock estimates and variance.',
      'Use authorized counts, thresholds, expiry and related operational evidence only.',
      'Expose requested Tools as unavailable language until their trusted implementation exists.',
      'Return evidence time, uncertainty and approval requirements with every finding or proposal.',
    ],
    kitchenAI: [
      'Recognise Inventory intent and delegate it to InventoryAI.',
      'Pass current Kitchen orientation and authorized context without copying Inventory expertise.',
      'Discover Inventory Tool availability through InventoryAI registration.',
      'Present findings and preserve the Purchasing boundary for replenishment actions.',
    ],
    activation: [
      'Canonical count sessions and observations exist.',
      'Trusted readers or commands implement the Tool contracts.',
      'Count units and item relationships are validated.',
      'The Tools are registered with real availability and approval policies.',
      'Authorization, UI, audit behaviour and verification are complete.',
    ],
  },
  conclusion: 'Inventory is the Kitchen capability for countable stock evidence. It records physical observations and derives bounded findings; Receiving, Waste, Purchasing and Finance retain their own records and actions.',
} as const
