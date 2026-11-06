import {
  defineFirestoreMutationTarget,
  ALL_FIRESTORE_MUTATION_VERBS,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { FIREUX_MUTATION_TARGETS as projectAppTargets } from 'fireux-projects/runtime/project/server/app-targets'
export { fireuxAppUsersTarget } from 'fireux-projects/runtime/project/server/app-targets'

export const FIREUX_MUTATION_TARGETS = Object.freeze({
  ...projectAppTargets,
  fireuxEcosystems: defineFirestoreMutationTarget({
    key: 'fireux.ecosystems',
    lane: 'server',
    verbs: ALL_FIRESTORE_MUTATION_VERBS,
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: 'ecosystems',
  }),
})
