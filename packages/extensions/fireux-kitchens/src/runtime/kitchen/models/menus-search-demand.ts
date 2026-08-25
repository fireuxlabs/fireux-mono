export type KitchenMenusToolHypothesis = { id: `kitchen.menus.${string}`; label: string; layer: 'human' | 'ai-assisted' | 'compound'; purpose: string; inputs: readonly string[]; outputs: readonly string[]; evidence: readonly string[]; authority: string; approval: string; status: 'requested' | 'available' }

export const kitchenMenusSearchDemand = {
  observedAt: '2026-08-23', geography: 'English-language web', language: 'English',
  question: 'What are Kitchen operators trying to do when they search for restaurant menu management?',
  method: 'Current search results establish operator language. Product and educational literature validate the jobs. Search claims remain external evidence; they do not define the canonical Menu or prove a Tool exists.',
  seeds: [
    { seed: 'restaurant menu management', queries: ['restaurant menu management software', 'restaurant menu builder', 'manage restaurant menu online', 'restaurant menu update software'] },
    { seed: 'digital and QR menus', queries: ['digital menu for restaurant', 'restaurant QR menu', 'publish restaurant menu online', 'multi location menu management'] },
    { seed: 'menu import', queries: ['restaurant menu import PDF', 'AI menu import restaurant', 'convert restaurant menu to digital menu', 'upload restaurant menu'] },
    { seed: 'menu engineering', queries: ['restaurant menu engineering', 'menu engineering calculator', 'menu item popularity contribution margin', 'restaurant menu profitability analysis'] },
  ],
  clusters: [
    { id: 'compose', title: 'Compose a clear offer', operatorJob: 'Create menus, sections and ordered item placements for a service, channel or audience.', evidenceQueries: ['restaurant menu builder', 'manage restaurant menu online'], interpretation: 'Menu owns composition and presentation. Dish and Drink remain the authoritative sellable-item records.' },
    { id: 'import', title: 'Turn existing material into structured drafts', operatorJob: 'Extract sections, items, descriptions and prices from a document, image or URL without retyping everything.', evidenceQueries: ['restaurant menu import PDF', 'AI menu import restaurant'], interpretation: 'Extraction is a reviewable proposal. It cannot silently create authoritative Dishes, overwrite prices or publish itself.' },
    { id: 'operate', title: 'Keep price and availability current', operatorJob: 'Review which items appear, where they appear, their displayed price and whether they are currently offered.', evidenceQueries: ['restaurant menu update software', 'multi location menu management'], interpretation: 'Menu availability is an offer decision. Inventory may supply evidence but must not silently mutate a published Menu.' },
    { id: 'publish', title: 'Publish one reviewed Menu to useful channels', operatorJob: 'Make the approved Menu available on the web, through a stable link or QR code, and later through supported ordering channels.', evidenceQueries: ['digital menu for restaurant', 'restaurant QR menu'], interpretation: 'Publishing projects a reviewed Menu. QR is a doorway to that publication, not a separate Menu record or capability.' },
    { id: 'engineer', title: 'Review commercial performance', operatorJob: 'Compare item popularity and contribution margin to support an accountable Menu decision.', evidenceQueries: ['restaurant menu engineering', 'menu item popularity contribution margin'], interpretation: 'Engineering requires authoritative sales and cost evidence. Missing cost or sales data stays visibly unknown rather than becoming an estimate presented as fact.' },
  ],
  validationSources: [
    { label: 'Digmenu digital Menu product description', url: 'https://www.digmenu.app/', note: 'Validates current demand language around structured menus, rapid updates, QR publishing, import with review, availability and guest presentation.' },
    { label: 'Otter restaurant Menu management', url: 'https://www.tryotter.com/products/menu-management', note: 'Validates operator demand for managing item availability and distributing Menu changes across supported channels.' },
    { label: 'Basic Kitchen and Food Service Management', url: 'https://opentextbc.ca/basickitchenandfoodservicemanagement/chapter/menu-engineering/', note: 'Validates popularity and contribution margin as the evidence axes used by conventional Menu engineering.' },
  ],
  records: [
  {
    id: 'kitchen.menus.menu',
    label: 'Kitchen Menu',
    kind: 'owned',
    status: 'available',
    owner: 'Menus',
    authority: 'Menu owns offer identity, content structure, placements, displayed prices and publication configuration.',
    facts: [
      'Menu identity and role',
      'sections and item placements',
      'captured prices and availability',
      'publication state and source'
    ],
    readBy: [ 'kitchen.menus.update-menu', 'kitchen.menus.delete-menu', 'kitchen.menus.engineer-menu', 'kitchen.menus.publish-menu' ],
    writtenBy: [ 'kitchen.menus.create-menu', 'kitchen.menus.update-menu', 'kitchen.menus.delete-menu', 'kitchen.menus.publish-menu' ]
  },
  {
    id: 'kitchen.menus.performance-evidence',
    label: 'Menu performance evidence',
    kind: 'reference',
    status: 'partial',
    owner: 'Dishes, Drinks, Costs and Sales',
    authority: 'Menu engineering reads canonical item, cost and bounded Sales evidence and does not store invented profitability.',
    facts: [ 'Dish and Drink identity', 'supported direct cost', 'KitchenSale quantity and value', 'period and coverage' ],
    readBy: [ 'kitchen.menus.engineer-menu' ],
    writtenBy: []
  }
],
  recordQuestions: ['Which Kitchen owns the Menu and what service, audience or channel is it for?', 'Which version is draft, approved, published, scheduled or retired?', 'Which sections exist and in what order?', 'Which Dish or Drink record does each placement reference?', 'Which displayed name, description, price and availability are Menu-specific presentation choices?', 'Which dietary or allergen statements resolve from authoritative Ingredient, Recipe, Dish or Drink evidence?', 'Which source document or URL produced an imported proposal and what has a human reviewed?', 'Which publication targets use this approved version and when were they updated?', 'Which authoritative sales and cost measures support any engineering conclusion?', 'Which missing evidence or stale publication must remain visible?'],
  toolHypotheses: [
    { id: 'kitchen.menus.create-menu', label: 'Create Menu', layer: 'human', purpose: 'Create a Menu from an uploaded document, image or URL through a reviewable AI-assisted draft.', inputs: ['source document, image or URL', 'Menu name', 'target Kitchen and currency'], outputs: ['source-linked extraction draft', 'confirmed Menu, sections and item records'], evidence: ['original source', 'AI extraction trace', 'operator-reviewed draft'], authority: 'Source capture does not create a Menu. The trusted confirmation command validates the reviewed draft before writing Menu-owned records and referenced Kitchen items.', approval: 'The operator explicitly confirms the reviewed draft before canonical records are created.', status: 'available' },
    { id: 'kitchen.menus.update-menu', label: 'Update Menu', layer: 'human', purpose: 'Update Menu-owned details, sections, placements, presentation and ordering configuration.', inputs: ['current Menu', 'operator-confirmed named changes', 'authorized Dish and Drink references'], outputs: ['actor-stamped Menu changes'], evidence: ['canonical Menu and referenced item identities'], authority: 'Menu commands update Menu-owned composition and presentation without rewriting Dish or Drink records.', approval: 'The operator explicitly submits each change.', status: 'available' },
    { id: 'kitchen.menus.delete-menu', label: 'Delete Menu', layer: 'human', purpose: 'Permanently remove one Menu after reviewing the selected record.', inputs: ['current Menu identity'], outputs: ['confirmed deletion'], evidence: ['canonical Menu and current Kitchen authority'], authority: 'The Menu delete command verifies Kitchen write authority and deletes only the selected Menu.', approval: 'The destructive action requires explicit operator confirmation.', status: 'available' },
    { id: 'kitchen.menus.engineer-menu', label: 'Menu Engineering Calculator', layer: 'ai-assisted', purpose: 'Compare Menu-item popularity and contribution margin from bounded authoritative evidence.', inputs: ['Menu version', 'period', 'KitchenSale measures', 'approved item costs'], outputs: ['source-linked Menu engineering view with unknowns'], evidence: ['authoritative bounded sales and cost records'], authority: 'The Tool never invents cost, profit or sales and does not mutate the Menu from an analysis.', approval: 'Analysis is read-only; accepting a proposed Menu change is separate and explicit.', status: 'requested' },
    { id: 'kitchen.menus.publish-menu', label: 'Menu Publishing', layer: 'compound', purpose: 'Publish an approved Menu version to selected supported destinations.', inputs: ['approved Menu version', 'publication targets', 'effective timing'], outputs: ['publication result, target status and stable doorway'], evidence: ['reviewed Menu and target-specific validation'], authority: 'The Tool publishes a projection and preserves the canonical Menu, target result and prior version.', approval: 'An authorized operator explicitly approves publication or scheduling.', status: 'requested' },
  ] satisfies KitchenMenusToolHypothesis[],
  aiContract: {
    menusAI: ['Own Menu composition, import interpretation, engineering deductions and publication proposals.', 'Resolve Dish, Drink, sales and cost evidence from their owning capabilities.', 'Keep source extraction, canonical records, approved Menu and published projection distinct.', 'Never invent prices, allergens, availability, costs, sales or publication success.', 'Expose Create Menu, Update Menu and Delete Menu as available and preserve the requested status of unimplemented Tools.'],
    kitchenAI: ['Recognise Menu intent and delegate it to MenusAI.', 'Pass selected Kitchen and authorized context without copying Menu expertise.', 'Coordinate explicit handoffs to Dish, Drink, Finance, Inventory and publishing capabilities.', 'Discover real Tool availability through MenusAI registration and preserve approval boundaries.'],
    activation: ['Canonical Menu, section, placement, version and publication records are confirmed.', 'Trusted readers and commands implement the contracts.', 'Dish, Drink, sales, cost and allergen authority boundaries are explicit.', 'Import provenance, review and publication results remain auditable.', 'Tool registration, authorization, approvals, UI and verification are complete.'],
  },
  conclusion: 'Menus owns the reviewed composition and publication of the Kitchen offer. It references authoritative items and evidence from other capabilities; it does not absorb those records or promise commercial conclusions that current sales and cost evidence cannot support.',
} as const
