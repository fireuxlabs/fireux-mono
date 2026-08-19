// Console operation catalogue: only selected-Supplier work, never baked-in Console capabilities.
import type { FireuxMetaOperation } from 'fireux-core/config/app/meta-content'

const supplierConsole = {
  id: 'supplier',
  name: 'Supplier console',
  to: '/console/supplier',
} as const

export const supplierOperations = [
  {
    id: 'supplier.catalogue',
    slug: 'catalogue',
    title: 'Catalogue',
    description: 'View the selected supplier catalogue.',
    to: '/console/supplier/catalogue',
    console: supplierConsole,
    icon: 'i-lucide-library',
  },
  {
    id: 'supplier.ingredients',
    slug: 'ingredients',
    title: 'Ingredients',
    description: 'View ingredients connected to the selected supplier.',
    to: '/console/supplier/ingredients',
    console: supplierConsole,
    icon: 'i-lucide-wheat',
  },
  {
    id: 'supplier.items',
    slug: 'items',
    title: 'Items',
    description: 'View items connected to the selected supplier.',
    to: '/console/supplier/items',
    console: supplierConsole,
    icon: 'i-lucide-package-open',
  },
] satisfies FireuxMetaOperation[]
