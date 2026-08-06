import type { DocumentData } from 'firebase-admin/firestore'
import type { FirestoreMutationTarget } from '../../../types/firestore-mutations'
import { resolveServerMutationRef } from './server-common'

export async function serverCreate<T extends DocumentData>(
  target: FirestoreMutationTarget<string, 'server'>,
  id: string,
  data: T
): Promise<void> {
  const payload = { ...data }
  delete payload.id
  await resolveServerMutationRef(target, 'create', id).create(payload)
}
