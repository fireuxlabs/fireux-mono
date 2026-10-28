import {
  ALL_FIRESTORE_MUTATION_VERBS,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS

export const serverShareProfilesTarget = defineFirestoreMutationTarget({
  key: 'share-profiles',
  lane: 'server',
  verbs,
  database: { kind: 'runtime' },
  collectionPath: 'share_profiles',
})
