import type { DocumentData, UpdateData } from 'firebase-admin/firestore'
import type { FirestoreMutationTarget } from '../../../types/firestore-mutations'
import { resolveServerMutationRef } from './server-common'

export async function serverUpdate<T extends DocumentData>(
  target: FirestoreMutationTarget<string, 'server'>,
  id: string,
  data: UpdateData<T>
): Promise<void> {
  await resolveServerMutationRef(target, 'update', id).update(data)
}
