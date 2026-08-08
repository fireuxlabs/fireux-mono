import type { FirestoreMutationTarget } from '../../../../types/firestore-mutations'
import { useClientUpdate } from '../mutations/useClientUpdate'

export type UseFirestoreClientUpdateOptions = {
  stamp?: boolean
}

type UpdateOpts = UseFirestoreClientUpdateOptions

export function useFirestoreClientUpdate() {
  const legacyUpdateDocument = useClientUpdate()

  async function updateDocument<T>(
    target: FirestoreMutationTarget<string, 'client'>,
    id: string,
    data: Partial<T>,
    _opts: UpdateOpts = {}
  ): Promise<void> {
    return legacyUpdateDocument(target, id, data as any, _opts)
  }

  return { updateDocument }
}
