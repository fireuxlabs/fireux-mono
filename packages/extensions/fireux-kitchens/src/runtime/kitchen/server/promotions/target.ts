import {
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
export const kitchenPromotionsTarget = (kitchenId: string) =>
  defineFirestoreMutationTarget({
    key: 'kitchens.promotions',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${assertFirestoreMutationSegment(kitchenId, 'kitchenId')}/promotions`,
  })
