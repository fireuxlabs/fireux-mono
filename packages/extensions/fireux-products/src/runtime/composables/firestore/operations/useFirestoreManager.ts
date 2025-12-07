import { useFirestoreManager as useCoreFirestoreManager } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreManager'

// Thin wrapper to reuse the core Firestore manager from fireux-core.
export function useFirestoreManager() {
  return useCoreFirestoreManager()
}
