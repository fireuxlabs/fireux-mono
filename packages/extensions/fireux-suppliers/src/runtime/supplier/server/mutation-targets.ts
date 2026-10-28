import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export const SUPPLIER_MUTATION_TARGETS = Object.freeze({
  suppliers: defineFirestoreMutationTarget({
    key: 'project.suppliers',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'suppliers',
  }),
})

export const serverSupplierItemsTarget = (supplierId: string) => {
  const supplier = segment(supplierId, 'supplierId')
  return defineFirestoreMutationTarget({
    key: 'suppliers.items',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `suppliers/${supplier}/items`,
  })
}

export const serverSupplierTeamMembersTarget = (supplierId: string) => {
  const supplier = segment(supplierId, 'supplierId')
  return defineFirestoreMutationTarget({
    key: 'suppliers.team',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `suppliers/${supplier}/team`,
  })
}
