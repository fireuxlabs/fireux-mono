// Workspace operation catalogue: only selected-Supplier work, never baked-in Workspace capabilities.
import type { FireuxMetaOperation } from 'fireux-core/config/app/meta-content'

const supplierWorkspace = {
  id: 'supplier',
  name: 'Supplier workspace',
  to: '/workspace/supplier',
} as const

export const supplierOperations = [
  {
    id: 'supplier.catalogue',
    slug: 'catalogue',
    title: 'Catalogue',
    description: 'View the selected supplier catalogue.',
    to: '/workspace/supplier/catalogue',
    workspace: supplierWorkspace,
    icon: 'i-lucide-library',
  },
  {
    id: 'supplier.ingredients',
    slug: 'ingredients',
    title: 'Ingredients',
    description: 'View ingredients connected to the selected supplier.',
    to: '/workspace/supplier/ingredients',
    workspace: supplierWorkspace,
    icon: 'i-lucide-wheat',
  },
  {
    id: 'supplier.items',
    slug: 'items',
    title: 'Items',
    description: 'View items connected to the selected supplier.',
    to: '/workspace/supplier/items',
    workspace: supplierWorkspace,
    icon: 'i-lucide-package-open',
  },
] satisfies FireuxMetaOperation[]
