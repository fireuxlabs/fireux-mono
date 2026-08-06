import {
  assertFirestoreMutationVerb,
  resolveFirestoreMutationDatabaseId,
} from '../../../utils/firestore-mutations/targets'
import type {
  FirestoreMutationTarget,
  FirestoreMutationVerb,
} from '../../../types/firestore-mutations'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../getRuntimeFirestore'

export function resolveServerMutationRef(
  target: FirestoreMutationTarget<string, 'server', FirestoreMutationVerb>,
  verb: FirestoreMutationVerb,
  id: string
) {
  assertFirestoreMutationVerb(target, 'server', verb)
  const db =
    target.database.kind === 'identity'
      ? getRuntimeIdentityFirestore()
      : getRuntimeFirestore(resolveFirestoreMutationDatabaseId(target))
  return db.collection(target.collectionPath).doc(id)
}
