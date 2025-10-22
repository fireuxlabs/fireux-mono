import { useFirestoreRead } from './useFirestoreRead'
import { useFirestoreCreate } from './useFirestoreCreate'
import { useFirestoreUpdate } from './useFirestoreUpdate'
import { useFirestoreDelete } from './useFirestoreDelete'
import { useFirestoreUtils } from '../utils/useFirestoreUtils'

/**
 * Bundles CRUD helpers and shared utilities for convenience.
 * Downstream code can still import the granular composables when needed.
 */
export function useFirestoreManager() {
  const read = useFirestoreRead()
  const create = useFirestoreCreate()
  const update = useFirestoreUpdate()
  const deletion = useFirestoreDelete()
  const utils = useFirestoreUtils()

  return {
    ...read,
    ...create,
    ...update,
    ...deletion,
    ...utils,
  }
}
