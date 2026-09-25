import {
  defineFirestoreMutationTarget,
  ALL_FIRESTORE_MUTATION_VERBS,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
export function serverKitchenSellablesTarget(kitchenId: string) {
  return defineFirestoreMutationTarget({
    key: 'kitchens.sellables',
    lane: 'server',
    verbs: ALL_FIRESTORE_MUTATION_VERBS,
    database: { kind: 'runtime' },
    collectionPath: `kitchens/${requireFirestoreDocumentId(kitchenId, 'Kitchen id')}/sellables`,
  })
}
