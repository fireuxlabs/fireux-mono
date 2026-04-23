export type DemoKitchenListItem = {
  id: string
  name: string
  label: string
  image_url?: string
}

export type DemoKitchenCollectionName =
  | 'menus'
  | 'dishes'
  | 'ingredients'
  | 'recipes'
  | 'mise'
  | 'suppliers'
  | 'orders'

export type DemoKitchenScenario = DemoKitchenListItem & {
  menus: Record<string, unknown>[]
  dishes: Record<string, unknown>[]
  ingredients: Record<string, unknown>[]
  recipes: Record<string, unknown>[]
  mise: Record<string, unknown>[]
  suppliers: Record<string, unknown>[]
  orders: Record<string, unknown>[]
}

const kitchenImage =
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=640&h=520&q=80'
const prepImage =
  'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=640&h=520&q=80'
const diningImage =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=640&h=520&q=80'

const scenarios: DemoKitchenScenario[] = [
  {
    id: 'line-pass-lab',
    name: 'Line Pass Lab',
    label: 'Fast-casual service simulation',
    image_url: kitchenImage,
    menus: [
      {
        id: 'lunch-rush',
        kitchen_id: 'line-pass-lab',
        name: 'Lunch Rush',
        description: 'Compact service menu for a busy counter shift.',
        active: true,
        currency_code: 'CHF',
        service_modes: ['dine_in', 'collection'],
        sort_order: 1,
        sections: [
          {
            id: 'mains',
            label: 'Mains',
            description: '',
            sort_order: 1,
            items: [
              {
                id: 'smash-burger-item',
                dish_id: 'smash-burger',
                label: 'Smash Burger',
                price_minor: 1800,
                sort_order: 1,
              },
              {
                id: 'market-bowl-item',
                dish_id: 'market-bowl',
                label: 'Market Bowl',
                price_minor: 1650,
                sort_order: 2,
              },
            ],
          },
        ],
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'family-supper',
        kitchen_id: 'line-pass-lab',
        name: 'Family Supper',
        description: 'Simple evening offer for a small dining room.',
        active: true,
        currency_code: 'CHF',
        service_modes: ['dine_in'],
        sort_order: 2,
        sections: [
          {
            id: 'supper',
            label: 'Supper',
            description: '',
            sort_order: 1,
            items: [
              {
                id: 'roast-chicken-item',
                dish_id: 'roast-chicken',
                label: 'Roast Chicken',
                price_minor: 2400,
                sort_order: 1,
              },
            ],
          },
        ],
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    dishes: [
      {
        id: 'smash-burger',
        kitchen_id: 'line-pass-lab',
        name: 'Smash Burger',
        short_name: 'Burger',
        description: 'Double patty, pickles, house sauce, toasted bun.',
        image_url:
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=320&h=240&q=80',
        primary_recipe_id: 'smash-burger-build',
        recipe_ids: ['smash-burger-build'],
        ingredient_ids: ['beef-patty', 'brioche-bun', 'house-pickles'],
        mise_ids: ['slice-pickles', 'portion-sauce'],
        sort_order: 1,
        active: true,
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'market-bowl',
        kitchen_id: 'line-pass-lab',
        name: 'Market Bowl',
        short_name: 'Market Bowl',
        description: 'Grains, roasted vegetables, herbs, lemon dressing.',
        image_url:
          'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=320&h=240&q=80',
        primary_recipe_id: 'market-bowl-build',
        recipe_ids: ['market-bowl-build'],
        ingredient_ids: ['mixed-greens', 'roast-vegetables', 'lemon-dressing'],
        mise_ids: ['wash-greens', 'roast-veg-tray'],
        sort_order: 2,
        active: true,
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'roast-chicken',
        kitchen_id: 'line-pass-lab',
        name: 'Roast Chicken',
        short_name: 'Chicken',
        description: 'Herb roast chicken with tray potatoes.',
        image_url:
          'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=320&h=240&q=80',
        primary_recipe_id: 'roast-chicken-service',
        recipe_ids: ['roast-chicken-service'],
        ingredient_ids: ['whole-chicken', 'potatoes', 'herb-butter'],
        mise_ids: ['brine-chicken'],
        sort_order: 3,
        active: true,
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    ingredients: [
      {
        id: 'beef-patty',
        ingredient_id: 'beef-patty',
        name: 'Beef Patty',
        slug: 'beef-patty',
        image_url:
          'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'city-produce',
        supplier_name: 'City Produce',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'brioche-bun',
        ingredient_id: 'brioche-bun',
        name: 'Brioche Bun',
        slug: 'brioche-bun',
        image_url:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'daily-bakehouse',
        supplier_name: 'Daily Bakehouse',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'mixed-greens',
        ingredient_id: 'mixed-greens',
        name: 'Mixed Greens',
        slug: 'mixed-greens',
        image_url:
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'green-larder',
        supplier_name: 'Green Larder',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    recipes: [
      {
        id: 'smash-burger-build',
        kitchen_id: 'line-pass-lab',
        name: 'Smash Burger Build',
        recipe_type: 'service',
        workflow_status: 'active',
        visibility: 'team',
        protection_level: 'standard',
        description: 'Station method for burger setup, sear, and pass.',
        ingredient_lines: [
          {
            id: 'beef',
            ingredient_id: 'beef-patty',
            ingredient_name: 'Beef Patty',
            quantity: 2,
            unit: 'piece',
          },
          {
            id: 'bun',
            ingredient_id: 'brioche-bun',
            ingredient_name: 'Brioche Bun',
            quantity: 1,
            unit: 'piece',
          },
        ],
        steps: [
          {
            id: 'sear',
            order: 1,
            instruction: 'Sear patties hard on the flat top.',
            minutes: 3,
          },
          {
            id: 'build',
            order: 2,
            instruction: 'Toast bun, sauce, stack, wrap, and pass.',
            minutes: 2,
          },
        ],
        yield_qty: 1,
        yield_unit: 'portion',
        prep_minutes: 10,
        cook_minutes: 5,
        primary_dish_id: 'smash-burger',
        publication_status: 'unpublished',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'market-bowl-build',
        kitchen_id: 'line-pass-lab',
        name: 'Market Bowl Build',
        recipe_type: 'service',
        workflow_status: 'active',
        visibility: 'team',
        protection_level: 'standard',
        description: 'Quick build for vegetable bowls during service.',
        ingredient_lines: [
          {
            id: 'greens',
            ingredient_id: 'mixed-greens',
            ingredient_name: 'Mixed Greens',
            quantity: 80,
            unit: 'g',
          },
        ],
        steps: [
          {
            id: 'dress',
            order: 1,
            instruction: 'Dress greens lightly and plate with roast vegetables.',
            minutes: 2,
          },
        ],
        yield_qty: 1,
        yield_unit: 'portion',
        prep_minutes: 8,
        cook_minutes: 0,
        primary_dish_id: 'market-bowl',
        publication_status: 'unpublished',
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    mise: [
      {
        id: 'slice-pickles',
        kitchen_id: 'line-pass-lab',
        title: 'Slice pickles',
        description: 'Slice and tub house pickles for burger station.',
        station: 'Garde manger',
        service_date: '2026-04-23',
        status: 'todo',
        priority: 'normal',
        estimated_minutes: 15,
        ingredient_ids: ['house-pickles'],
        checklist: [
          { id: 'label', label: 'Label tub', done: false },
          { id: 'chill', label: 'Move to lowboy', done: false },
        ],
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'portion-sauce',
        kitchen_id: 'line-pass-lab',
        title: 'Portion burger sauce',
        description: 'Fill squeeze bottles for the pass.',
        station: 'Sauce',
        service_date: '2026-04-23',
        status: 'in_progress',
        priority: 'high',
        estimated_minutes: 10,
        ingredient_ids: ['house-sauce'],
        checklist: [],
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    suppliers: [
      {
        id: 'city-produce',
        supplier_id: 'city-produce',
        kitchen_id: 'line-pass-lab',
        name: 'City Produce',
        supplier_organization_name: 'City Produce',
        supplier_headline: 'Daily meat and dry-store drops',
        supplier_product_categories: ['Meat', 'Dry Store'],
        supplier_delivery_areas: ['Central'],
        supplier_image:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&h=240&q=80',
        image_url:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&h=240&q=80',
      },
      {
        id: 'daily-bakehouse',
        supplier_id: 'daily-bakehouse',
        kitchen_id: 'line-pass-lab',
        name: 'Daily Bakehouse',
        supplier_organization_name: 'Daily Bakehouse',
        supplier_headline: 'Buns and breads before service',
        supplier_product_categories: ['Bakery'],
        supplier_delivery_areas: ['Central'],
        supplier_image:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
        image_url:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
      },
      {
        id: 'green-larder',
        supplier_id: 'green-larder',
        kitchen_id: 'line-pass-lab',
        name: 'Green Larder',
        supplier_organization_name: 'Green Larder',
        supplier_headline: 'Leafy greens and herbs for fast service kitchens',
        supplier_product_categories: ['Produce', 'Herbs'],
        supplier_delivery_areas: ['Central'],
        supplier_image:
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&h=240&q=80',
        image_url:
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&h=240&q=80',
      },
    ],
    orders: [
      {
        id: 'order-104',
        kitchen_id: 'line-pass-lab',
        order_number: '104',
        status: 'open',
        channel: 'counter',
        items: [
          {
            id: 'burger',
            dish_id: 'smash-burger',
            label: 'Smash Burger',
            quantity: 2,
            checked: false,
          },
          {
            id: 'bowl',
            dish_id: 'market-bowl',
            label: 'Market Bowl',
            quantity: 1,
            checked: false,
          },
        ],
        created: { at: {} },
        updated: { at: {} },
      },
    ],
  },
  {
    id: 'prep-yard',
    name: 'Prep Yard',
    label: 'High-volume prep workflow demo',
    image_url: prepImage,
    menus: [],
    dishes: [],
    ingredients: [],
    recipes: [],
    mise: [
      {
        id: 'prep-veg',
        kitchen_id: 'prep-yard',
        title: 'Prep vegetable trays',
        description: 'Batch roast vegetables for tomorrow service.',
        station: 'Prep',
        service_date: '2026-04-23',
        status: 'todo',
        priority: 'high',
        estimated_minutes: 45,
        ingredient_ids: [],
        checklist: [],
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    suppliers: [],
    orders: [],
  },
  {
    id: 'garden-room',
    name: 'Garden Room',
    label: 'Neighbourhood kitchen dinner service',
    image_url: diningImage,
    menus: [
      {
        id: 'dinner-service',
        kitchen_id: 'garden-room',
        name: 'Dinner Service',
        description: 'Short neighbourhood dinner menu.',
        active: true,
        currency_code: 'CHF',
        service_modes: ['dine_in'],
        sort_order: 1,
        sections: [
          {
            id: 'starters',
            label: 'Starters',
            description: '',
            sort_order: 1,
            items: [
              {
                id: 'garden-tartine-item',
                dish_id: 'garden-tartine',
                label: 'Garden Tartine',
                price_minor: 1450,
                sort_order: 1,
              },
            ],
          },
          {
            id: 'mains',
            label: 'Mains',
            description: '',
            sort_order: 2,
            items: [
              {
                id: 'herb-chicken-supper-item',
                dish_id: 'herb-chicken-supper',
                label: 'Herb Chicken Supper',
                price_minor: 2650,
                sort_order: 1,
              },
            ],
          },
        ],
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    dishes: [
      {
        id: 'garden-tartine',
        kitchen_id: 'garden-room',
        name: 'Garden Tartine',
        short_name: 'Tartine',
        description: 'Charred courgette, whipped ricotta, and basil oil on toasted sourdough.',
        image_url:
          'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=320&h=240&q=80',
        primary_recipe_id: 'garden-tartine-plate',
        recipe_ids: ['garden-tartine-plate'],
        ingredient_ids: ['sourdough-loaf', 'ricotta', 'courgette', 'basil-oil'],
        mise_ids: ['whip-ricotta', 'char-courgette'],
        sort_order: 1,
        active: true,
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'herb-chicken-supper',
        kitchen_id: 'garden-room',
        name: 'Herb Chicken Supper',
        short_name: 'Chicken Supper',
        description: 'Roast chicken thigh with tray potatoes, bitter leaves, and herb butter.',
        image_url:
          'https://images.unsplash.com/photo-1604908176997-431fbd57182d?auto=format&fit=crop&w=320&h=240&q=80',
        primary_recipe_id: 'herb-chicken-supper-plate',
        recipe_ids: ['herb-chicken-supper-plate'],
        ingredient_ids: ['chicken-thigh', 'baby-potatoes', 'bitter-leaves', 'herb-butter'],
        mise_ids: ['marinate-chicken', 'roast-potatoes'],
        sort_order: 2,
        active: true,
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    ingredients: [
      {
        id: 'sourdough-loaf',
        ingredient_id: 'sourdough-loaf',
        name: 'Sourdough Loaf',
        slug: 'sourdough-loaf',
        image_url:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'daily-bakehouse',
        supplier_name: 'Daily Bakehouse',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'ricotta',
        ingredient_id: 'ricotta',
        name: 'Ricotta',
        slug: 'ricotta',
        image_url:
          'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'city-produce',
        supplier_name: 'City Produce',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'courgette',
        ingredient_id: 'courgette',
        name: 'Courgette',
        slug: 'courgette',
        image_url:
          'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'green-larder',
        supplier_name: 'Green Larder',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'basil-oil',
        ingredient_id: 'basil-oil',
        name: 'Basil Oil',
        slug: 'basil-oil',
        image_url:
          'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'green-larder',
        supplier_name: 'Green Larder',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'chicken-thigh',
        ingredient_id: 'chicken-thigh',
        name: 'Chicken Thigh',
        slug: 'chicken-thigh',
        image_url:
          'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'city-produce',
        supplier_name: 'City Produce',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'baby-potatoes',
        ingredient_id: 'baby-potatoes',
        name: 'Baby Potatoes',
        slug: 'baby-potatoes',
        image_url:
          'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'green-larder',
        supplier_name: 'Green Larder',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'bitter-leaves',
        ingredient_id: 'bitter-leaves',
        name: 'Bitter Leaves',
        slug: 'bitter-leaves',
        image_url:
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'green-larder',
        supplier_name: 'Green Larder',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'herb-butter',
        ingredient_id: 'herb-butter',
        name: 'Herb Butter',
        slug: 'herb-butter',
        image_url:
          'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=240&h=240&q=80',
        supplier_id: 'city-produce',
        supplier_name: 'City Produce',
        status: 'active',
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    recipes: [
      {
        id: 'garden-tartine-plate',
        kitchen_id: 'garden-room',
        name: 'Garden Tartine Plate',
        recipe_type: 'service',
        workflow_status: 'active',
        visibility: 'team',
        protection_level: 'standard',
        description: 'Toast sourdough and finish with ricotta, courgette, and basil oil.',
        ingredient_lines: [
          {
            id: 'bread',
            ingredient_id: 'sourdough-loaf',
            ingredient_name: 'Sourdough Loaf',
            quantity: 2,
            unit: 'slice',
          },
          {
            id: 'ricotta',
            ingredient_id: 'ricotta',
            ingredient_name: 'Ricotta',
            quantity: 80,
            unit: 'g',
          },
          {
            id: 'courgette',
            ingredient_id: 'courgette',
            ingredient_name: 'Courgette',
            quantity: 0.5,
            unit: 'piece',
          },
          {
            id: 'oil',
            ingredient_id: 'basil-oil',
            ingredient_name: 'Basil Oil',
            quantity: 10,
            unit: 'ml',
          },
        ],
        steps: [
          {
            id: 'toast-bread',
            order: 1,
            instruction: 'Toast sourdough until golden at the edges.',
            minutes: 2,
          },
          {
            id: 'spread-ricotta',
            order: 2,
            instruction: 'Spread whipped ricotta generously across the toast.',
            minutes: 1,
          },
          {
            id: 'finish-tartine',
            order: 3,
            instruction: 'Top with charred courgette and finish with basil oil.',
            minutes: 1,
          },
        ],
        yield_qty: 1,
        yield_unit: 'portion',
        prep_minutes: 10,
        cook_minutes: 4,
        primary_dish_id: 'garden-tartine',
        publication_status: 'unpublished',
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'herb-chicken-supper-plate',
        kitchen_id: 'garden-room',
        name: 'Herb Chicken Supper Plate',
        recipe_type: 'service',
        workflow_status: 'active',
        visibility: 'team',
        protection_level: 'standard',
        description: 'Roast and rest chicken, then plate with potatoes and dressed leaves.',
        ingredient_lines: [
          {
            id: 'chicken',
            ingredient_id: 'chicken-thigh',
            ingredient_name: 'Chicken Thigh',
            quantity: 1,
            unit: 'piece',
          },
          {
            id: 'potatoes',
            ingredient_id: 'baby-potatoes',
            ingredient_name: 'Baby Potatoes',
            quantity: 180,
            unit: 'g',
          },
          {
            id: 'leaves',
            ingredient_id: 'bitter-leaves',
            ingredient_name: 'Bitter Leaves',
            quantity: 40,
            unit: 'g',
          },
          {
            id: 'butter',
            ingredient_id: 'herb-butter',
            ingredient_name: 'Herb Butter',
            quantity: 20,
            unit: 'g',
          },
        ],
        steps: [
          {
            id: 'roast-chicken',
            order: 1,
            instruction: 'Roast chicken until the skin is crisp and the meat is cooked through.',
            minutes: 12,
          },
          {
            id: 'warm-potatoes',
            order: 2,
            instruction: 'Warm roast potatoes and glaze with herb butter.',
            minutes: 3,
          },
          {
            id: 'plate-supper',
            order: 3,
            instruction: 'Plate chicken with potatoes and finish with bitter leaves.',
            minutes: 2,
          },
        ],
        yield_qty: 1,
        yield_unit: 'portion',
        prep_minutes: 20,
        cook_minutes: 15,
        primary_dish_id: 'herb-chicken-supper',
        publication_status: 'unpublished',
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    mise: [
      {
        id: 'whip-ricotta',
        kitchen_id: 'garden-room',
        title: 'Whip ricotta',
        description: 'Season ricotta and hold it ready for tartine service.',
        station: 'Cold section',
        service_date: '2026-04-23',
        status: 'todo',
        priority: 'normal',
        estimated_minutes: 10,
        ingredient_ids: ['ricotta'],
        checklist: [
          { id: 'season', label: 'Season and whip smooth', done: false },
          { id: 'label', label: 'Label and date container', done: false },
        ],
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'char-courgette',
        kitchen_id: 'garden-room',
        title: 'Char courgette ribbons',
        description: 'Slice and griddle courgette for the starter section.',
        station: 'Grill',
        service_date: '2026-04-23',
        status: 'todo',
        priority: 'normal',
        estimated_minutes: 15,
        ingredient_ids: ['courgette', 'basil-oil'],
        checklist: [
          { id: 'slice', label: 'Slice into long ribbons', done: false },
          { id: 'cool', label: 'Cool and tray for service', done: false },
        ],
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'marinate-chicken',
        kitchen_id: 'garden-room',
        title: 'Marinate chicken thighs',
        description: 'Rub chicken with herb butter ahead of service.',
        station: 'Prep',
        service_date: '2026-04-23',
        status: 'in_progress',
        priority: 'high',
        estimated_minutes: 20,
        ingredient_ids: ['chicken-thigh', 'herb-butter'],
        checklist: [
          { id: 'portion', label: 'Portion thighs for service', done: true },
          { id: 'rest', label: 'Hold refrigerated until roast', done: false },
        ],
        created: { at: {} },
        updated: { at: {} },
      },
      {
        id: 'roast-potatoes',
        kitchen_id: 'garden-room',
        title: 'Roast tray potatoes',
        description: 'Par-cook and roast baby potatoes for the supper plate.',
        station: 'Prep',
        service_date: '2026-04-23',
        status: 'todo',
        priority: 'high',
        estimated_minutes: 35,
        ingredient_ids: ['baby-potatoes'],
        checklist: [
          { id: 'par-cook', label: 'Par-cook until just tender', done: false },
          { id: 'tray', label: 'Roast and hold for pickup', done: false },
        ],
        created: { at: {} },
        updated: { at: {} },
      },
    ],
    suppliers: [
      {
        id: 'city-produce',
        supplier_id: 'city-produce',
        kitchen_id: 'garden-room',
        name: 'City Produce',
        supplier_organization_name: 'City Produce',
        supplier_headline: 'Daily meat and dry-store drops',
        supplier_product_categories: ['Meat', 'Dry Store'],
        supplier_delivery_areas: ['Central'],
        supplier_image:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&h=240&q=80',
        image_url:
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=240&h=240&q=80',
      },
      {
        id: 'daily-bakehouse',
        supplier_id: 'daily-bakehouse',
        kitchen_id: 'garden-room',
        name: 'Daily Bakehouse',
        supplier_organization_name: 'Daily Bakehouse',
        supplier_headline: 'Buns and breads before service',
        supplier_product_categories: ['Bakery'],
        supplier_delivery_areas: ['Central'],
        supplier_image:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
        image_url:
          'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=240&h=240&q=80',
      },
      {
        id: 'green-larder',
        supplier_id: 'green-larder',
        kitchen_id: 'garden-room',
        name: 'Green Larder',
        supplier_organization_name: 'Green Larder',
        supplier_headline: 'Leafy greens and herbs for fast service kitchens',
        supplier_product_categories: ['Produce', 'Herbs'],
        supplier_delivery_areas: ['Central'],
        supplier_image:
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&h=240&q=80',
        image_url:
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=240&h=240&q=80',
      },
    ],
    orders: [],
  },
]

const normalize = (value: unknown) => String(value ?? '').trim()

const cloneRecords = <T = Record<string, unknown>>(
  records: Record<string, unknown>[]
): T[] => records.map((record) => ({ ...record }) as T)

export const getDemoKitchen = (kitchenId?: string): DemoKitchenScenario | null => {
  const id = normalize(kitchenId)
  if (!id) return null
  return scenarios.find((scenario) => scenario.id === id) ?? null
}

export const getDemoKitchens = (): DemoKitchenListItem[] =>
  scenarios.map((scenario) => ({
    id: scenario.id,
    name: scenario.name,
    label: scenario.label,
    image_url: scenario.image_url,
  }))

export const getDemoKitchenCollection = <T = Record<string, unknown>>(
  kitchenId: string,
  collectionName: DemoKitchenCollectionName
): T[] => {
  const scenario = getDemoKitchen(kitchenId)
  if (!scenario) return []
  return cloneRecords<T>(scenario[collectionName])
}
