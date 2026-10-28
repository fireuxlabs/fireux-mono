import {
  ALL_FIRESTORE_MUTATION_VERBS,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS

export const PLACE_MUTATION_TARGETS = Object.freeze({
  companies: defineFirestoreMutationTarget({
    key: 'project.companies',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'companies',
  }),
  places: defineFirestoreMutationTarget({
    key: 'project.places',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'places',
  }),
})
