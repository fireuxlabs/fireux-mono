import { defineFirestoreMutationTarget } from '../../utils/firestore-mutations/target-definition'
import { projectAccessCollectionPath } from '../utils/project-access'

export function serverProjectAccessTarget(appId: string) {
  return defineFirestoreMutationTarget({
    key: 'fireux.project-access',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'named', databaseId: 'fireux' },
    collectionPath: projectAccessCollectionPath(appId),
  })
}
