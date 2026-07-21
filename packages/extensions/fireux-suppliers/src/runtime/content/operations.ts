// Concurrent edit — 2026-07-21 12:58 CEST — Console operations catalogue: publish Supplier operation routes.
import type { FireuxMetaOperation } from 'fireux-core/runtime/models/system/meta-content.model'

const supplierConsole = {
  id: 'supplier',
  name: 'Supplier console',
  to: '/console/supplier',
} as const

export const supplierOperations = [
  {
    id: 'supplier.catalogue',
    title: 'Catalogue',
    description: 'View the selected supplier catalogue.',
    to: '/console/supplier/catalogue',
    console: supplierConsole,
    icon: 'i-lucide-library',
  },
  {
    id: 'supplier.ingredients',
    title: 'Ingredients',
    description: 'View ingredients connected to the selected supplier.',
    to: '/console/supplier/ingredients',
    console: supplierConsole,
    icon: 'i-lucide-wheat',
  },
  {
    id: 'supplier.items',
    title: 'Items',
    description: 'View items connected to the selected supplier.',
    to: '/console/supplier/items',
    console: supplierConsole,
    icon: 'i-lucide-package-open',
  },
] satisfies FireuxMetaOperation[]
