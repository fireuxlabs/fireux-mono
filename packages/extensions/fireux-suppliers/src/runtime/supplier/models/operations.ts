// Workspace operation catalogue: only selected-Supplier work, never baked-in Workspace capabilities.
import type {
  FireuxMetaOperation,
  WorkspaceCapabilityFamilies,
} from 'fireux-core/config/app/meta-content'

const supplierWorkspace = {
  id: 'supplier',
  name: 'Supplier workspace',
  to: '/workspace/supplier',
} as const

const supplierCapabilityFamilies = {
  catalogue: {
    surfaces: ['catalogue'],
    entries: [],
    tools: ['record'],
    scopes: ['local'],
  },
  ingredients: {
    surfaces: ['catalogue', 'relationship-directory'],
    entries: [],
    tools: ['record'],
    scopes: ['local'],
  },
  items: {
    surfaces: ['catalogue'],
    entries: [],
    tools: ['record'],
    scopes: ['local'],
  },
} as const satisfies Record<string, WorkspaceCapabilityFamilies>

const defineSupplierOperation = <
  const T extends Omit<
    FireuxMetaOperation,
    'workspace' | 'capabilityFamilies'
  > & { slug: keyof typeof supplierCapabilityFamilies },
>(
  operation: T
) => ({
  ...operation,
  workspace: supplierWorkspace,
  capabilityFamilies: supplierCapabilityFamilies[operation.slug],
})

export const supplierOperations = [
  defineSupplierOperation({
    id: 'supplier.catalogue',
    slug: 'catalogue',
    title: 'Catalogue',
    description: 'View the selected supplier catalogue.',
    to: '/workspace/supplier/catalogue',
    icon: 'i-lucide-library',
  }),
  defineSupplierOperation({
    id: 'supplier.ingredients',
    slug: 'ingredients',
    title: 'Ingredients',
    description: 'View ingredients connected to the selected supplier.',
    to: '/workspace/supplier/ingredients',
    icon: 'i-lucide-wheat',
  }),
  defineSupplierOperation({
    id: 'supplier.items',
    slug: 'items',
    title: 'Items',
    description: 'View items connected to the selected supplier.',
    to: '/workspace/supplier/items',
    icon: 'i-lucide-package-open',
  }),
] satisfies FireuxMetaOperation[]
