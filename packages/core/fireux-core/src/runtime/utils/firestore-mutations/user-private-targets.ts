import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from './target-definition'

function serverUserPrivateTarget(userId: string, key: string) {
  const id = assertFirestoreMutationSegment(userId, 'userId')
  return defineFirestoreMutationTarget({
    key,
    lane: 'server',
    verbs: ALL_FIRESTORE_MUTATION_VERBS,
    database: { kind: 'identity' },
    collectionPath: `users/${id}/private`,
  })
}

export const serverUserAccountTarget = (userId: string) =>
  serverUserPrivateTarget(userId, 'users.private.account')

export const serverUserContextTarget = (userId: string) =>
  serverUserPrivateTarget(userId, 'users.private.context')
