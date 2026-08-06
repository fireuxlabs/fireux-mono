import type { FirestoreMutationTarget } from '../../../types/firestore-mutations'
import { resolveServerMutationRef } from './server-common'

export async function serverDelete(
  target: FirestoreMutationTarget<string, 'server'>,
  id: string
): Promise<void> {
  await resolveServerMutationRef(target, 'delete', id).delete()
}
