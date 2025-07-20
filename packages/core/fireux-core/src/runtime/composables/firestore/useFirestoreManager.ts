// ~/composables/useFirestoreManager.ts

import { useFirestoreRead } from './useFirestoreRead'
import { useFirestoreCreate } from './useFirestoreCreate'
import { useFirestoreUpdate } from './useFirestoreUpdate'
import { useFirestoreDelete } from './useFirestoreDelete'
import { useFirestoreUtils } from './useFirestoreUtils'

export function useFirestoreManager() {

  try {
    const firestoreRead = useFirestoreRead()
    const firestoreCreate = useFirestoreCreate()
    const firestoreUpdate = useFirestoreUpdate()
    const firestoreDelete = useFirestoreDelete()
    const firestoreUtils = useFirestoreUtils()

    return {
      ...firestoreRead,
      ...firestoreCreate,
      ...firestoreUpdate,
      ...firestoreDelete,
      ...firestoreUtils,
    }
  } catch (error) {
    console.error('Error initializing Firestore Manager:', error)
    throw error
  }
}
