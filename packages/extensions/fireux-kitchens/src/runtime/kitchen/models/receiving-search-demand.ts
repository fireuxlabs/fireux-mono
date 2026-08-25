export type KitchenReceivingToolHypothesis = {
  id: `kitchen.receiving.${string}`
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

export const kitchenReceivingSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do when Receiving deliveries?',
  method: 'Current search results establish operator language. Independent food-service and food-safety guidance validates the work without being treated as universal legal advice or proof of current Misebox behaviour.',
  seeds: [
    { seed: 'restaurant receiving', queries: ['restaurant receiving checklist', 'restaurant receiving procedures', 'restaurant delivery inspection', 'restaurant receiving software'] },
    { seed: 'food delivery receiving', queries: ['food delivery receiving log', 'food delivery receiving checklist', 'food receiving inspection form', 'goods received note restaurant'] },
    { seed: 'receiving temperature', queries: ['receiving temperature log', 'food delivery temperature log', 'restaurant delivery temperature check', 'HACCP receiving log'] },
    { seed: 'purchase order receiving', queries: ['purchase order receiving', 'delivery discrepancy log', 'restaurant invoice delivery reconciliation', 'supplier delivery rejection form'] },
  ],
  clusters: [
    { id: 'identify', title: 'Identify the delivery and expected order', operatorJob: 'Connect Supplier, delivery time, paperwork and purchase order before inspecting goods.', evidenceQueries: ['purchase order receiving', 'food delivery receiving log'], interpretation: 'An expected order is useful evidence, but Receiving must also handle an authorized unplanned delivery explicitly.' },
    { id: 'quantity', title: 'Check what actually arrived', operatorJob: 'Compare delivered products, packs, quantities and weights with ordered lines.', evidenceQueries: ['delivery discrepancy log', 'restaurant delivery inspection'], interpretation: 'Ordered, delivered and accepted quantities are distinct facts and must not overwrite one another.' },
    { id: 'condition', title: 'Inspect safety, quality and traceability', operatorJob: 'Record temperature, packaging, date, lot, label, vehicle and product-condition evidence where relevant.', evidenceQueries: ['receiving temperature log', 'food receiving inspection form', 'HACCP receiving log'], interpretation: 'Applicable limits depend on product, jurisdiction and Kitchen policy; the system must preserve the rule source used for a decision.' },
    { id: 'decision', title: 'Accept, reject or hold each line', operatorJob: 'Make an explicit disposition and record the reason and corrective action for exceptions.', evidenceQueries: ['supplier delivery rejection form', 'food delivery receiving checklist'], interpretation: 'A failed check does not automatically imply one universal response; the authorized operator records the actual decision.' },
    { id: 'reconcile', title: 'Create trusted downstream evidence', operatorJob: 'Close receiving against the order and send only accepted quantities into Inventory.', evidenceQueries: ['goods received note restaurant', 'restaurant invoice delivery reconciliation'], interpretation: 'Receiving supplies facts for Inventory and later invoice reconciliation; it does not own payment or retroactively rewrite the purchase order.' },
  ],
  validationSources: [
    { label: 'WebstaurantStore receiving procedures', url: 'https://www.webstaurantstore.com/article/858/restaurant-receiving-procedures.html', note: 'Validates vehicle and product inspection, delivery temperatures, rejection and receiving reports.' },
    { label: 'StateFoodSafety receiving temperature log', url: 'https://www.statefoodsafety.com/Resources/Resources/receiving-temperature-log', note: 'Validates actor-stamped receiving temperatures and preventing temperature-abused food from being accepted.' },
    { label: 'Canadian Food Inspection Agency traceability inspection guidance', url: 'https://inspection.canada.ca/en/inspection-and-enforcement/guidance-food-activities/preventive-control-inspection/traceability-inspection', note: 'Validates integrity, damage, spoilage, contamination, temperature and receiving traceability as bounded control concerns.' },
  ],
  records: [
  {
    id: 'kitchen.receiving.receipt',
    label: 'Receiving record',
    kind: 'owned',
    status: 'requested',
    owner: 'Receiving',
    authority: 'Receipt records what physically arrived against a referenced commitment and preserves each line disposition.',
    facts: [
      'Supplier delivery and purchase reference',
      'delivered quantities and units',
      'inspection observations',
      'accept, reject or hold disposition',
      'actor, time and completion'
    ],
    readBy: [ 'kitchen.receiving.inspect-lines', 'kitchen.receiving.review-discrepancies', 'kitchen.receiving.complete-receipt' ],
    writtenBy: [ 'kitchen.receiving.open-delivery', 'kitchen.receiving.inspect-lines', 'kitchen.receiving.complete-receipt' ]
  },
  {
    id: 'kitchen.receiving.inventory-movement',
    label: 'Accepted Inventory movement',
    kind: 'reference',
    status: 'requested',
    owner: 'Inventory',
    authority: 'Only explicitly accepted receipt quantities may be handed to Inventory through its trusted command.',
    facts: [ 'accepted item and quantity', 'compatible unit', 'receipt and line identity', 'actor and occurrence time' ],
    readBy: [ 'kitchen.receiving.complete-receipt' ],
    writtenBy: []
  }
],
  recordQuestions: [
    'Which Supplier, delivery, purchase order and paperwork identify this receipt?',
    'What product, pack, quantity and weight were ordered, delivered and accepted?',
    'Which temperature, packaging, date, lot, label and condition checks apply?',
    'Which policy or jurisdiction-specific limit supports each evaluated check?',
    'Was each line accepted, rejected or held, by whom, when and why?',
    'What corrective action, Supplier communication or replacement is required?',
    'Which accepted quantities may become Inventory evidence?',
  ],
  toolHypotheses: [
    { id: 'kitchen.receiving.open-delivery', label: 'Open Delivery Inspection', layer: 'human', purpose: 'Start one receipt against an expected order or explicitly identified unplanned delivery.', inputs: ['Supplier', 'delivery time', 'purchase order or unplanned-delivery reason', 'paperwork references'], outputs: ['actor-stamped open Receiving record'], evidence: ['authorized Supplier and purchase-order facts'], authority: 'A trusted command verifies Kitchen authority without changing the purchase order.', approval: 'The receiver explicitly opens the inspection.', status: 'requested' },
    { id: 'kitchen.receiving.inspect-lines', label: 'Inspect Delivery Lines', layer: 'human', purpose: 'Record delivered quantities, condition, temperature and traceability evidence line by line.', inputs: ['open receipt', 'delivered products and quantities', 'applicable checks and readings'], outputs: ['immutable inspection observations'], evidence: ['purchase-order lines', 'measured readings', 'photos or documents when supplied'], authority: 'The command validates units and stamps the observing actor and time.', approval: 'The receiver submits observed facts; no acceptance is inferred.', status: 'requested' },
    { id: 'kitchen.receiving.review-discrepancies', label: 'Review Delivery Discrepancies', layer: 'ai-assisted', purpose: 'Compare ordered, delivered and inspected evidence and identify unresolved differences.', inputs: ['purchase order', 'inspection observations', 'applicable acceptance policy'], outputs: ['traceable discrepancy findings and unknowns'], evidence: ['only recorded order and inspection facts'], authority: 'ReceivingAI may interpret evidence but cannot select a disposition or invent a policy.', approval: 'Review is read-only; decisions remain explicit operator actions.', status: 'requested' },
    { id: 'kitchen.receiving.complete-receipt', label: 'Complete Receipt', layer: 'compound', purpose: 'Record final line dispositions and project accepted quantities to downstream Inventory evidence.', inputs: ['reviewed receipt', 'accept, reject or hold decisions', 'corrective actions'], outputs: ['completed Receiving record', 'accepted Inventory movements', 'unresolved follow-ups'], evidence: ['actor-stamped decisions and supporting inspections'], authority: 'Only accepted quantities may cross the trusted Inventory command boundary.', approval: 'An authorized receiver confirms every disposition before completion.', status: 'requested' },
  ] satisfies KitchenReceivingToolHypothesis[],
  aiContract: {
    receivingAI: ['Own Receiving interpretation, evidence requirements and its Tool catalogue.', 'Keep ordered, delivered, inspected and accepted facts distinct.', 'Apply only an identified policy or rule source and state uncertainty.', 'Never accept goods or update Inventory without an approved disposition.', 'Expose requested Tools as unavailable until trusted implementations exist.'],
    kitchenAI: ['Recognise Receiving intent and delegate it to ReceivingAI.', 'Pass current Kitchen orientation and authorized context without copying Receiving expertise.', 'Discover Tool availability through ReceivingAI registration.', 'Present discrepancies and preserve approval before disposition or Inventory projection.'],
    activation: ['Canonical Receiving records and line observations exist.', 'Trusted readers and commands implement the contracts.', 'Units, policies, instruments and traceability fields are validated.', 'The Inventory projection accepts only finalized quantities.', 'Authorization, approval, audit behaviour, UI and verification are complete.'],
  },
  conclusion: 'Receiving is the evidence gate between a purchase commitment and stock on hand. It records what arrived and the disposition of each line; only accepted quantities may become Inventory evidence.',
} as const
