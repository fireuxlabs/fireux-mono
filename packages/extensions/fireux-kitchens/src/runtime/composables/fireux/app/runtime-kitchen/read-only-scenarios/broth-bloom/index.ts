import {
  buildMenu,
  buildReadOnlyStations,
  buildReadOnlySupplierIngredients,
  buildReadOnlySuppliers,
  buildReadOnlyTrainingModules,
  normalizeKitchenIngredient,
} from '../_shared/builders'
import type { DummyScenario } from '../_shared/types'
import { takumiRamenScenario } from '../takumi-ramen'

const dishIdMap = {
  'shio-ramen': 'tonkotsu-shoyu',
  'shoyu-ramen': 'miso-ramen',
  'miso-corn-butter-ramen': 'spicy-garlic-ramen',
  'veg-mushroom-ramen': 'veggie-shoyu-ramen',
} as const

const dishNameById: Record<string, string> = {
  'tonkotsu-shoyu': 'Tonkotsu Shoyu',
  'miso-ramen': 'Miso Ramen',
  'spicy-garlic-ramen': 'Spicy Garlic Ramen',
  'veggie-shoyu-ramen': 'Veggie Shoyu Ramen',
}

const dishDescriptionById: Record<string, string> = {
  'tonkotsu-shoyu': 'Creamy pork-forward broth with shoyu tare, egg, nori, and spring onion.',
  'miso-ramen': 'Rich miso bowl with bamboo shoots and chashu.',
  'spicy-garlic-ramen': 'Garlic and chili heat on a deep broth base with noodles and nori.',
  'veggie-shoyu-ramen': 'Light shoyu broth with mushroom, nori, and spring onion.',
}

const mapDishId = (value: string) =>
  dishIdMap[value as keyof typeof dishIdMap] ?? value

export const brothBloomScenario = (): DummyScenario => {
  const base = takumiRamenScenario()
  const kitchenId = 'broth-bloom'

  const kitchen = {
    ...(base.kitchen as Record<string, unknown>),
    id: kitchenId,
    name: 'Broth & Bloom',
    short_name: 'Broth & Bloom',
    short_address: 'Riverside',
    formatted_address: 'Demo Location - Riverside',
    image_url:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=640&h=520&q=80',
  }

  const kitchenIngredients = (base.kitchenIngredients ?? []).map((ingredient: any) =>
    normalizeKitchenIngredient({
      kitchenId,
      ingredient,
    })
  )

  const miseTasks = (base.menuStack.miseTasks ?? []).map((task: any) => ({
    ...task,
    kitchen_id: kitchenId,
  }))

  const dishes = (base.menuStack.dishes ?? []).map((dish: any, index: number) => {
    const nextId = mapDishId(String(dish?.id || '').trim())

    return {
      ...dish,
      id: nextId,
      kitchen_id: kitchenId,
      name: dishNameById[nextId] || dish?.name,
      description: dishDescriptionById[nextId] || dish?.description,
      sort_order: index + 1,
    }
  })

  const recipes = (base.menuStack.recipes ?? []).map((recipe: any) => {
    const recipeId = String(recipe?.id || '').trim()

    if (recipeId === 'recipe-chicken-dashi-broth') {
      return {
        ...recipe,
        name: 'Broth Bloom Base',
        description: 'Long-simmer broth base for tonkotsu and shoyu service.',
      }
    }

    if (recipeId === 'recipe-shio-tare') {
      return {
        ...recipe,
        name: 'Bloom Tare',
        description: 'House tare base for savory service-ready bowls.',
      }
    }

    return recipe
  })

  const menus = [
    buildMenu({
      kitchenId,
      overrides: {
        id: 'menu-broth-core',
        name: 'Core Bowls',
        description: 'Broth-forward bowls for all-day service.',
        active: true,
        dish_ids: ['tonkotsu-shoyu', 'miso-ramen', 'spicy-garlic-ramen'],
        sort_order: 1,
        stations: ['prep', 'pass'],
      },
    }),
    buildMenu({
      kitchenId,
      overrides: {
        id: 'menu-broth-late',
        name: 'Late Night Bowls',
        description: 'Reduced lineup for late service.',
        active: true,
        dish_ids: ['tonkotsu-shoyu', 'veggie-shoyu-ramen'],
        sort_order: 2,
        stations: ['prep', 'pass'],
      },
    }),
  ]
  const stations = buildReadOnlyStations(kitchenId)
  const teamMembers: Array<Record<string, unknown>> = [
    {
      id: 'team-bb-01',
      kitchen_id: kitchenId,
      name: 'Elena Novak',
      role: 'Head Chef',
      station: 'pass',
      is_lead: true,
      contact: { email: 'elena@brothbloom.demo', phone: '+41 79 000 0201' },
      tags: ['lead', 'service', 'training'],
    },
    {
      id: 'team-bb-02',
      kitchen_id: kitchenId,
      name: 'Hugo Weiss',
      role: 'Ramen Cook',
      station: 'grill',
      is_lead: false,
      contact: { email: 'hugo@brothbloom.demo', phone: '+41 79 000 0202' },
      tags: ['noodles', 'pickup'],
    },
    {
      id: 'team-bb-03',
      kitchen_id: kitchenId,
      name: 'Sofia Almeida',
      role: 'Prep Cook',
      station: 'prep',
      is_lead: false,
      contact: { email: 'sofia@brothbloom.demo', phone: '+41 79 000 0203' },
      tags: ['prep', 'broth', 'mise'],
    },
  ]
  const suppliers = buildReadOnlySuppliers(kitchenId)
  const supplierIngredients = buildReadOnlySupplierIngredients(kitchenId)
  const trainingModules = buildReadOnlyTrainingModules(kitchenId)
  const haccpChecks: Array<Record<string, unknown>> = [
    {
      id: 'haccp-bb-01',
      kitchen_id: kitchenId,
      type: 'fridge_temp',
      title: 'Fridge temp log',
      frequency: 'daily',
      target: { max_c: 5 },
      last_recorded: '2026-02-13',
      status: 'ok',
    },
    {
      id: 'haccp-bb-02',
      kitchen_id: kitchenId,
      type: 'hot_hold',
      title: 'Broth hot hold',
      frequency: 'service',
      target: { min_c: 63 },
      last_recorded: '2026-02-13',
      status: 'ok',
    },
    {
      id: 'haccp-bb-03',
      kitchen_id: kitchenId,
      type: 'cleaning',
      title: 'Sanitize prep surfaces',
      frequency: 'daily',
      target: { required: true },
      last_recorded: '2026-02-13',
      status: 'due',
    },
  ]

  return {
    ...base,
    kitchen,
    kitchenIngredients,
    teamMembers,
    menuStack: {
      ...base.menuStack,
      kitchenId,
      stations,
      recipes,
      miseTasks,
      dishes,
      menus,
    },
    procurementStack: {
      ...base.procurementStack,
      kitchenId,
      suppliers,
      supplierIngredients,
    },
    serviceStack: {
      ...base.serviceStack,
      kitchenId,
    },
    trainingStack: {
      kitchenId,
      modules: trainingModules,
    },
    haccpStack: {
      kitchenId,
      checks: haccpChecks,
    },
  }
}
