export type KitchenOperationToolStatus =
  | 'requested'
  | 'building'
  | 'available'
  | 'agent-ready'

export type KitchenOperationToolCapability = {
  id: `kitchen.${string}.${string}`
  label: string
  description: string
  status: KitchenOperationToolStatus
  requiredRecords: readonly string[]
}

const requested = (
  id: KitchenOperationToolCapability['id'],
  label: string,
  description: string,
  requiredRecords: readonly string[]
): KitchenOperationToolCapability => ({
  id,
  label,
  description,
  status: 'requested',
  requiredRecords,
})

export const kitchenOperationToolCapabilities = {
  dishes: [
    requested(
      'kitchen.dishes.calculate-cost',
      'Dish Cost Calculator',
      'Calculate cost from recipes and ingredients.',
      ['Dish', 'Recipe', 'Ingredient']
    ),
    requested(
      'kitchen.dishes.analyze-profitability',
      'Menu Item Profit Calculator',
      'Compare selling price, cost, and sales.',
      ['Dish', 'KitchenSale']
    ),
    requested(
      'kitchen.dishes.compare-popularity',
      'Dish Popularity Analysis',
      'Compare dish sales for a selected period.',
      ['Dish', 'KitchenSale']
    ),
    requested(
      'kitchen.dishes.update-spec',
      'Dish Specification Management',
      'Update portion, station, components, and assembly.',
      ['Dish']
    ),
  ],
  drinks: [
    requested(
      'kitchen.drinks.track-stock',
      'Beverage Inventory Tracker',
      'Record beverage quantities and stock movement.',
      ['Drink', 'Ingredient']
    ),
    requested(
      'kitchen.drinks.calculate-cost',
      'Drink Cost Calculator',
      'Calculate ingredient cost per drink.',
      ['Drink', 'Recipe', 'Ingredient']
    ),
    requested(
      'kitchen.drinks.manage-recipe',
      'Cocktail Recipe Management',
      'Record ingredients, measures, method, and yield.',
      ['Drink', 'Recipe']
    ),
    requested(
      'kitchen.drinks.review-menu',
      'Beverage Menu Review',
      'Review drink availability, price, and placement.',
      ['Drink', 'Menu']
    ),
  ],
  ingredients: [
    requested(
      'kitchen.ingredients.count-stock',
      'Restaurant Inventory Count',
      'Record current ingredient quantities.',
      ['Ingredient']
    ),
    requested(
      'kitchen.ingredients.set-reorder-level',
      'Reorder Level Management',
      'Record the quantity that triggers replenishment.',
      ['Ingredient']
    ),
    requested(
      'kitchen.ingredients.record-waste',
      'Food Waste Tracker',
      'Record discarded ingredient quantities and reasons.',
      ['Ingredient']
    ),
    requested(
      'kitchen.ingredients.review-usage',
      'Ingredient Usage Analysis',
      'Review where ingredients are used.',
      ['Ingredient', 'Recipe', 'Dish']
    ),
  ],
  menus: [
    requested(
      'kitchen.menus.build-menu',
      'Restaurant Menu Builder',
      'Create sections and connect dishes.',
      ['Menu', 'Dish']
    ),
    requested(
      'kitchen.menus.import-menu',
      'Menu Import Tool',
      'Prepare structured menu records from a document or URL.',
      ['Menu', 'Dish']
    ),
    requested(
      'kitchen.menus.engineer-menu',
      'Menu Engineering Calculator',
      'Compare item popularity and contribution margin.',
      ['Menu', 'Dish', 'KitchenSale']
    ),
    requested(
      'kitchen.menus.publish-menu',
      'Menu Publishing',
      'Make a reviewed menu available publicly.',
      ['Menu']
    ),
  ],
  mise: [
    {
      id: 'kitchen.mise.create-prep-task',
      label: 'Add prep task',
      description: 'Add work to the prep list.',
      status: 'available',
      requiredRecords: ['KitchenMiseTask'],
    },
    {
      id: 'kitchen.mise.update-prep-task',
      label: 'Update prep task',
      description: 'Update the task details.',
      status: 'available',
      requiredRecords: ['KitchenMiseTask'],
    },
    {
      id: 'kitchen.mise.change-prep-status',
      label: 'Change prep status',
      description: 'Move a task through its working states.',
      status: 'available',
      requiredRecords: ['KitchenMiseTask'],
    },
    {
      id: 'kitchen.mise.delete-prep-task',
      label: 'Delete prep task',
      description: 'Permanently remove the task.',
      status: 'available',
      requiredRecords: ['KitchenMiseTask'],
    },
    requested(
      'kitchen.mise.generate-prep-list',
      'Kitchen Prep List Generator',
      'Prepare tasks from service requirements.',
      ['Menu', 'Recipe', 'Ingredient', 'Station']
    ),
    requested(
      'kitchen.mise.calculate-quantities',
      'Prep Quantity Calculator',
      'Calculate preparation quantities for expected demand.',
      ['Recipe', 'Order']
    ),
    requested(
      'kitchen.mise.assign-by-station',
      'Station Prep Assignment',
      'Group and assign preparation work by station.',
      ['KitchenMiseTask', 'Station', 'KitchenTeamMember']
    ),
  ],
  orders: [
    requested(
      'kitchen.orders.route-order',
      'Kitchen Order Routing',
      'Send order lines to their preparation stations.',
      ['Order', 'Dish', 'Station']
    ),
    requested(
      'kitchen.orders.update-status',
      'Order Status Management',
      'Move an order through its service states.',
      ['Order']
    ),
    requested(
      'kitchen.orders.prioritize-queue',
      'Kitchen Order Queue',
      'Order the queue using service timing and commitments.',
      ['Order']
    ),
    requested(
      'kitchen.orders.review-prep-times',
      'Preparation Time Analysis',
      'Compare preparation timing across orders and stations.',
      ['Order', 'Station']
    ),
  ],
  recipes: [
    requested(
      'kitchen.recipes.create-recipe',
      'Recipe Builder',
      'Record ingredients, quantities, method, and yield.',
      ['Recipe', 'Ingredient']
    ),
    requested(
      'kitchen.recipes.scale-recipe',
      'Recipe Scaling Calculator',
      'Recalculate quantities for a required yield.',
      ['Recipe']
    ),
    requested(
      'kitchen.recipes.calculate-cost',
      'Recipe Cost Calculator',
      'Calculate a recipe cost from ingredient prices.',
      ['Recipe', 'Ingredient']
    ),
    requested(
      'kitchen.recipes.manage-yield',
      'Recipe Yield Management',
      'Record batch yield and portion conversion.',
      ['Recipe']
    ),
  ],
  stations: [
    requested(
      'kitchen.stations.create-station',
      'Kitchen Station Setup',
      'Add a Kitchen preparation station.',
      ['Station']
    ),
    requested(
      'kitchen.stations.assign-dishes',
      'Dish Station Assignment',
      'Connect dishes to the station that prepares them.',
      ['Station', 'Dish']
    ),
    requested(
      'kitchen.stations.set-readiness',
      'Kitchen Station Checklist',
      'Record the checks required before service.',
      ['Station']
    ),
    requested(
      'kitchen.stations.set-competencies',
      'Station Competency Management',
      'Record the competencies needed to work a station.',
      ['Station']
    ),
  ],
  suppliers: [
    requested(
      'kitchen.suppliers.connect-supplier',
      'Restaurant Supplier Management',
      'Connect a supplier to the Kitchen.',
      ['Supplier']
    ),
    requested(
      'kitchen.suppliers.compare-prices',
      'Supplier Price Comparison',
      'Compare current prices for required products.',
      ['Supplier', 'Ingredient']
    ),
    requested(
      'kitchen.suppliers.prepare-order',
      'Purchase Order Builder',
      'Prepare required products and quantities for ordering.',
      ['Supplier', 'Ingredient']
    ),
    requested(
      'kitchen.suppliers.receive-delivery',
      'Delivery Receiving',
      'Record received quantities and differences.',
      ['Supplier', 'Ingredient']
    ),
  ],
  tables: [
    requested(
      'kitchen.tables.configure-floor',
      'Restaurant Floor Plan',
      'Arrange tables and their capacities.',
      ['Table']
    ),
    requested(
      'kitchen.tables.update-status',
      'Table Status Management',
      'Record table availability and service state.',
      ['Table']
    ),
    requested(
      'kitchen.tables.assign-table',
      'Table Assignment',
      'Assign a party or order to a table.',
      ['Table', 'Order']
    ),
    requested(
      'kitchen.tables.review-turnover',
      'Table Turnover Analysis',
      'Review occupancy and turn timing.',
      ['Table', 'Order']
    ),
  ],
  finance: [
    requested(
      'kitchen.finance.daily-sales-report',
      'Restaurant Daily Sales Report',
      'Review sales for one service date.',
      ['KitchenSale']
    ),
    requested(
      'kitchen.finance.food-cost-report',
      'Restaurant Food Cost Report',
      'Compare ingredient cost with sales.',
      ['KitchenSale', 'Dish', 'Ingredient']
    ),
    requested(
      'kitchen.finance.calculate-margin',
      'Contribution Margin Calculator',
      'Calculate selling price less item cost.',
      ['KitchenSale', 'Dish']
    ),
    requested(
      'kitchen.finance.compare-periods',
      'Sales Period Comparison',
      'Compare sales measures across two periods.',
      ['KitchenSale']
    ),
  ],
} as const satisfies Record<string, readonly KitchenOperationToolCapability[]>

export type KitchenOperationCapabilitySlug =
  keyof typeof kitchenOperationToolCapabilities
