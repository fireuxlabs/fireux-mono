import type { FireuxMetaOperation } from 'fireux-core/config/app/meta-content'

const kitchenWorkspace = {
  id: 'kitchen',
  name: 'Kitchen workspace',
  to: '/',
} as const

const defineKitchenOperation = <const T extends Omit<FireuxMetaOperation, 'workspace'>>(
  operation: T
) => ({ ...operation, workspace: kitchenWorkspace })

export const kitchenOperations = [
  defineKitchenOperation({
    id: 'kitchen.menus', slug: 'menus', title: 'Menus',
    headline: 'Restaurant Menu Management',
    description: 'Create, structure, publish, and manage Kitchen menus.',
    to: '/workspace/kitchen/menus', group: 'Food & Drink',
    landingQuestion: 'Which Menus need to be structured, reviewed, or published?',
    icon: 'i-lucide-book-open',
    keywords: ['restaurant menu management software', 'digital menu builder', 'restaurant menu engineering', 'online restaurant menu maker', 'restaurant menu profitability analysis'],
    guidingLiterature: {
      summary: 'Menu searches span creation, digital publication, importing existing documents, and menu engineering. Operators need to structure sections and items once, review the result, and publish it through the required ordering or display surface.',
      needs: ['Create or import Menu sections and connect Dishes and Drinks.', 'Review prices, availability, descriptions, images, and ordering choices.', 'Publish current Menus to web, QR, kiosk, collection, or pre-order surfaces.', 'Compare popularity and contribution margin when sales evidence exists.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.dishes', slug: 'dishes', title: 'Dishes',
    headline: 'Restaurant Dish Management',
    description: 'Create and manage dishes used across Kitchen menus and recipes.',
    to: '/workspace/kitchen/dishes', group: 'Food & Drink',
    landingQuestion: 'Which Dishes need their specification or price reviewed?',
    icon: 'i-lucide-utensils',
    keywords: ['restaurant dish management software', 'menu item costing software', 'food cost per dish calculator', 'most profitable restaurant dishes', 'menu item profitability analysis'],
    guidingLiterature: {
      summary: 'Dish management connects what is sold with its specification, price, recipe, cost, and sales evidence.',
      needs: ['Create and maintain consistent Dish specifications.', 'Calculate cost per Dish from Recipes and Ingredients.', 'Compare selling price, cost, popularity, and contribution margin.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.drinks', slug: 'drinks', title: 'Drinks',
    headline: 'Beverage Management',
    description: 'Create and manage drinks used across Kitchen menus.',
    to: '/workspace/kitchen/drinks', group: 'Food & Drink',
    landingQuestion: 'Which Drinks need their recipe, price, or availability reviewed?',
    icon: 'i-lucide-glass-water',
    keywords: ['bar inventory management software', 'beverage inventory software', 'drink costing calculator', 'cocktail recipe costing software', 'beverage menu management'],
    guidingLiterature: {
      summary: 'Beverage demand connects Drink definition, recipes, costing, stock, ordering, and published availability.',
      needs: ['Maintain Drink names, prices, images, recipes, and availability.', 'Count beverage stock and prepare replenishment from par levels.', 'Calculate Drink cost and review pricing.', 'Publish an accurate digital Drink list.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.recipes', slug: 'recipes', title: 'Recipes',
    headline: 'Restaurant Recipe Management',
    description: 'Create and manage Kitchen recipes, yields, and cost evidence.',
    to: '/workspace/kitchen/recipes', group: 'Food & Drink',
    landingQuestion: 'Which Recipes need their ingredients, method, or yield reviewed?',
    icon: 'i-lucide-notebook-tabs',
    keywords: ['restaurant recipe management software', 'recipe costing software', 'food cost calculator for recipes', 'commercial kitchen recipe software', 'recipe scaling software'],
    guidingLiterature: {
      summary: 'Recipe searches connect standardisation with costing and scaling through Ingredients, quantities, methods, yields, and portions.',
      needs: ['Create repeatable Recipes with Ingredients, quantities, methods, and yields.', 'Scale quantities to a required batch or portion count.', 'Calculate Recipe cost from authoritative Ingredient prices.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.ingredients', slug: 'ingredients', title: 'Ingredients',
    headline: 'Kitchen Ingredient Management',
    description: 'Maintain the ingredients used by this Kitchen.',
    to: '/workspace/kitchen/ingredients', group: 'Food & Drink',
    landingQuestion: 'Which Ingredients are used by the Kitchen today?',
    icon: 'i-lucide-carrot',
    keywords: ['ingredient management software', 'restaurant ingredient database', 'ingredient allergen information', 'recipe ingredient management', 'ingredient price tracking'],
    guidingLiterature: {
      summary: 'Ingredient identity connects allergen knowledge, Recipes, Dishes, purchasing, stock counts, and cost evidence.',
      needs: ['Maintain Ingredient identity, units, allergens, and supplier relationships.', 'Connect Ingredients to Recipes and Dishes.', 'Use authoritative prices before calculating cost.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.food-safety', slug: 'food-safety', title: 'Food Safety',
    headline: 'Restaurant Food Safety and HACCP',
    description: 'Run and evidence the controls that keep Kitchen food safe.',
    to: '/workspace/kitchen/food-safety', group: 'Operations',
    landingQuestion: 'Which food-safety controls need attention today?',
    icon: 'i-lucide-shield-check',
    keywords: ['restaurant haccp plan', 'restaurant food safety checklist', 'restaurant temperature log', 'restaurant allergen sheet', 'restaurant cleaning checklist'],
    guidingLiterature: {
      summary: 'Food-safety demand spans HACCP plans, temperature records, allergens, cleaning checks, corrective actions, and inspection evidence.',
      needs: ['Maintain the Kitchen food-safety plan and recurring controls.', 'Record checks and corrective actions with accountable evidence.', 'Review current evidence without presenting generic guidance as local legal advice.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.orders', slug: 'orders', title: 'Orders & Service',
    headline: 'Kitchen Order and Service Management',
    description: 'Run the live Kitchen order board and service queue.',
    to: '/workspace/kitchen/orders', group: 'Operations',
    landingQuestion: 'Which Orders are waiting, in preparation, or ready for service?',
    icon: 'i-lucide-receipt-text',
    keywords: ['kitchen display system', 'restaurant order management system', 'kitchen order tracking software', 'restaurant order queue system', 'KDS for restaurants'],
    guidingLiterature: {
      summary: 'Order-management demand is live coordination: receiving Orders, routing lines, prioritising the queue, and recording preparation progress.',
      needs: ['Show one current service queue with clear timing and status.', 'Route ordered items to the responsible Station.', 'Surface delayed or blocked Orders without taking ownership of Tables or payment.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.inventory', slug: 'inventory', title: 'Inventory',
    headline: 'Restaurant Inventory and Stocktake',
    description: 'Count and understand what the Kitchen has on hand.',
    to: '/workspace/kitchen/inventory', group: 'Operations',
    landingQuestion: 'Which stock counts, levels, or variances need review?',
    icon: 'i-lucide-boxes',
    keywords: ['restaurant inventory management software', 'restaurant stocktake app', 'food inventory spreadsheet', 'restaurant stock control system', 'restaurant inventory count'],
    guidingLiterature: {
      summary: 'Inventory demand combines stock counts, levels, storage, expiry, variance, and replenishment decisions.',
      needs: ['Record reliable stock counts by storage location.', 'Review par levels, expiry, and stock variance.', 'Connect stock evidence to Ingredients, receiving, usage, and Waste.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.purchasing', slug: 'purchasing', title: 'Purchasing',
    headline: 'Restaurant Purchasing Management',
    description: 'Prepare and control what the Kitchen buys.',
    to: '/workspace/kitchen/purchasing', group: 'Operations',
    landingQuestion: 'What does the Kitchen need to purchase next?',
    icon: 'i-lucide-shopping-cart',
    keywords: ['restaurant purchasing software', 'restaurant purchase order system', 'food procurement software', 'restaurant supplier ordering', 'restaurant purchasing checklist'],
    guidingLiterature: {
      summary: 'Purchasing is the distinct job of deciding what to buy, from whom, at which price, and with which approval.',
      needs: ['Prepare purchase requirements from stock and production evidence.', 'Compare authoritative Supplier offers and pack prices.', 'Record approved orders without treating Supplier identity as purchasing activity.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.receiving', slug: 'receiving', title: 'Receiving',
    headline: 'Restaurant Delivery Receiving',
    description: 'Verify goods arriving at the Kitchen.',
    to: '/workspace/kitchen/receiving', group: 'Operations',
    landingQuestion: 'Which deliveries need to be checked or reconciled?',
    icon: 'i-lucide-package-check',
    keywords: ['restaurant receiving checklist', 'food delivery receiving log', 'restaurant delivery inspection', 'receiving temperature log', 'purchase order receiving'],
    guidingLiterature: {
      summary: 'Receiving joins ordered quantities with delivered condition, traceability, temperatures, discrepancies, and stock evidence.',
      needs: ['Check delivered quantities and condition against the order.', 'Record food-safety and traceability evidence at receipt.', 'Resolve discrepancies before accepted goods update Inventory.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.waste', slug: 'waste', title: 'Waste',
    headline: 'Restaurant Food Waste Management',
    description: 'Record what was wasted, why, and from where.',
    to: '/workspace/kitchen/waste', group: 'Operations',
    landingQuestion: 'What is the Kitchen wasting and why?',
    icon: 'i-lucide-trash-2',
    keywords: ['restaurant food waste app', 'restaurant food waste management', 'restaurant food waste log', 'food waste tracking software', 'restaurant waste report'],
    guidingLiterature: {
      summary: 'Waste demand covers spoilage, preparation loss, overproduction, returned food, reasons, quantities, and defensible cost evidence.',
      needs: ['Record Waste type, quantity, reason, and source.', 'Separate operational Waste from its derived report.', 'Calculate cost only from authoritative Ingredient and Recipe evidence.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.stations', slug: 'stations', title: 'Stations',
    headline: 'Kitchen Station Management',
    description: 'Create and manage Kitchen stations.',
    to: '/workspace/kitchen/stations', group: 'Kitchen Setup',
    landingQuestion: "Which Stations own today's preparation and service?",
    icon: 'i-lucide-layout-grid',
    keywords: ['kitchen station management', 'restaurant kitchen station setup', 'kitchen order routing', 'KDS station setup', 'restaurant station checklist'],
    guidingLiterature: {
      summary: 'Stations connect Dishes, Prep work, live Orders, readiness, and the people responsible for production.',
      needs: ['Define Stations and connect the Dishes they prepare.', 'Route work and Orders to the correct Station.', 'Maintain readiness checks and required Team competencies.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.suppliers', slug: 'suppliers', title: 'Suppliers',
    headline: 'Restaurant Supplier Management',
    description: 'Connect Kitchen suppliers, catalogues, and supply options.',
    to: '/workspace/kitchen/suppliers', group: 'Kitchen Setup',
    landingQuestion: 'Which Suppliers and supply options support the Kitchen?',
    icon: 'i-lucide-truck',
    keywords: ['restaurant supplier management software', 'restaurant procurement software', 'food supplier ordering system', 'restaurant vendor management', 'compare restaurant supplier prices'],
    guidingLiterature: {
      summary: 'Supplier identity and offers support purchasing and receiving without becoming those operational activities.',
      needs: ['Connect trusted Suppliers and their catalogues to the Kitchen.', 'Compare supply options for required Ingredients and products.', 'Keep Supplier identity distinct from purchase and receipt records.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.finance', slug: 'finance', title: 'Sales',
    headline: 'Restaurant Sales Reporting',
    description: 'Review bounded Kitchen sales measures for a selected period.',
    to: '/workspace/kitchen/finance', group: 'Reports',
    landingQuestion: 'What do gross sales and completed Sales show for the selected period?',
    icon: 'i-lucide-chart-column',
    keywords: ['restaurant daily sales report', 'restaurant sales analytics', 'restaurant gross sales report', 'restaurant average sale', 'restaurant sales comparison'],
    guidingLiterature: {
      summary: 'Current Kitchen reporting is limited to authoritative gross sales, completed sales, average sale, and bounded period comparisons.',
      needs: ['Review gross sales, completed sales, and average sale by period.', 'Compare sales periods using the same bounded measures.', 'Do not claim cost, profit, labour, tax, or accounting evidence from Sales alone.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.costs', slug: 'costs', title: 'Costs',
    headline: 'Restaurant Cost Reporting',
    description: 'Review cost evidence only where its operational inputs are authoritative.',
    to: '/workspace/kitchen/costs', group: 'Reports',
    landingQuestion: 'Which supported Kitchen costs can be reviewed?',
    icon: 'i-lucide-calculator',
    keywords: ['restaurant food cost report', 'restaurant cost analysis', 'recipe cost report', 'ingredient cost report', 'restaurant cost percentage'],
    guidingLiterature: {
      summary: 'Cost reporting must be derived from authoritative Recipe quantities, yields, Ingredient prices, and recorded activity; it is not a substitute for accounting.',
      needs: ['Expose only costs supported by current operational records.', 'Show the source and period behind every derived measure.', 'Do not infer profit, labour, tax, or general accounting figures.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.waste-report', slug: 'waste-report', title: 'Waste',
    headline: 'Restaurant Waste Reporting',
    description: 'Summarise recorded Kitchen Waste without replacing its operational record.',
    to: '/workspace/kitchen/waste-report', group: 'Reports',
    landingQuestion: 'What do the recorded Waste reasons and quantities show?',
    icon: 'i-lucide-recycle',
    keywords: ['restaurant waste report', 'food waste analysis', 'kitchen waste percentage', 'food waste cost report', 'restaurant waste dashboard'],
    guidingLiterature: {
      summary: 'Waste reports aggregate recorded Waste by type, reason, source, quantity, and supported cost while the Waste capability remains the authoritative operational producer.',
      needs: ['Summarise only recorded Waste.', 'Separate quantities, reasons, and supported cost.', 'Trace every report measure back to operational evidence.'],
    },
  }),
  defineKitchenOperation({
    id: 'kitchen.performance', slug: 'performance', title: 'Performance',
    headline: 'Kitchen Performance Reporting',
    description: 'Compare supported service and production measures from current records.',
    to: '/workspace/kitchen/performance', group: 'Reports',
    landingQuestion: 'Which supported Kitchen performance measures need attention?',
    icon: 'i-lucide-gauge',
    keywords: ['kitchen performance report', 'restaurant service speed report', 'kitchen ticket time analysis', 'restaurant production report', 'kitchen operations dashboard'],
    guidingLiterature: {
      summary: 'Performance reporting may compare service timing, production, readiness, and completion only when the underlying operational records produce those measures.',
      needs: ['Name the operational producer behind each measure.', 'Compare like periods and definitions.', 'Avoid unsupported productivity, labour, or profit claims.'],
    },
  }),
] satisfies FireuxMetaOperation[]

export type KitchenOperation = (typeof kitchenOperations)[number]
export type KitchenOperationSlug = KitchenOperation['slug']
