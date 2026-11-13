import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from '../../../utils/firestore-mutations/target-definition'
const verbs = ALL_FIRESTORE_MUTATION_VERBS
const segment = assertFirestoreMutationSegment

export function serverAppUsersTarget(appId: string) {
  const id = segment(appId, 'appId')
  return defineFirestoreMutationTarget({
    key: 'apps.users',
    lane: 'server',
    verbs,
    database: { kind: 'runtime' },
    collectionPath: `apps/${id}/users`,
  })
}
