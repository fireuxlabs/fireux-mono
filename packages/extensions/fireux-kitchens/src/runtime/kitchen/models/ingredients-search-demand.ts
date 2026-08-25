export type KitchenIngredientsToolHypothesis = { id: `kitchen.ingredients.${string}`; label: string; layer: 'human' | 'ai-assisted' | 'compound'; purpose: string; inputs: readonly string[]; outputs: readonly string[]; evidence: readonly string[]; authority: string; approval: string; status: 'requested' | 'available' }

export const kitchenIngredientsSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do when they search for Ingredient management?',
  method: 'Current search results establish operator language. Product and educational literature validates the jobs. Search claims do not define canonical Ingredient, Inventory, Waste or commercial evidence and do not prove a Tool exists.',
  seeds: [
    { seed: 'restaurant Ingredient management', queries: ['restaurant ingredient management software', 'ingredient database restaurant', 'restaurant ingredient list management', 'ingredient traceability restaurant'] },
    { seed: 'Ingredient food facts', queries: ['restaurant allergen ingredient database', 'ingredient allergen management software', 'ingredient nutrition database restaurant', 'restaurant dietary ingredient tracking'] },
    { seed: 'Ingredient stock and reorder', queries: ['ingredient inventory restaurant', 'restaurant ingredient stock count', 'ingredient reorder level restaurant', 'restaurant par level calculator ingredients'] },
    { seed: 'Ingredient usage and Waste', queries: ['ingredient usage analysis restaurant', 'where used ingredient report restaurant', 'ingredient waste tracker', 'restaurant ingredient cost history'] },
  ],
  clusters: [
    { id: 'identify', title: 'Maintain one usable Ingredient identity', operatorJob: 'Define the Kitchen Ingredient, its working units, category and links to supplied products without duplicating each supplier SKU.', evidenceQueries: ['restaurant ingredient management software', 'ingredient database restaurant'], interpretation: 'Ingredient is the stable Kitchen concept. Supplier offers and purchased products reference it but keep their commercial identity.' },
    { id: 'facts', title: 'Keep food facts traceable', operatorJob: 'Maintain source-identified allergen, dietary, nutrition or handling facts that Recipes and Dishes can resolve.', evidenceQueries: ['restaurant allergen ingredient database', 'ingredient nutrition database restaurant'], interpretation: 'A fact must identify its source, scope and review state. AI inference or a generic database match is a proposal, not approved Kitchen truth.' },
    { id: 'stock', title: 'Count and replenish Ingredient stock', operatorJob: 'Record observed quantities and define replenishment policy using compatible units and lead-time evidence.', evidenceQueries: ['restaurant ingredient stock count', 'ingredient reorder level restaurant'], interpretation: 'Inventory owns quantities, movements and reorder policy. Ingredients supplies identity and conversions for that work.' },
    { id: 'waste', title: 'Record Ingredient loss', operatorJob: 'Capture discarded Ingredient quantity, reason, source and accountable evidence.', evidenceQueries: ['ingredient waste tracker', 'ingredient usage analysis restaurant'], interpretation: 'Waste owns the loss event. Ingredient provides the subject identity; the event must not be stored twice.' },
    { id: 'usage', title: 'Understand every dependency', operatorJob: 'Find which Recipes, Dishes and Drinks use an Ingredient and what changes would be affected.', evidenceQueries: ['where used ingredient report restaurant', 'restaurant ingredient cost history'], interpretation: 'Usage is a graph traversal over canonical references. It must expose unresolved or stale links rather than infer dependencies from names.' },
  ],
  validationSources: [
    { label: 'Prepsheets Recipe intelligence', url: 'https://prepsheets.com/', note: 'Validates Ingredient identity, supplier price, allergen and unit facts flowing into Recipes, labels, costing, stock and ordering.' },
    { label: 'Restaurant Association reorder point calculator', url: 'https://restaurantassociation.com/resources/tools/reorder-point-calculator', note: 'Validates demand for reorder thresholds derived from demand, lead time and safety stock rather than Ingredient identity alone.' },
    { label: 'Restaurant technology systems chapter', url: 'https://he.kendallhunt.com/sites/default/files/heupload/DeMicco_1e_Ch5.pdf', note: 'Validates Ingredient, Recipe and menu-item records as separate connected foundations for cost and food-information flows.' },
  ],
  records: [
  {
    id: 'kitchen.ingredients.ingredient',
    label: 'Kitchen Ingredient',
    kind: 'owned',
    status: 'available',
    owner: 'Ingredients',
    authority: 'Ingredient owns the Kitchen-local material identity and its supported units and descriptive facts.',
    facts: [ 'stable Ingredient identity', 'name and units', 'reviewed handling or classification facts', 'audit stamps' ],
    readBy: [
      'kitchen.ingredients.count-stock',
      'kitchen.ingredients.set-reorder-level',
      'kitchen.ingredients.record-waste',
      'kitchen.ingredients.review-usage'
    ],
    writtenBy: [ 'kitchen.ingredients.add-ingredient' ]
  },
  {
    id: 'kitchen.ingredients.operational-evidence',
    label: 'Ingredient operational evidence',
    kind: 'reference',
    status: 'partial',
    owner: 'Suppliers, Receiving, Inventory, Recipes and Waste',
    authority: 'Ingredient analysis reads supply, stock, usage and Waste evidence from their owners.',
    facts: [ 'Supplier offers and mappings', 'received acquisition evidence', 'Inventory observations', 'Recipe usage', 'Waste events' ],
    readBy: [
      'kitchen.ingredients.count-stock',
      'kitchen.ingredients.set-reorder-level',
      'kitchen.ingredients.record-waste',
      'kitchen.ingredients.review-usage'
    ],
    writtenBy: []
  }
],
  recordQuestions: ['Which Kitchen Ingredient is this and what stable identity distinguishes it from a supplier product?', 'Which purchase, storage, usage and Recipe units are valid and which conversions are evidenced?', 'Which Supplier offers or received products map to it without becoming Ingredient-owned?', 'Which allergen, dietary, nutrition, origin or handling facts exist, from which source and review state?', 'Which Recipes, Dishes and Drinks reference it?', 'Which effective purchase or receipt evidence supports current price?', 'Which Inventory location and observation supports quantity on hand?', 'Which demand, lead time and safety-stock evidence supports reorder policy?', 'Which Waste events reference the Ingredient?', 'What downstream records would a proposed Ingredient change affect?'],
  toolHypotheses: [
    { id: 'kitchen.ingredients.add-ingredient', label: 'Add Ingredient', layer: 'human', purpose: 'Select an active canonical Ingredient for this Kitchen.', inputs: ['Ingredient identity'], outputs: ['Kitchen Ingredient selection'], evidence: ['canonical Ingredient and current Kitchen'], authority: 'The Tool links the Ingredient without copying or changing its canonical identity.', approval: 'The operator explicitly selects the Ingredient.', status: 'available' },
    { id: 'kitchen.ingredients.count-stock', label: 'Restaurant Inventory Count', layer: 'compound', purpose: 'Use Ingredient identity and units to submit an observed quantity to Inventory.', inputs: ['Ingredient', 'Inventory location', 'observed quantity, unit and time'], outputs: ['Inventory-owned actor-stamped count linked to the Ingredient'], evidence: ['canonical Ingredient and authorized physical observation'], authority: 'Inventory remains quantity authority; the Ingredient record never stores a second stock balance.', approval: 'The operator explicitly submits the observed count.', status: 'requested' },
    { id: 'kitchen.ingredients.set-reorder-level', label: 'Reorder Level Management', layer: 'compound', purpose: 'Create or update Inventory replenishment policy for an Ingredient.', inputs: ['Ingredient', 'location', 'reorder quantity or derivation evidence', 'lead time and safety stock'], outputs: ['Inventory-owned replenishment policy linked to the Ingredient'], evidence: ['demand, Supplier lead time and explicit operator policy'], authority: 'The Tool distinguishes a calculated proposal from approved policy and does not place a Purchase Order.', approval: 'An authorized operator approves the policy values.', status: 'requested' },
    { id: 'kitchen.ingredients.record-waste', label: 'Food Waste Tracker', layer: 'compound', purpose: 'Send an observed Ingredient loss to the Waste capability.', inputs: ['Ingredient', 'quantity and unit', 'reason, source, actor and time'], outputs: ['Waste-owned actor-stamped event linked to the Ingredient'], evidence: ['authorized observation and compatible Ingredient unit'], authority: 'Waste remains event authority; no duplicate loss or automatic stock correction is created.', approval: 'The operator explicitly submits the Waste event and any separate Inventory adjustment.', status: 'requested' },
    { id: 'kitchen.ingredients.review-usage', label: 'Ingredient Usage Analysis', layer: 'ai-assisted', purpose: 'Trace where an Ingredient is used across Recipes, Dishes and Drinks.', inputs: ['Ingredient', 'authorized Recipe, Dish and Drink graphs'], outputs: ['source-linked dependency view and unresolved references'], evidence: ['canonical identifiers and explicit relationships'], authority: 'The Tool does not infer usage from matching names or mutate downstream records.', approval: 'Read-only analysis needs no mutation approval.', status: 'requested' },
  ] satisfies KitchenIngredientsToolHypothesis[],
  aiContract: {
    ingredientsAI: ['Own Ingredient interpretation, units, food-fact provenance and dependency analysis.', 'Resolve Supplier, Purchasing, Receiving, Inventory, Waste, Recipe, Dish and Drink evidence from their owners.', 'Keep canonical Ingredient, external source fact, approved fact, operational event and deduction distinct.', 'Never invent an allergen, conversion, price, stock quantity, reorder policy, Waste event or dependency.', 'Expose Add Ingredient as available and preserve the requested status of unimplemented Tools.'],
    kitchenAI: ['Recognise Ingredient intent and delegate it to IngredientsAI.', 'Pass selected Kitchen and authorized context without copying Ingredient expertise.', 'Coordinate explicit handoffs to InventoryAI, WasteAI, SuppliersAI, RecipesAI and related capabilities.', 'Discover real Tool availability through IngredientsAI registration and preserve approvals.'],
    activation: ['Canonical Ingredient identity, unit and food-fact records are confirmed.', 'Trusted Supplier, receipt, Inventory, Waste, Recipe, Dish and Drink readers exist.', 'Conversions, source provenance and effective commercial evidence rules are explicit.', 'Cross-capability commands preserve ownership, authorization, stamps and approvals.', 'Tool registration, UI and end-to-end verification are complete.'],
  },
  conclusion: 'Ingredients owns stable Kitchen Ingredient identity, working units and reviewed food facts. Stock, replenishment and Waste remain owned by their operational capabilities, while usage analysis traverses explicit Recipe, Dish and Drink references without creating duplicate truth.',
} as const
