export type KitchenOrdersToolHypothesis = { id: `kitchen.orders.${string}`; label: string; layer: 'human' | 'ai-assisted' | 'compound'; purpose: string; inputs: readonly string[]; outputs: readonly string[]; evidence: readonly string[]; authority: string; approval: string; status: 'requested' }

export const kitchenOrdersSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do with Orders and Service?',
  method: 'Current search results establish operator language. Independent KDS product documentation validates the workflow. Tool status is reconciled with the current Kitchen operation catalogue.',
  seeds: [
    { seed: 'kitchen display system', queries: ['kitchen display system', 'KDS for restaurants', 'restaurant kitchen display software', 'digital kitchen order tickets'] },
    { seed: 'kitchen order management', queries: ['restaurant order management system', 'kitchen order tracking software', 'restaurant order queue system', 'live kitchen order board'] },
    { seed: 'kitchen order routing', queries: ['KDS station routing', 'restaurant order routing by station', 'multi station kitchen display', 'kitchen expo screen'] },
    { seed: 'kitchen ticket times', queries: ['kitchen ticket time tracking', 'restaurant prep time analytics', 'delayed order alerts restaurant', 'kitchen queue prioritization'] },
  ],
  clusters: [
    { id: 'intake', title: 'See one trustworthy live order queue', operatorJob: 'Bring authorized Kitchen-facing orders from active channels into one current service view.', evidenceQueries: ['live kitchen order board', 'restaurant order queue system'], interpretation: 'Orders may originate from table, counter, pickup, delivery or room service, but this capability does not own those channel surfaces or payment.' },
    { id: 'clarity', title: 'Preserve exactly what must be prepared', operatorJob: 'Keep items, quantities, modifiers, notes, allergens, course and timing attached to the order.', evidenceQueries: ['digital kitchen order tickets', 'kitchen display system'], interpretation: 'The Kitchen executes the accepted order; it must not silently rewrite customer choices or Menu definitions.' },
    { id: 'route', title: 'Route work to preparation Stations', operatorJob: 'Show each Station the lines it owns while retaining whole-order coordination.', evidenceQueries: ['KDS station routing', 'multi station kitchen display'], interpretation: 'Stations define production ownership; Orders owns the live routing instance and expo coordination.' },
    { id: 'queue', title: 'Prioritise timed service work', operatorJob: 'Order active tickets by fire time, commitment, age and explicit priority while surfacing delays.', evidenceQueries: ['kitchen queue prioritization', 'delayed order alerts restaurant'], interpretation: 'Priority must remain explainable. AI must not reorder service from invented urgency.' },
    { id: 'handoff', title: 'Coordinate completion and handoff', operatorJob: 'Track line progress until the whole order is ready for its configured handoff.', evidenceQueries: ['kitchen expo screen', 'kitchen order tracking software'], interpretation: 'Kitchen readiness is not table service, driver dispatch, payment completion or proof the customer received the order.' },
  ],
  validationSources: [
    { label: 'Oracle Simphony KDS guide', url: 'https://docs.oracle.com/en/industries/food-beverage/simphony/19.6/kdscu/F85300_01.pdf', note: 'Validates a real-time preparation-area order device with status, timers and detailed order views.' },
    { label: 'Square Kitchen Display System', url: 'https://squareup.com/us/en/point-of-sale/restaurants/kitchen-display-system', note: 'Validates viewing, tracking and fulfilling Kitchen orders through digital tickets.' },
    { label: 'Fresh KDS order-management description', url: 'https://www.fresh.technology/', note: 'Validates item/modifier tracking, timers, sorting, prioritisation and multi-Station coordination as current market language.' },
  ],
  records: [
  {
    id: 'kitchen.orders.order',
    label: 'Kitchen Order',
    kind: 'owned',
    status: 'available',
    owner: 'Orders',
    authority: 'Order owns the accepted demand, immutable item snapshots, fulfilment context, pricing snapshot and lifecycle state.',
    facts: [
      'Order and service identity',
      'item snapshots and quantities',
      'fulfilment and requested timing',
      'pricing and payment state',
      'lifecycle transitions and audit stamps'
    ],
    readBy: [
      'kitchen.orders.route-order',
      'kitchen.orders.update-status',
      'kitchen.orders.prioritize-queue',
      'kitchen.orders.review-prep-times'
    ],
    writtenBy: [ 'kitchen.orders.route-order', 'kitchen.orders.update-status' ]
  },
  {
    id: 'kitchen.orders.routing-evidence',
    label: 'Order routing evidence',
    kind: 'reference',
    status: 'partial',
    owner: 'Stations, Recipes, Mise and Team',
    authority: 'Queue and timing deductions compose current operational evidence without changing its owners.',
    facts: [ 'Station mapping', 'Recipe and prep requirements', 'Mise readiness', 'authorized Team responsibility' ],
    readBy: [ 'kitchen.orders.route-order', 'kitchen.orders.prioritize-queue', 'kitchen.orders.review-prep-times' ],
    writtenBy: []
  }
],
  recordQuestions: ['Which Kitchen, service period, source channel and order identity apply?', 'Which items, quantities, modifiers, notes and safety information must remain intact?', 'Which Station owns each line and which dependencies govern whole-order readiness?', 'When was the order accepted, fired, started, completed, ready, handed off or cancelled?', 'Why does the queue place one order before another?', 'Which actor or trusted integration changed each state?', 'Which timestamps can support later performance analysis without rewriting the Order?'],
  toolHypotheses: [
    { id: 'kitchen.orders.route-order', label: 'Route Kitchen Order', layer: 'compound', purpose: 'Project accepted order lines to their responsible preparation Stations.', inputs: ['authorized Order', 'Dish-to-Station rules', 'current Station configuration'], outputs: ['traceable Station work projections and unresolved lines'], evidence: ['Order items and modifiers', 'Dish and Station relationships'], authority: 'Routing cannot alter the accepted commercial Order or guess an unmapped Station.', approval: 'Configured deterministic routing needs no per-line approval; every override is explicit and stamped.', status: 'requested' },
    { id: 'kitchen.orders.update-status', label: 'Update Order Status', layer: 'human', purpose: 'Apply a valid transition to an Order or preparation line.', inputs: ['Order identity', 'current status', 'requested transition'], outputs: ['actor-stamped lifecycle transition'], evidence: ['canonical Order lifecycle rules'], authority: 'A trusted command verifies Kitchen authority and the permitted transition.', approval: 'The operator explicitly performs the transition unless a named trusted integration owns it.', status: 'requested' },
    { id: 'kitchen.orders.prioritize-queue', label: 'Prioritise Kitchen Queue', layer: 'ai-assisted', purpose: 'Produce an explainable service sequence from current commitments and explicit priority.', inputs: ['active Orders', 'fire and promised times', 'explicit priority policy'], outputs: ['ordered queue with reasons, delays and unknowns'], evidence: ['authorized Order timestamps and configured policy'], authority: 'OrdersAI may recommend sequence but may not fabricate urgency or mutate an Order.', approval: 'Read-only sequencing needs no mutation approval; manual overrides are explicit.', status: 'requested' },
    { id: 'kitchen.orders.review-prep-times', label: 'Review Preparation Times', layer: 'ai-assisted', purpose: 'Compare supported lifecycle timing across Orders and Stations.', inputs: ['completed Order transitions', 'period', 'optional Station filter'], outputs: ['traceable duration measures and bottleneck findings'], evidence: ['recorded lifecycle timestamps only'], authority: 'Missing transitions remain missing and are never estimated as observed performance.', approval: 'Analysis is read-only.', status: 'requested' },
  ] satisfies KitchenOrdersToolHypothesis[],
  aiContract: {
    ordersAI: ['Own live Order interpretation, evidence requirements and its Tool catalogue.', 'Preserve accepted order content, lifecycle rules and channel boundaries.', 'Use only authorized current service evidence and explicit priority policy.', 'Never claim ready, handed off or delivered from an earlier state.', 'Expose all current Workspace Tools as requested until trusted registration is complete.'],
    kitchenAI: ['Recognise Order and service intent and delegate it to OrdersAI.', 'Pass selected Kitchen and authorized service context without copying Orders expertise.', 'Discover real Tool availability through OrdersAI registration.', 'Present queue reasoning and preserve authority for every state mutation.'],
    activation: ['Trusted Workspace readers expose the canonical live queue.', 'Commands implement routing and lifecycle contracts end to end.', 'Station mappings and priority policy are explicit.', 'Tool registration reports truthful availability and integration ownership.', 'Authorization, approval, audit behaviour, UI and verification are complete.'],
  },
  conclusion: 'Orders & Service owns the live Kitchen execution queue from accepted demand to Kitchen readiness. Tables, payment, external delivery and customer handoff retain their own boundaries.',
} as const
