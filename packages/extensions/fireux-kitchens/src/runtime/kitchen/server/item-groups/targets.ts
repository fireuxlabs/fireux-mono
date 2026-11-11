import {
  assertFirestoreMutationDocumentId,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
export const kitchenItemGroupsTarget = (kitchenId: string) =>
  defineFirestoreMutationTarget({
    key: 'kitchens.item-groups',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${assertFirestoreMutationDocumentId(kitchenId, 'Kitchen id')}/item-groups`,
  })
