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
    short_address: 'Broth & Bloom',
    formatted_address: 'Broth & Bloom',
  }

  const kitchenIngredients = (base.kitchenIngredients ?? []).map((ingredient: any) => {
    const ingredientId = String(ingredient?.ingredient_id || ingredient?.id || '').trim()

    return {
      ...ingredient,
      id: ingredientId ? `k_${kitchenId}__${ingredientId}` : ingredient.id,
      kitchen_id: kitchenId,
    }
  })

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
    {
      ...(base.menuStack.menus?.[0] ?? {}),
      id: 'menu-broth-core',
      kitchen_id: kitchenId,
      name: 'Core Bowls',
      description: 'Broth-forward bowls for all-day service.',
      status: 'live',
      service: 'all_day',
      dish_ids: ['tonkotsu-shoyu', 'miso-ramen', 'spicy-garlic-ramen'],
      sort_order: 1,
      active: true,
      stations: ['noodle-station', 'pass'],
    },
    {
      ...(base.menuStack.menus?.[1] ?? {}),
      id: 'menu-broth-late',
      kitchen_id: kitchenId,
      name: 'Late Night Bowls',
      description: 'Reduced lineup for late service.',
      status: 'draft',
      service: 'dinner',
      dish_ids: ['tonkotsu-shoyu', 'veggie-shoyu-ramen'],
      sort_order: 2,
      active: true,
      stations: ['noodle-station', 'pass'],
    },
  ]
  const stations: Array<Record<string, unknown>> = [
    {
      id: 'station-noodle',
      kitchen_id: kitchenId,
      name: 'Noodle station',
      key: 'noodle-station',
      description: 'Pickup station for bowls.',
      sort_order: 1,
      active: true,
    },
    {
      id: 'station-broth',
      kitchen_id: kitchenId,
      name: 'Broth hold',
      key: 'broth',
      description: 'Broth management + top-ups.',
      sort_order: 2,
      active: true,
    },
    {
      id: 'station-prep',
      kitchen_id: kitchenId,
      name: 'Prep',
      key: 'prep',
      description: 'Eggs, chashu, toppings.',
      sort_order: 3,
      active: true,
    },
    {
      id: 'station-pass',
      kitchen_id: kitchenId,
      name: 'Pass',
      key: 'pass',
      description: 'Final checks.',
      sort_order: 4,
      active: true,
    },
  ]
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
      station: 'noodle-station',
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
  const suppliers: Array<Record<string, unknown>> = [
    {
      id: 'supplier-specialty-01',
      kitchen_id: kitchenId,
      name: 'Bloom Imports',
      kind: 'specialty',
      contact: { email: 'orders@bloomimports.demo', phone: '+41 79 100 0201' },
      lead_time_days: 2,
      notes: 'Nori + noodles + pantry goods.',
      active: true,
    },
    {
      id: 'supplier-butcher-01',
      kitchen_id: kitchenId,
      name: 'City Butchers',
      kind: 'butcher',
      contact: { email: 'sales@citybutchers.demo', phone: '+41 79 100 0202' },
      lead_time_days: 1,
      notes: 'Pork cuts + bones.',
      active: true,
    },
    {
      id: 'supplier-produce-01',
      kitchen_id: kitchenId,
      name: 'Riverside Produce',
      kind: 'produce',
      contact: { email: 'hello@riversideproduce.demo', phone: '+41 79 100 0203' },
      lead_time_days: 2,
      notes: 'Aromatics + spring onions.',
      active: true,
    },
  ]
  const trainingModules: Array<Record<string, unknown>> = [
    {
      id: 'train-bb-01',
      kitchen_id: kitchenId,
      title: 'Broth management',
      description: 'Hold temps, top-ups, skimming, label changes.',
      status: 'published',
      minutes: 25,
      tags: ['broth', 'haccp'],
    },
    {
      id: 'train-bb-02',
      kitchen_id: kitchenId,
      title: 'Pickup rhythm',
      description: 'Ticket flow, bowl build sequence, pass calls.',
      status: 'published',
      minutes: 20,
      tags: ['service', 'pass'],
    },
    {
      id: 'train-bb-03',
      kitchen_id: kitchenId,
      title: 'Cleaning: noodle station',
      description: 'Mid-service wipe downs + end-of-night breakdown.',
      status: 'draft',
      minutes: 15,
      tags: ['cleaning', 'ops'],
    },
  ]
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
