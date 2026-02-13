/**
 * Read-only kitchens
 * - No persistence
 * - No create/edit/delete UI should appear when using these datasets
 * - Keep shapes intentionally simple and stable
 */

export type ReadOnlyKitchenMode = 'read-only'

export type ReadOnlyKitchen = {
  mode: ReadOnlyKitchenMode
  kitchen: {
    id: string
    name: string
    kind: 'burger' | 'ramen'
    description: string
    address_label: string
    image_url: string
  }
  ingredients: Array<{
    id: string
    name: string
    category:
      | 'protein'
      | 'veg'
      | 'dairy'
      | 'dry'
      | 'sauce'
      | 'bakery'
      | 'broth'
      | 'other'
    unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs'
    par_level: number
    on_hand: number
  }>
  prep: Array<{
    id: string
    name: string
    station: 'grill' | 'fryer' | 'cold' | 'ramen-line' | 'prep'
    notes: string
    status: 'todo' | 'doing' | 'done'
  }>
  menus: Array<{
    id: string
    name: string
    category: 'mains' | 'sides' | 'drinks'
    price_chf: number
    description: string
    bom: Array<{ ingredient_name: string; qty: number; unit: 'g' | 'ml' | 'pcs' }>
  }>
}

export const readOnlyKitchens: ReadOnlyKitchen[] = [
  {
    mode: 'read-only',
    kitchen: {
      id: 'ro-kitchen-burger-01',
      name: 'Stack & Sizzle',
      kind: 'burger',
      description: 'Smash burgers, crisp fries, simple sauces. High volume, tight line.',
      address_label: 'Demo Location - High Street',
      image_url:
        'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=640&h=520&q=80',
    },
    ingredients: [
      { id: 'ing-bun', name: 'Brioche buns', category: 'bakery', unit: 'pcs', par_level: 120, on_hand: 68 },
      { id: 'ing-beef', name: 'Beef mince (20% fat)', category: 'protein', unit: 'kg', par_level: 25, on_hand: 11 },
      { id: 'ing-cheddar', name: 'Cheddar slices', category: 'dairy', unit: 'pcs', par_level: 300, on_hand: 140 },
      { id: 'ing-lettuce', name: 'Iceberg lettuce', category: 'veg', unit: 'pcs', par_level: 12, on_hand: 5 },
      { id: 'ing-tomato', name: 'Tomatoes', category: 'veg', unit: 'kg', par_level: 8, on_hand: 3 },
      { id: 'ing-onion', name: 'Onions', category: 'veg', unit: 'kg', par_level: 10, on_hand: 4 },
      { id: 'ing-pickle', name: 'Pickles', category: 'other', unit: 'kg', par_level: 3, on_hand: 1 },
      { id: 'ing-fries', name: 'Fries (frozen)', category: 'dry', unit: 'kg', par_level: 40, on_hand: 18 },
      { id: 'ing-mayo', name: 'Mayonnaise', category: 'sauce', unit: 'kg', par_level: 6, on_hand: 2 },
      { id: 'ing-ketchup', name: 'Ketchup', category: 'sauce', unit: 'kg', par_level: 6, on_hand: 2 },
      { id: 'ing-mustard', name: 'Mustard', category: 'sauce', unit: 'kg', par_level: 3, on_hand: 1 },
    ],
    prep: [
      { id: 'prep-1', name: 'Slice tomatoes', station: 'prep', notes: '5mm rounds, hold chilled', status: 'todo' },
      { id: 'prep-2', name: 'Shred iceberg', station: 'prep', notes: 'Keep dry, towel-lined GN', status: 'doing' },
      { id: 'prep-3', name: 'House burger sauce', station: 'cold', notes: 'Mayo + ketchup + pickle brine', status: 'done' },
      { id: 'prep-4', name: 'Onion pickle', station: 'prep', notes: 'Quick pickle for service', status: 'todo' },
      { id: 'prep-5', name: 'Portion smash balls', station: 'prep', notes: '90g portions, parchment between', status: 'doing' },
    ],
    menus: [
      {
        id: 'menu-b1',
        name: 'Classic Smash',
        category: 'mains',
        price_chf: 16,
        description: 'Double smash, cheddar, lettuce, tomato, house sauce.',
        bom: [
          { ingredient_name: 'Brioche buns', qty: 1, unit: 'pcs' },
          { ingredient_name: 'Beef mince (20% fat)', qty: 180, unit: 'g' },
          { ingredient_name: 'Cheddar slices', qty: 2, unit: 'pcs' },
          { ingredient_name: 'Iceberg lettuce', qty: 25, unit: 'g' },
          { ingredient_name: 'Tomatoes', qty: 40, unit: 'g' },
          { ingredient_name: 'Mayonnaise', qty: 25, unit: 'g' },
          { ingredient_name: 'Ketchup', qty: 10, unit: 'g' },
        ],
      },
      {
        id: 'menu-b2',
        name: 'Pickle Fire',
        category: 'mains',
        price_chf: 17,
        description: 'Double smash, cheddar, onions, pickles, mustard hit.',
        bom: [
          { ingredient_name: 'Brioche buns', qty: 1, unit: 'pcs' },
          { ingredient_name: 'Beef mince (20% fat)', qty: 180, unit: 'g' },
          { ingredient_name: 'Cheddar slices', qty: 2, unit: 'pcs' },
          { ingredient_name: 'Onions', qty: 20, unit: 'g' },
          { ingredient_name: 'Pickles', qty: 15, unit: 'g' },
          { ingredient_name: 'Mustard', qty: 12, unit: 'g' },
        ],
      },
      {
        id: 'menu-b3',
        name: 'Fries',
        category: 'sides',
        price_chf: 6,
        description: 'Crisp fries, salt.',
        bom: [{ ingredient_name: 'Fries (frozen)', qty: 180, unit: 'g' }],
      },
    ],
  },
  {
    mode: 'read-only',
    kitchen: {
      id: 'ro-kitchen-ramen-01',
      name: 'Broth & Bloom',
      kind: 'ramen',
      description: 'Tonkotsu + shoyu focus. Prep-heavy, calm service rhythm.',
      address_label: 'Demo Location - Riverside',
      image_url:
        'https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=640&h=520&q=80',
    },
    ingredients: [
      { id: 'ing-noodles', name: 'Ramen noodles', category: 'dry', unit: 'kg', par_level: 18, on_hand: 8 },
      { id: 'ing-broth', name: 'Tonkotsu broth (base)', category: 'broth', unit: 'l', par_level: 60, on_hand: 22 },
      { id: 'ing-shoyu', name: 'Shoyu tare', category: 'sauce', unit: 'l', par_level: 12, on_hand: 5 },
      { id: 'ing-miso', name: 'Miso tare', category: 'sauce', unit: 'kg', par_level: 6, on_hand: 2 },
      { id: 'ing-chashu', name: 'Chashu pork', category: 'protein', unit: 'kg', par_level: 10, on_hand: 4 },
      { id: 'ing-ajitama', name: 'Ajitama eggs', category: 'protein', unit: 'pcs', par_level: 180, on_hand: 64 },
      { id: 'ing-nori', name: 'Nori sheets', category: 'dry', unit: 'pcs', par_level: 300, on_hand: 120 },
      { id: 'ing-scallion', name: 'Spring onions', category: 'veg', unit: 'kg', par_level: 6, on_hand: 2 },
      { id: 'ing-menma', name: 'Menma (bamboo)', category: 'other', unit: 'kg', par_level: 4, on_hand: 1 },
      { id: 'ing-sesame', name: 'Sesame oil', category: 'sauce', unit: 'l', par_level: 3, on_hand: 1 },
      { id: 'ing-chili', name: 'Chili oil', category: 'sauce', unit: 'l', par_level: 3, on_hand: 1 },
    ],
    prep: [
      { id: 'prep-r1', name: 'Tonkotsu simmer', station: 'prep', notes: 'Top up water, skim, maintain rolling simmer', status: 'doing' },
      { id: 'prep-r2', name: 'Chashu slice', station: 'ramen-line', notes: '2-3mm slices, torch to order', status: 'todo' },
      { id: 'prep-r3', name: 'Ajitama marinate', station: 'prep', notes: '6h minimum, rotate batch labels', status: 'done' },
      { id: 'prep-r4', name: 'Scallion prep', station: 'prep', notes: 'Fine slice, keep iced', status: 'doing' },
      { id: 'prep-r5', name: 'Tare top-up', station: 'prep', notes: 'Check shoyu tare level, prep backup', status: 'todo' },
    ],
    menus: [
      {
        id: 'menu-r1',
        name: 'Tonkotsu Shoyu',
        category: 'mains',
        price_chf: 22,
        description: 'Creamy pork broth, shoyu tare, chashu, ajitama, scallion, nori.',
        bom: [
          { ingredient_name: 'Ramen noodles', qty: 140, unit: 'g' },
          { ingredient_name: 'Tonkotsu broth (base)', qty: 450, unit: 'ml' },
          { ingredient_name: 'Shoyu tare', qty: 35, unit: 'ml' },
          { ingredient_name: 'Chashu pork', qty: 60, unit: 'g' },
          { ingredient_name: 'Ajitama eggs', qty: 1, unit: 'pcs' },
          { ingredient_name: 'Spring onions', qty: 15, unit: 'g' },
          { ingredient_name: 'Nori sheets', qty: 1, unit: 'pcs' },
        ],
      },
      {
        id: 'menu-r2',
        name: 'Miso Ramen',
        category: 'mains',
        price_chf: 21,
        description: 'Tonkotsu base, miso tare, chashu, menma, scallion, sesame.',
        bom: [
          { ingredient_name: 'Ramen noodles', qty: 140, unit: 'g' },
          { ingredient_name: 'Tonkotsu broth (base)', qty: 450, unit: 'ml' },
          { ingredient_name: 'Miso tare', qty: 30, unit: 'g' },
          { ingredient_name: 'Chashu pork', qty: 55, unit: 'g' },
          { ingredient_name: 'Menma (bamboo)', qty: 25, unit: 'g' },
          { ingredient_name: 'Spring onions', qty: 15, unit: 'g' },
          { ingredient_name: 'Sesame oil', qty: 5, unit: 'ml' },
        ],
      },
      {
        id: 'menu-r3',
        name: 'Spicy Add-on',
        category: 'sides',
        price_chf: 2,
        description: 'A little chili oil heat.',
        bom: [{ ingredient_name: 'Chili oil', qty: 5, unit: 'ml' }],
      },
    ],
  },
]

export function getReadOnlyKitchenById(id: string) {
  return readOnlyKitchens.find((entry) => entry.kitchen.id === id) ?? null
}

export function getReadOnlyKitchenList() {
  return readOnlyKitchens.map((entry) => ({
    id: entry.kitchen.id,
    name: entry.kitchen.name,
    kind: entry.kitchen.kind,
    description: entry.kitchen.description,
    address_label: entry.kitchen.address_label,
    image_url: entry.kitchen.image_url,
    mode: entry.mode,
  }))
}
