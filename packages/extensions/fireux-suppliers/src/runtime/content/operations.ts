// Concurrent edit — 2026-07-21 12:58 CEST — Console operations catalogue: publish Supplier operation routes.
import type { FireuxMetaOperation } from 'fireux-core/config/app/meta-content'

const supplierConsole = {
  id: 'supplier',
  name: 'Supplier console',
  to: '/console/supplier',
} as const

export const supplierOperations = [
  {
    id: 'supplier.identity',
    slug: 'identity',
    title: 'Identity',
    description: 'Manage the selected supplier identity and profile.',
    to: '/console/supplier/identity',
    console: supplierConsole,
    icon: 'i-lucide-info',
  },
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
  {
    id: 'supplier.team',
    slug: 'team',
    title: 'Team',
    description: 'Manage supplier team access and roles.',
    to: '/console/supplier/team',
    console: supplierConsole,
    icon: 'i-lucide-users',
  },
] satisfies FireuxMetaOperation[]
