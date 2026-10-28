import {
  ALL_FIRESTORE_MUTATION_VERBS,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS

export const PRODUCT_MUTATION_TARGETS = Object.freeze({
  products: defineFirestoreMutationTarget({
    key: 'project.products',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'products',
  }),
})
