// Workspace operation catalogue: only selected-Kitchen work, never baked-in Workspace capabilities.
// Concurrent edit — 2026-07-21 13:07 CEST — Operation detail surfaces: assign root public operation slugs.
import type { FireuxMetaOperation } from 'fireux-core/config/app/meta-content'

const kitchenWorkspace = {
  id: 'kitchen',
  name: 'Kitchen workspace',
  to: '/workspace/kitchen',
} as const

export const kitchenOperations = [
  {
    id: 'kitchen.dishes',
    slug: 'dishes',
    title: 'Dishes',
    headline: 'Restaurant Dish Management',
    description:
      'Create and manage dishes used across kitchen menus and recipes.',
    to: '/workspace/kitchen/dishes',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-utensils',
    keywords: [
      'restaurant dish management software',
      'menu item costing software',
      'food cost per dish calculator',
      'most profitable restaurant dishes',
      'menu item profitability analysis',
    ],
    guidingLiterature: {
      summary:
        'Searches combine Dish management with costing and profitability. Operators need one Dish definition that connects what is sold with its specification, price, recipe, cost, and sales evidence.',
      needs: [
        'Create and maintain consistent Dish specifications.',
        'Calculate cost per Dish from Recipes and Ingredients.',
        'Compare selling price, cost, popularity, and contribution margin.',
      ],
    },
  },
  {
    id: 'kitchen.drinks',
    slug: 'drinks',
    title: 'Drinks',
    headline: 'Beverage Management',
    description: 'Create and manage drinks used across kitchen menus.',
    to: '/workspace/kitchen/drinks',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-glass-water',
    keywords: [
      'bar inventory management software',
      'beverage inventory software',
      'drink costing calculator',
      'cocktail recipe costing software',
      'beverage menu management',
    ],
    guidingLiterature: {
      summary:
        'People search for beverage inventory, Drink costing, recipe consistency, and current digital menus. The useful product connection is Drink definition → recipe and cost → stock and ordering → published availability.',
      needs: [
        'Maintain Drink names, prices, images, recipes, and availability.',
        'Count beverage stock and prepare replenishment from par levels.',
        'Calculate Drink cost and review pricing and profitability.',
        'Publish an accurate digital Drink list and mark unavailable Drinks.',
      ],
    },
  },
  {
    id: 'kitchen.ingredients',
    slug: 'ingredients',
    title: 'Ingredients',
    headline: 'Restaurant Inventory Management',
    description: 'Create and manage the ingredients used by this kitchen.',
    to: '/workspace/kitchen/ingredients',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-carrot',
    keywords: [
      'restaurant inventory management software',
      'ingredient inventory management',
      'food stock control software',
      'restaurant waste tracking software',
      'restaurant inventory app',
    ],
    guidingLiterature: {
      summary:
        'Ingredient searches focus on knowing what is held, what it costs, where it is used, when to reorder, and what is wasted. Ingredient identity is the shared input for Recipes, purchasing, stock counts, and cost reporting.',
      needs: [
        'Maintain Ingredient identity, units, prices, and supplier relationships.',
        'Record stock counts, reorder levels, movements, and waste.',
        'Trace Ingredient usage through Recipes and Dishes.',
      ],
    },
  },
  {
    id: 'kitchen.menus',
    slug: 'menus',
    title: 'Menus',
    headline: 'Restaurant Menu Management',
    description: 'Create, structure, publish, and manage kitchen menus.',
    to: '/workspace/kitchen/menus',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-book-open',
    keywords: [
      'restaurant menu management software',
      'digital menu builder',
      'restaurant menu engineering',
      'online restaurant menu maker',
      'restaurant menu profitability analysis',
    ],
    guidingLiterature: {
      summary:
        'Menu searches span creation, digital publication, importing existing documents, and menu engineering. Operators need to structure sections and items once, review the result, and publish it through the required ordering or display surface.',
      needs: [
        'Create or import Menu sections and connect Dishes and Drinks.',
        'Review prices, availability, descriptions, images, and ordering choices.',
        'Publish current Menus to web, QR, kiosk, collection, or pre-order surfaces.',
        'Compare popularity and contribution margin when sales evidence exists.',
      ],
    },
  },
  {
    id: 'kitchen.mise',
    slug: 'mise',
    title: 'Mise',
    headline: 'Kitchen Prep Management',
    description: 'Plan and track kitchen preparation work.',
    to: '/workspace/kitchen/mise',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-list-checks',
    keywords: [
      'restaurant prep list app',
      'kitchen prep management software',
      'digital kitchen prep list',
      'restaurant task management software',
      'mise en place checklist',
    ],
    guidingLiterature: {
      summary:
        'Prep searches ask for a usable list of work before service: what to prepare, how much, when it is due, which station owns it, and whether it is complete.',
      needs: [
        'Create, update, complete, and remove Prep tasks.',
        'Generate required work from Menus, Recipes, expected demand, and Orders.',
        'Calculate quantities and group work by Station and assignee.',
      ],
    },
  },
  {
    id: 'kitchen.orders',
    slug: 'orders',
    title: 'Orders',
    headline: 'Restaurant Order Management',
    description: 'Run the live kitchen order board and service queue.',
    to: '/workspace/kitchen/orders',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-receipt-text',
    keywords: [
      'kitchen display system',
      'restaurant order management system',
      'kitchen order tracking software',
      'restaurant order queue system',
      'KDS for restaurants',
    ],
    guidingLiterature: {
      summary:
        'Order-management searches are about live coordination: receiving Orders, routing lines, prioritising the queue, updating status, and understanding preparation timing.',
      needs: [
        'Show one current service queue with clear order timing and status.',
        'Route ordered items to the Station responsible for preparation.',
        'Record progress and surface delayed or blocked Orders.',
      ],
    },
  },
  {
    id: 'kitchen.recipes',
    slug: 'recipes',
    title: 'Recipes',
    headline: 'Restaurant Recipe Management',
    description: 'Create and manage kitchen recipes.',
    to: '/workspace/kitchen/recipes',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-notebook-tabs',
    keywords: [
      'restaurant recipe management software',
      'recipe costing software',
      'food cost calculator for recipes',
      'commercial kitchen recipe software',
      'recipe scaling software',
    ],
    guidingLiterature: {
      summary:
        'Recipe searches connect standardisation with costing and scaling. A useful Recipe records Ingredients, quantities, method, yield, and portion conversion so the same definition supports production and finance.',
      needs: [
        'Create repeatable Recipes with Ingredients, quantities, methods, and yields.',
        'Scale quantities to a required batch or portion count.',
        'Calculate Recipe cost from current Ingredient prices.',
      ],
    },
  },
  {
    id: 'kitchen.stations',
    slug: 'stations',
    title: 'Stations',
    headline: 'Kitchen Station Management',
    description: 'Create and manage kitchen stations.',
    to: '/workspace/kitchen/stations',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-layout-grid',
    keywords: [
      'kitchen station management',
      'restaurant kitchen station setup',
      'kitchen order routing',
      'KDS station setup',
      'restaurant station checklist',
    ],
    guidingLiterature: {
      summary:
        'Station searches cover physical kitchen setup, order routing, service readiness, and staff competency. Stations connect Dishes and Prep work to the place and people responsible for producing them.',
      needs: [
        'Define Stations and connect the Dishes they prepare.',
        'Route work and Orders to the correct Station.',
        'Maintain readiness checks and required Team competencies.',
      ],
    },
  },
  {
    id: 'kitchen.suppliers',
    slug: 'suppliers',
    title: 'Suppliers',
    headline: 'Restaurant Supplier Management',
    description: 'Connect kitchen suppliers, catalogues, and supply options.',
    to: '/workspace/kitchen/suppliers',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-truck',
    keywords: [
      'restaurant supplier management software',
      'restaurant procurement software',
      'food supplier ordering system',
      'restaurant vendor management',
      'compare restaurant supplier prices',
    ],
    guidingLiterature: {
      summary:
        'Supplier searches are procurement jobs: finding suppliers, comparing products and prices, preparing orders, and checking deliveries against what was expected.',
      needs: [
        'Connect trusted Suppliers and their catalogues to the Kitchen.',
        'Compare supply options for required Ingredients and products.',
        'Prepare purchase orders and record receiving differences.',
      ],
    },
  },
  {
    id: 'kitchen.tables',
    slug: 'tables',
    title: 'Tables',
    headline: 'Restaurant Table Management',
    description: 'Manage the kitchen table setup used by ordering.',
    to: '/workspace/kitchen/tables',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-grid-2x2',
    keywords: [
      'restaurant table management software',
      'restaurant floor plan software',
      'restaurant seating management system',
      'table turnover software',
      'restaurant waitlist management',
    ],
    guidingLiterature: {
      summary:
        'Table searches mix floor-plan setup with live seating and turnover. The Kitchen capability should first provide the Table identities and capacities required by ordering, while wider host and waitlist workflows remain separately owned.',
      needs: [
        'Define Tables, labels, capacities, and their floor arrangement.',
        'Connect a Table to the relevant Order and service state.',
        'Review occupancy and turnover only when authoritative service timing exists.',
      ],
    },
  },
  {
    id: 'kitchen.finance',
    slug: 'finance',
    title: 'Finance',
    headline: 'Restaurant Financial Reporting',
    description:
      'Review gross sales, completed sales, and average sale for a selected period.',
    to: '/workspace/kitchen/finance',
    workspace: kitchenWorkspace,
    icon: 'i-lucide-chart-line',
    keywords: [
      'restaurant financial reporting software',
      'restaurant sales analytics',
      'restaurant profit margin calculator',
      'restaurant food cost reporting',
      'restaurant daily sales report',
    ],
    guidingLiterature: {
      summary:
        'Restaurant finance searches ask for daily sales, cost percentages, margins, and period comparisons. Current Kitchen Finance starts with authoritative sales measures and can add cost and margin analysis only as the required records become available.',
      needs: [
        'Review gross sales, completed sales, and average sale by period.',
        'Compare sales periods using the same bounded measures.',
        'Connect Dish and Ingredient costs before claiming food cost or profit.',
      ],
    },
  },
] satisfies FireuxMetaOperation[]
