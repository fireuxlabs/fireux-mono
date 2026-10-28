import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'

const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export const FIREUX_MUTATION_TARGETS = Object.freeze({
  fireuxEcosystems: defineFirestoreMutationTarget({
    key: 'fireux.ecosystems',
    lane: 'server',
    verbs,
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: 'ecosystems',
  }),
  fireuxApps: defineFirestoreMutationTarget({
    key: 'fireux.apps',
    lane: 'server',
    verbs,
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: 'apps',
  }),
})

function fireuxAppChildTarget(appId: string, key: string, collection: string) {
  const id = segment(appId, 'appId')
  return defineFirestoreMutationTarget({
    key,
    lane: 'server',
    verbs,
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: `apps/${id}/${collection}`,
  })
}

export const fireuxAppUsersTarget = (appId: string) =>
  fireuxAppChildTarget(appId, 'fireux.apps.users', 'users')
