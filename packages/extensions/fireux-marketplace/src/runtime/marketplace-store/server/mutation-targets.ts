import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export const serverMarketplaceStoresTarget = defineFirestoreMutationTarget({
  key: 'marketplace-stores',
  lane: 'server',
  verbs,
  database: { kind: 'runtime' },
  collectionPath: 'marketplace-stores',
})

export const serverMarketplaceStoreTeamMembersTarget = (storeId: string) => {
  const store = segment(storeId, 'storeId')
  return defineFirestoreMutationTarget({
    key: 'marketplace-stores.team',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `marketplace-stores/${store}/team`,
  })
}
