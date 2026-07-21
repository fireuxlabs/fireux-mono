// Concurrent edit — 2026-07-21 12:58 CEST — Console operations catalogue: publish Kitchen operation routes.
import type { FireuxMetaOperation } from 'fireux-core/runtime/models/system/meta-content.model'

const kitchenConsole = {
  id: 'kitchen',
  name: 'Kitchen console',
  to: '/console/kitchen',
} as const

export const kitchenOperations = [
  {
    id: 'kitchen.dishes',
    title: 'Dishes',
    description: 'Create and manage dishes used across kitchen menus and recipes.',
    to: '/console/kitchen/dishes',
    console: kitchenConsole,
    icon: 'i-lucide-utensils',
  },
  {
    id: 'kitchen.ingredients',
    title: 'Ingredients',
    description: 'Create and manage the kitchen ingredient catalogue.',
    to: '/console/kitchen/ingredients',
    console: kitchenConsole,
    icon: 'i-lucide-carrot',
  },
  {
    id: 'kitchen.menus',
    title: 'Menus',
    description: 'Create, structure, publish, and manage kitchen menus.',
    to: '/console/kitchen/menus',
    console: kitchenConsole,
    icon: 'i-lucide-book-open',
  },
  {
    id: 'kitchen.mise',
    title: 'Mise',
    description: 'Plan and track kitchen preparation work.',
    to: '/console/kitchen/mise',
    console: kitchenConsole,
    icon: 'i-lucide-list-checks',
  },
  {
    id: 'kitchen.orders',
    title: 'Orders',
    description: 'Run the live kitchen order board and service queue.',
    to: '/console/kitchen/orders',
    console: kitchenConsole,
    icon: 'i-lucide-receipt-text',
  },
  {
    id: 'kitchen.recipes',
    title: 'Recipes',
    description: 'Create and manage kitchen recipes.',
    to: '/console/kitchen/recipes',
    console: kitchenConsole,
    icon: 'i-lucide-notebook-tabs',
  },
  {
    id: 'kitchen.stations',
    title: 'Stations',
    description: 'Create and manage kitchen stations.',
    to: '/console/kitchen/stations',
    console: kitchenConsole,
    icon: 'i-lucide-layout-grid',
  },
  {
    id: 'kitchen.suppliers',
    title: 'Suppliers',
    description: 'Connect kitchen suppliers, catalogues, and procurement details.',
    to: '/console/kitchen/suppliers',
    console: kitchenConsole,
    icon: 'i-lucide-truck',
  },
  {
    id: 'kitchen.tables',
    title: 'Tables',
    description: 'Manage the kitchen table setup used by ordering.',
    to: '/console/kitchen/tables',
    console: kitchenConsole,
    icon: 'i-lucide-grid-2x2',
  },
] satisfies FireuxMetaOperation[]
