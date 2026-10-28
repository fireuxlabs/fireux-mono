import {
  ALL_FIRESTORE_MUTATION_VERBS,
  defineFirestoreMutationTarget,
} from '../../utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS

export const ECOSYSTEM_MUTATION_TARGETS = Object.freeze({
  ecosystems: defineFirestoreMutationTarget({
    key: 'ecosystems',
    lane: 'server',
    verbs,
    database: { kind: 'identity' },
    collectionPath: 'ecosystems',
  }),
})
