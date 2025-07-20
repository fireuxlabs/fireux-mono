import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useAppUserUtils } from './useAppUserUtils'
import type { AppUser } from '../../../models/core/appUser.model'
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

      if (!user?.uid) {
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
      const { generateHandle, generateSlug } = useAppUserUtils()
      const { setDocument } = useFirestoreCreate()
      const { uploadUserAvatar } = useMediaStorage()

      // Generate unique slug for the user
      const slug = await generateSlug({
        display_name: coreUserData.display_name || coreUserData.email,
        handle: generateHandle(coreUserData.email),
        email: coreUserData.email,
        uid,
      })

      // Copy avatar from core-users storage to app-specific storage
      let appAvatarUrl = coreUserData.avatar // Default to core user avatar
      if (coreUserData.avatar?.includes('core-users')) {
        try {
          // Download the core user avatar and re-upload to app storage
          const response = await fetch(coreUserData.avatar)
          const blob = await response.blob()

          // Convert blob to file-like object
          const file = new File([blob], 'avatar.jpg', { type: blob.type })

          // Upload to app-specific storage using our media storage
          appAvatarUrl = await uploadUserAvatar(file, uid)
          console.log(
            `✅ [ensureAppUser] Copied avatar to app storage: ${appAvatarUrl}`
          )
        } catch (error) {
          console.warn(
            `⚠️ [ensureAppUser] Failed to copy avatar for ${uid}:`,
            error
          )
          // Keep the original core user avatar URL as fallback
        }
      }

      const appUserData: Partial<AppUser> = {
        uid,
        email: coreUserData.email, // CoreUser always has email
        role: app.admin_ids?.includes(uid) ? 'admin' : 'user',
        display_name: coreUserData.email, // Use email as display name initially
        avatar: appAvatarUrl, // Use the app-specific avatar URL
        handle: generateHandle(coreUserData.email),
        slug,
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

  // Return an object to match the pattern
  return { ensureAppUser }
}
