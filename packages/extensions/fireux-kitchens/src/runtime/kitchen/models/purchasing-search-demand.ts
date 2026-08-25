export type KitchenPurchasingToolHypothesis = {
  id: `kitchen.purchasing.${string}`
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

export const kitchenPurchasingSearchDemand = {
  observedAt: '2026-08-23',
  geography: 'English-language web',
  language: 'English',
  question: 'What are Kitchen operators trying to do with Purchasing?',
  method: 'Current search results establish operator language. Independent templates and food-service guidance validate the underlying work without being treated as proof that Misebox performs it.',
  seeds: [
    { seed: 'restaurant purchasing', queries: ['restaurant purchasing software', 'restaurant purchasing management', 'restaurant purchasing checklist', 'restaurant food procurement software'] },
    { seed: 'restaurant purchase order', queries: ['restaurant purchase order system', 'restaurant purchase order template', 'restaurant food order form', 'restaurant order guide template'] },
    { seed: 'restaurant supplier ordering', queries: ['restaurant supplier ordering software', 'restaurant vendor ordering system', 'compare restaurant supplier prices', 'restaurant vendor price comparison'] },
    { seed: 'food procurement', queries: ['food procurement software', 'restaurant procurement process', 'restaurant purchasing approval', 'restaurant purchase order tracking'] },
  ],
  clusters: [
    { id: 'requirements', title: 'Turn operating needs into purchase requirements', operatorJob: 'Combine supported shortages and planned production needs into quantities to source.', evidenceQueries: ['restaurant purchasing checklist', 'restaurant order guide template'], interpretation: 'Inventory and production evidence may suggest need; Purchasing owns the explicit requisition and its requested date.' },
    { id: 'source', title: 'Choose a suitable Supplier offer', operatorJob: 'Compare products, specifications, pack sizes, availability and authoritative quoted prices.', evidenceQueries: ['compare restaurant supplier prices', 'restaurant vendor price comparison'], interpretation: 'Supplier owns identity and catalogue facts. Purchasing records why a particular offer was selected for this order.' },
    { id: 'order', title: 'Create a reviewable purchase order', operatorJob: 'Specify Supplier, delivery destination, required date, items, quantities, packs and agreed prices.', evidenceQueries: ['restaurant purchase order template', 'restaurant food order form'], interpretation: 'The purchase order is the Kitchen commitment record; a loose shopping list or replenishment suggestion is not yet an order.' },
    { id: 'approve', title: 'Control approval and sending', operatorJob: 'Ensure the right person approves a commitment before it is sent to the Supplier.', evidenceQueries: ['restaurant purchasing approval', 'restaurant purchase order system'], interpretation: 'Drafting, approval and transmission are separate states. AI may prepare a draft but may not silently commit the Kitchen.' },
    { id: 'track', title: 'Track outstanding orders', operatorJob: 'Know what was ordered, from whom, when it is expected and whether it remains open.', evidenceQueries: ['restaurant purchase order tracking', 'restaurant supplier ordering software'], interpretation: 'Purchasing owns the outstanding commitment. Receiving later records what actually arrived and any discrepancy.' },
  ],
  validationSources: [
    { label: 'Shopify restaurant purchase-order template', url: 'https://www.shopify.com/tools/purchase-order-template/restaurant', note: 'Validates Supplier, item, specification, quantity, pack, price and delivery-address information in a restaurant purchase order.' },
    { label: 'Pearson food-service purchasing chapter', url: 'https://www.pearsonhighered.com/assets/samplechapter/0/1/3/4/013474506X.pdf', note: 'Validates product specifications and the separation between purchasing and receiving responsibilities.' },
    { label: 'Nebraska Extension restaurant operations checklist', url: 'https://food.unl.edu/sites/unl.edu.ianr.extension-food/files/media/file/restaurant-editable-checklist.pdf', note: 'Validates creating and retaining purchase orders as restaurant operating records.' },
  ],
  records: [
  {
    id: 'kitchen.purchasing.requirement',
    label: 'Purchase requirement',
    kind: 'owned',
    status: 'requested',
    owner: 'Purchasing',
    authority: 'A requirement records what the Kitchen needs and why without selecting or committing to a Supplier.',
    facts: [ 'Ingredient or Product need', 'quantity, unit and required date', 'source and urgency', 'requester' ],
    readBy: [ 'kitchen.purchasing.compare-offers' ],
    writtenBy: [ 'kitchen.purchasing.prepare-requisition' ]
  },
  {
    id: 'kitchen.purchasing.order',
    label: 'Purchase order',
    kind: 'owned',
    status: 'requested',
    owner: 'Purchasing',
    authority: 'Purchase order owns the reviewed commitment, exact Supplier offer, price, currency, terms, approval and transmission state.',
    facts: [
      'Supplier and offer identity',
      'lines, packs, units and prices',
      'terms and required delivery',
      'approval and transmission evidence'
    ],
    readBy: [ 'kitchen.purchasing.approve-and-send' ],
    writtenBy: [ 'kitchen.purchasing.create-order', 'kitchen.purchasing.approve-and-send' ]
  },
  {
    id: 'kitchen.purchasing.offer',
    label: 'Supplier offer',
    kind: 'reference',
    status: 'partial',
    owner: 'Supplier',
    authority: 'Purchasing compares current Supplier-owned offers but does not rewrite their identity or commercial facts.',
    facts: [ 'SKU and pack', 'unit and availability', 'price, currency and quote time', 'lead time and terms' ],
    readBy: [ 'kitchen.purchasing.compare-offers', 'kitchen.purchasing.create-order' ],
    writtenBy: []
  }
],
  recordQuestions: [
    'Which Kitchen requirement does each requested line satisfy?',
    'Which Supplier and exact offer, specification, pack and unit apply?',
    'What quantity, agreed price, currency, destination and required date were approved?',
    'Is the purchase still a requisition, a draft order, approved, sent, cancelled or closed?',
    'Who drafted, approved and transmitted the commitment, and when?',
    'Which Receiving records later reconcile the ordered and delivered quantities?',
    'Is price authoritative for this order, or merely an unconfirmed catalogue value?',
  ],
  toolHypotheses: [
    {
      id: 'kitchen.purchasing.prepare-requisition', label: 'Prepare Purchase Requisition', layer: 'ai-assisted',
      purpose: 'Turn supported Kitchen requirements into a reviewable list of requested quantities.',
      inputs: ['authorized requirements', 'required dates', 'optional Inventory and production evidence'], outputs: ['draft requisition with evidence and unresolved questions'],
      evidence: ['Inventory findings', 'Mise or production needs', 'operator-entered requirements'], authority: 'The Tool reads only authorized evidence and never promotes a suggestion into an order.',
      approval: 'The operator confirms the requisition before it can feed an order draft.', status: 'requested',
    },
    {
      id: 'kitchen.purchasing.compare-offers', label: 'Compare Supplier Offers', layer: 'ai-assisted',
      purpose: 'Compare compatible Supplier offers for a defined requirement.',
      inputs: ['approved requirement', 'authorized Supplier offers'], outputs: ['traceable comparison with incompatibilities and unknowns'],
      evidence: ['Supplier identity', 'product specification', 'pack', 'availability', 'quoted price and currency'], authority: 'The comparison preserves Supplier-owned facts and never fabricates a missing quote or equivalence.',
      approval: 'Comparison is read-only; selecting an offer requires operator confirmation.', status: 'requested',
    },
    {
      id: 'kitchen.purchasing.create-order', label: 'Create Purchase Order', layer: 'human',
      purpose: 'Create one draft purchase order from confirmed lines and terms.',
      inputs: ['Supplier', 'delivery destination and date', 'confirmed items, packs, quantities and prices'], outputs: ['actor-stamped draft purchase order'],
      evidence: ['approved requirements and selected Supplier offers'], authority: 'A trusted command verifies Kitchen authority and records the draft without sending it.',
      approval: 'The operator explicitly submits the draft; sending remains a separate approval.', status: 'requested',
    },
    {
      id: 'kitchen.purchasing.approve-and-send', label: 'Approve and Send Purchase Order', layer: 'compound',
      purpose: 'Approve a complete order and transmit it through an available Supplier channel.',
      inputs: ['draft purchase order', 'approval identity', 'available delivery channel'], outputs: ['approved commitment', 'transmission result or explicit failure'],
      evidence: ['complete order terms', 'current Supplier destination', 'approval policy'], authority: 'The Tool requires purchase authority and uses only an explicitly registered Supplier communication channel.',
      approval: 'The authorized operator must approve the exact commitment immediately before transmission.', status: 'requested',
    },
  ] satisfies KitchenPurchasingToolHypothesis[],
  aiContract: {
    purchasingAI: [
      'Own Purchasing interpretation, evidence requirements and the Purchasing Tool catalogue.',
      'Distinguish requirement, requisition, draft, approval, transmission and receipt states.',
      'Use only authorized Supplier offers and Kitchen requirements.',
      'Never claim a purchase was placed without a successful approved transmission result.',
      'Expose requested Tools as unavailable language until their trusted implementation exists.',
    ],
    kitchenAI: [
      'Recognise Purchasing intent and delegate it to PurchasingAI.',
      'Pass current Kitchen orientation and authorized context without copying Purchasing expertise.',
      'Discover Purchasing Tool availability through PurchasingAI registration.',
      'Present proposals and preserve explicit approval before any external commitment.',
    ],
    activation: [
      'Canonical requisition and purchase-order records exist.',
      'Trusted readers and commands implement each Tool contract.',
      'Supplier offers, units, currencies and delivery destinations are validated.',
      'A real transmission channel reports success and failure truthfully.',
      'Authorization, approval, audit behaviour, UI and verification are complete.',
    ],
  },
  conclusion: 'Purchasing owns the Kitchen commitment to buy. It begins with explicit requirements and ends with an approved, traceable order; Inventory suggests need, Suppliers provide offers, and Receiving records delivery.',
} as const
