import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useMediaStorage } from '../../firebase/useMediaStorage'
import type { CoreUser } from '../../../models/coreUser.model'
import { useFirestoreManager } from '../useFirestoreManager'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useAppUserEnsure } from '../AppUser/useAppUserEnsure'
import { useFireUXConfig } from '../../FireUXConfig'

export function useCoreUserEnsure() {
  /**
   * Ensures a core user exists for the current authenticated user
   */
  async function ensureCoreUser() {
    try {
      // Wait for current user to be available
      const { waitForCurrentUser } = useFirestoreManager()
      const user = await waitForCurrentUser()

      if (!user || !user.uid) {
        console.warn('⚠️ [ensureCoreUser] No current user found after waiting')
        return
      }

      const uid = user.uid
      const db = useFirestore()
      const coreUserRef = doc(db, 'core-users', uid)

      // Check if core user already exists
      const coreUserDoc = await getDoc(coreUserRef)

      if (coreUserDoc.exists()) {
        console.log(`✅ [ensureCoreUser] Core user ${uid} exists`)
        return
      }

      // Create new core user with all required fields
      const { uploadUserAvatar } = useMediaStorage()
      const { setDocument } = useFirestoreCreate()
      const { appId } = useFireUXConfig()

      const avatar =
        user.photoURL || (await uploadUserAvatar('img/default-avatar.png', uid))

      const coreUserData: Partial<CoreUser> = {
        id: uid,
        email: user.email || '', // Should always exist from auth
        avatar, // Always guaranteed to have a value
        adminOf: [],
        userOf: [],
        created_in: appId || 'unknown', // Track which app this user was created in
      }

      // Use setDocument from useFirestoreCreate to automatically add timestamps
      await setDocument('core-users', uid, coreUserData)
      console.log(`✅ [ensureCoreUser] Created new core user ${uid}`)

      // Call ensureAppUser with the core user data
      const ensureAppUser = useAppUserEnsure()
      await ensureAppUser(coreUserData)
    } catch (error) {
      console.error(`❌ [ensureCoreUser] Error: ${error}`)
    }
  }

  return { ensureCoreUser }
}
