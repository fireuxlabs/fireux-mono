import { computed } from 'vue'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useFirestoreRead } from '../../../composables/fireux/firestore/operations/useFirestoreRead'
import { readRuntimeIdentityFirestoreDatabaseId } from '../../../composables/fireux/firestore/vuefire'
import type { UserAccount } from '../../models/user-account.model'

/** Live owner-only account document for the signed-in User. */
export function useUserAccount() {
  const { currentUser } = useAuth()
  const uid = computed(() =>
    currentUser.value?.isAnonymous
      ? ''
      : String(currentUser.value?.uid || '').trim()
  )
  const collectionPath = computed(() =>
    uid.value ? `users/${uid.value}/private` : ''
  )
  const { firestoreFetchDoc } = useFirestoreRead({
    databaseId: readRuntimeIdentityFirestoreDatabaseId(),
  })
  const account = firestoreFetchDoc<UserAccount>(collectionPath, 'account')

  return {
    account: computed(() =>
      account.pending.value || account.error.value
        ? null
        : (account.value ?? null)
    ),
    pending: account.pending,
    error: account.error,
    outcome: account.outcome,
  }
}
