import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverAppChildTarget } from 'fireux-core/runtime/utils/firestore-mutations/server-targets'

const verbs = ALL_FIRESTORE_MUTATION_VERBS

export const supplierRootTarget = defineFirestoreMutationTarget({
  key: 'project.suppliers',
  lane: 'server',
  verbs,
  database: { kind: 'runtime' },
  collectionPath: 'suppliers',
})
export const serverAppSuppliersTarget = (appId: string) =>
  serverAppChildTarget(appId, 'apps.suppliers', 'suppliers')
export const serverSupplierItemsTarget = (supplierId: string) => {
  const supplier = assertFirestoreMutationSegment(supplierId, 'supplierId')
  return defineFirestoreMutationTarget({
    key: 'suppliers.items',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `suppliers/${supplier}/items`,
  })
}
