import {
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

/** Supplier access is scoped to one App and one lifetime of its membership. */
export const supplierAccessCollection = (appId: string) =>
  `supplier_access/${assertFirestoreMutationSegment(appId, 'App id')}/users`

export const serverSupplierAccessTarget = (appId: string) =>
  defineFirestoreMutationTarget({
    key: 'supplier.access',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: supplierAccessCollection(appId),
  })
