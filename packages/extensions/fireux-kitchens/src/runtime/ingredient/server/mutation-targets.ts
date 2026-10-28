import {
  ALL_FIRESTORE_MUTATION_VERBS,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS

export const INGREDIENT_MUTATION_TARGETS = Object.freeze({
  ingredients: defineFirestoreMutationTarget({
    key: 'project.ingredients',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: 'ingredients',
  }),
})
