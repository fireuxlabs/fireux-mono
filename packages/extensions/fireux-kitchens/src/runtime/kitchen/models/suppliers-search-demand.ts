export type KitchenSuppliersToolHypothesis = { id: `kitchen.suppliers.${string}`; label: string; layer: 'human' | 'ai-assisted' | 'compound'; purpose: string; inputs: readonly string[]; outputs: readonly string[]; evidence: readonly string[]; authority: string; approval: string; status: 'requested' }

export const kitchenSuppliersSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do with Suppliers?',
  method: 'Current search results establish operator language. Independent food-service and supplier-management literature validates the jobs. The analysis preserves Supplier, Kitchen, Purchasing and Receiving ownership.',
  seeds: [
    { seed: 'restaurant supplier management', queries: ['restaurant supplier management software', 'restaurant vendor management', 'restaurant supplier database', 'approved restaurant supplier list'] },
    { seed: 'food supplier catalogue', queries: ['restaurant supplier catalogue', 'food supplier price list', 'restaurant vendor product catalogue', 'supplier pack size pricing'] },
    { seed: 'supplier price comparison', queries: ['compare restaurant supplier prices', 'restaurant vendor price comparison', 'food procurement price comparison', 'ingredient supplier pricing'] },
    { seed: 'supplier performance', queries: ['restaurant supplier performance', 'vendor delivery reliability restaurant', 'food supplier compliance tracking', 'restaurant supplier scorecard'] },
  ],
  clusters: [
    { id: 'connect', title: 'Maintain a trusted Kitchen Supplier list', operatorJob: 'Connect the Kitchen to Supplier identities it may source from and record local relationship facts.', evidenceQueries: ['restaurant supplier database', 'approved restaurant supplier list'], interpretation: 'Supplier identity remains Supplier-owned. The Kitchen connection stores preference, account reference, delivery pattern or approval state without copying the company profile.' },
    { id: 'catalogue', title: 'Understand what each Supplier offers', operatorJob: 'Inspect current products, Ingredient relationships, SKUs, pack sizes, availability and quoted prices.', evidenceQueries: ['restaurant supplier catalogue', 'supplier pack size pricing'], interpretation: 'Supplier owns its offer. The Kitchen may map that offer to its Ingredient or Product without rewriting Supplier facts.' },
    { id: 'compare', title: 'Compare compatible supply options', operatorJob: 'Compare the same requirement across offers while preserving pack, unit, currency, availability and quote time.', evidenceQueries: ['compare restaurant supplier prices', 'ingredient supplier pricing'], interpretation: 'A lower displayed price is not necessarily a comparable or selectable offer. Purchasing owns the eventual selection and commitment.' },
    { id: 'requirements', title: 'Track relationship and compliance requirements', operatorJob: 'Know which documents, certifications, lead times, minimums or ordering constraints matter to the Kitchen.', evidenceQueries: ['food supplier compliance tracking', 'restaurant vendor management'], interpretation: 'Requirements and documents need source and expiry evidence; generic search literature is not proof a Supplier is approved.' },
    { id: 'performance', title: 'Review evidenced Supplier performance', operatorJob: 'Use real orders, receipts, rejections and discrepancies to understand reliability and quality.', evidenceQueries: ['restaurant supplier performance', 'restaurant supplier scorecard'], interpretation: 'Supplier performance is a deduction from Purchasing and Receiving evidence, not a manually asserted universal rating.' },
  ],
  validationSources: [
    { label: 'UK Food Standards Agency Safer Food Better Business supplier list', url: 'https://www.food.gov.uk/sites/default/files/media/document/sfbb-caterers-pack-fixed_0_3.pdf', note: 'Validates Supplier contact, supplied goods, delivery days and lead-time information as practical Kitchen records.' },
    { label: 'Smartsheet vendor-list and price-list templates', url: 'https://www.smartsheet.com/free-vendor-templates', note: 'Validates approved Supplier lists, contact details, price lists and comparison by purchase quantity.' },
    { label: 'DineOpen restaurant Supplier management', url: 'https://www.dineopen.com/products/inventory/suppliers', note: 'Validates current market language around multi-Supplier item links, pack-aware comparison and performance evidence.' },
  ],
  records: [
  {
    id: 'kitchen.suppliers.connection',
    label: 'Kitchen Supplier connection',
    kind: 'owned',
    status: 'partial',
    owner: 'Kitchen Suppliers',
    authority: 'The Kitchen-owned relationship references canonical Supplier identity and stores only Kitchen-local relationship state.',
    facts: [
      'Kitchen and Supplier identities',
      'relationship state and preference',
      'account or delivery context',
      'approval and audit evidence'
    ],
    readBy: [ 'kitchen.suppliers.compare-prices', 'kitchen.suppliers.prepare-order', 'kitchen.suppliers.receive-delivery' ],
    writtenBy: [ 'kitchen.suppliers.connect-supplier' ]
  },
  {
    id: 'kitchen.suppliers.offer',
    label: 'Supplier offer',
    kind: 'reference',
    status: 'partial',
    owner: 'Supplier',
    authority: 'Supplier owns its item and offer facts; the Kitchen may map and compare compatible offers without copying them.',
    facts: [ 'Supplier item or SKU', 'pack and unit', 'availability, price and currency', 'quote time, lead time and terms' ],
    readBy: [ 'kitchen.suppliers.compare-prices', 'kitchen.suppliers.prepare-order', 'kitchen.suppliers.receive-delivery' ],
    writtenBy: []
  }
],
  recordQuestions: ['Which canonical Supplier identity is connected to this Kitchen?', 'Which relationship facts belong to the Kitchen rather than the Supplier profile?', 'Which SupplierItem or catalogue offer maps to which Ingredient or Product?', 'What pack, unit, availability, price, currency and quote time make an offer comparable?', 'Which minimum, lead time, delivery schedule, account or compliance requirement applies?', 'Which Purchasing and Receiving records support a reliability or quality deduction?', 'Is the connection active, preferred, restricted or retired, and who approved that state?'],
  toolHypotheses: [
    { id: 'kitchen.suppliers.connect-supplier', label: 'Connect Supplier', layer: 'human', purpose: 'Connect one canonical Supplier identity to the Kitchen.', inputs: ['Supplier identity', 'Kitchen relationship details', 'approval state'], outputs: ['Kitchen-owned Supplier connection'], evidence: ['canonical Supplier and current Kitchen'], authority: 'The command may reference but never copy or mutate Supplier-owned identity.', approval: 'An authorized operator explicitly confirms the connection.', status: 'requested' },
    { id: 'kitchen.suppliers.compare-prices', label: 'Compare Supplier Offers', layer: 'ai-assisted', purpose: 'Compare compatible current offers for one Kitchen requirement.', inputs: ['Ingredient or Product requirement', 'authorized Supplier offers'], outputs: ['traceable comparison, incompatibilities and unknowns'], evidence: ['SKU, pack, unit, availability, quote time, price and currency'], authority: 'The Tool never invents unit conversion, equivalence or a missing quote.', approval: 'Comparison is read-only; Purchasing owns offer selection.', status: 'requested' },
    { id: 'kitchen.suppliers.prepare-order', label: 'Prepare Purchasing Handoff', layer: 'compound', purpose: 'Hand a selected Supplier option and requirement to Purchasing as a draft input.', inputs: ['confirmed requirement', 'selected offer', 'available Purchasing Tools'], outputs: ['evidenced Purchasing proposal'], evidence: ['Kitchen Supplier connection and selected offer'], authority: 'This Tool cannot create or send a purchase order itself.', approval: 'The operator confirms the handoff; Purchasing applies its own approvals.', status: 'requested' },
    { id: 'kitchen.suppliers.receive-delivery', label: 'Open Receiving Handoff', layer: 'compound', purpose: 'Open the relevant Receiving context for an arriving Supplier delivery.', inputs: ['Supplier connection', 'purchase order or delivery identity', 'available Receiving Tools'], outputs: ['Receiving proposal with references'], evidence: ['Supplier, order and delivery identifiers'], authority: 'This Tool cannot accept goods or update Inventory.', approval: 'Receiving owns every inspection and disposition approval.', status: 'requested' },
  ] satisfies KitchenSuppliersToolHypothesis[],
  aiContract: {
    suppliersAI: ['Own Kitchen-side Supplier interpretation, connection evidence and its Tool catalogue.', 'Keep canonical Supplier identity and offers Supplier-owned.', 'Compare only compatible, current, authorized offer evidence.', 'Delegate commitments to Purchasing and delivery decisions to Receiving.', 'Expose all current capability Tools as requested until trusted registration is complete.'],
    kitchenAI: ['Recognise Supplier intent and delegate it to KitchenSuppliersAI.', 'Pass selected Kitchen and authorized context without copying Supplier expertise.', 'Discover real Tool availability through KitchenSuppliersAI registration.', 'Preserve Supplier, Purchasing and Receiving authority in every proposal.'],
    activation: ['Canonical Kitchen-to-Supplier connection storage is confirmed.', 'Trusted readers expose Supplier identities and offers without copying authority.', 'Commands implement connection and handoff contracts.', 'Tool registration reports truthful availability.', 'Authorization, approval, audit behaviour, UI and verification are complete.'],
  },
  conclusion: 'Suppliers owns the Kitchen’s view of its supply relationships and options. Supplier owns identity and offers; Purchasing owns commitments; Receiving owns delivered evidence.',
} as const
