import {
  ALL_FIRESTORE_MUTATION_VERBS,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS

export const SPROOCHLI_MUTATION_TARGETS = Object.freeze({
  sproochliMenuTranslationCaches: defineFirestoreMutationTarget({
    key: 'sproochli.menu-translation-caches',
    lane: 'server',
    verbs,
    database: { kind: 'local-sproochli', databaseId: 'sproochli' },
    collectionPath: 'menu_translation_caches',
  }),
  sproochliTranslationMemory: defineFirestoreMutationTarget({
    key: 'sproochli.translation-memory',
    lane: 'server',
    verbs,
    database: { kind: 'local-sproochli', databaseId: 'sproochli' },
    collectionPath: 'translation_memory',
  }),
})
