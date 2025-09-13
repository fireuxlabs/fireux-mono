// ~/composables/useAppUserUpdate.ts
import { doc, updateDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreUtils } from '../useFirestoreUtils'

// tiny helpers
const toStringArray = (arr: unknown): string[] =>
  Array.isArray(arr)
    ? Array.from(
        new Set(
          arr
            .filter((v): v is string => typeof v === 'string')
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        )
      )
    : []

export function useAppUserUpdate() {
  const db = useFirestore()
  const { appId } = useFireUXConfig()
  const { waitForCurrentUser } = useFirestoreUtils()

  const getRef = async () => {
    const user = await waitForCurrentUser()
    if (!user) throw new Error('User not authenticated')
    if (!appId) throw new Error('Missing appId')
    return doc(db, `apps/${appId}/users`, user.uid)
  }

  // --- Tenant-scoped updates only (AppUser is membership-only) ---
  // Identity fields (display_name, handle, avatar, email) live on CoreUser.

  async function setProfiles(profiles: unknown) {
    const ref = await getRef()
    const value = toStringArray(profiles)
    await updateDoc(ref, { profiles: value })
    return { success: true, profiles: value }
  }

  // Back-compat updater used by legacy callers that manage an array of
  // profile entry objects: { type, collection, is_active, created_at }
  // We persist the array as-is under AppUser.profiles.
  function useAppUserUpdateFirestore() {
    async function updateProfiles(profiles: unknown[]) {
      const ref = await getRef()
      await updateDoc(ref, { profiles })
      return { success: true, profiles }
    }
    return { updateProfiles }
  }

  // NOTE:
  // - Email is canonical on CoreUser → update via a CoreUser updater (and Auth).
  // - Role, timestamps are system-managed.
  // - If you later add optional fields (e.g., bio), create a tiny updater per field.

  return {
    setProfiles,
    useAppUserUpdateFirestore,
  }
}

export default useAppUserUpdate
