import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useAppUserUtils } from './useAppUserUtils'
import type { AppUser } from '../../../models/appUser.model'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useFirestoreManager } from '../useFirestoreManager'
import { useMediaStorage } from '../../firebase/useMediaStorage'

export function useAppUserEnsure() {
  /**
   * Ensures an app user exists for the current authenticated user and app
   * @param coreUser Optional core user object to use instead of fetching from Firestore
   */
  async function ensureAppUser(coreUser?: any): Promise<void> {
    try {
      console.log('🚀 [ensureAppUser] Function invoked.')

      // Get app ID
      const { appId } = useFireUXConfig()
      if (!appId) {
        console.warn('⚠️ [ensureAppUser] No app ID configured')
        return
      }

      // Wait for current user to be available
      const { waitForCurrentUser } = useFirestoreManager()
      const user = await waitForCurrentUser()

      if (!user || !user.uid) {
        console.warn('⚠️ [ensureAppUser] No current user found after waiting')
        return
      }

      const uid = user.uid

      // First, ensure a core user exists if not provided
      if (!coreUser) {
        // Dynamically import useCoreUserEnsure to avoid circular dependency
        const { useCoreUserEnsure } = await import(
          '../CoreUser/useCoreUserEnsure'
        )
        const { ensureCoreUser } = useCoreUserEnsure()
        await ensureCoreUser()
      }

      const db = useFirestore()

      // Check if app exists
      const appRef = doc(db, 'apps', appId)
      const appDoc = await getDoc(appRef)

      if (!appDoc.exists()) {
        console.warn(`❌ [ensureAppUser] App [${appId}] does not exist`)
        return
      }

      const app = appDoc.data()

      // Check if app user already exists in the new path
      const appUserRef = doc(db, `apps/${appId}/users`, uid)
      const appUserDoc = await getDoc(appUserRef)

      if (appUserDoc.exists()) {
        console.log(`✅ [ensureAppUser] App user exists for ${appId}`)
        return
      }

      // Get core user info if not provided
      let coreUserData = coreUser
      if (!coreUserData) {
        const coreUserRef = doc(db, 'core-users', uid)
        const coreUserDoc = await getDoc(coreUserRef)

        if (!coreUserDoc.exists()) {
          console.warn(`❌ [ensureAppUser] Core user [${uid}] not found`)
          return
        }

        coreUserData = coreUserDoc.data()
        if (!coreUserData) {
          console.warn(
            `❌ [ensureAppUser] Core user data for [${uid}] is empty`
          )
          return
        }
      }

      // Create new app user using strong CoreUser data
      const { generateHandle } = useAppUserUtils()
      const { setDocument } = useFirestoreCreate()

      const appUserData: Partial<AppUser> = {
        uid,
        email: coreUserData.email, // CoreUser always has email
        role: app.admin_ids?.includes(uid) ? 'admin' : 'user',
        display_name: coreUserData.email, // Use email as display name initially
        avatar: coreUserData.avatar, // CoreUser always has avatar (from photoURL or uploaded default)
        handle: generateHandle(coreUserData.email),
        bio: '',
      }

      // Use setDocument from useFirestoreCreate to automatically add timestamps
      await setDocument(`apps/${appId}/users`, uid, appUserData)
      console.log(`✅ [ensureAppUser] Created app user for ${appId}`)

      // Update core user's userOf array
      const coreUserRef = doc(db, 'core-users', uid)
      await updateDoc(coreUserRef, {
        userOf: arrayUnion(appId),
      })

      console.log(
        `✅ [ensureAppUser] Added ${appId} to core user's userOf array`
      )
    } catch (error) {
      console.error(`❌ [ensureAppUser] Error: ${error}`)
    }
  }

  // Export the function directly instead of returning an object
  return ensureAppUser
}
