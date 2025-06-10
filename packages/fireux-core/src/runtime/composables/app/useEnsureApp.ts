import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { useFirestore, useCurrentUser } from 'vuefire'
import type { App } from '../../models/app.model'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreManager } from '../firestore/useFirestoreManager'

/**
 * Composable to ensure an app exists in Firestore
 * - Creates the app if it doesn't exist
 * - Updates the core user as an admin
 * - Creates an app user profile for the admin
 */
export async function useAppEnsure() {
  /**
   * Ensures an app exists for the current configuration
   * @param coreUser Optional core user object to use instead of fetching the current user
   * @returns The app ID if successful
   */
  async function ensureApp(coreUser?: any) {
    console.log('🚀 [ensureApp] Function invoked.')

    try {
      // Step 1: Get user data (either provided or from auth)
      const { setDocument } = useFirestoreManager()
      let uid: string

      if (coreUser && coreUser.id) {
        // Use the provided core user
        uid = coreUser.id
        console.log(`✅ [ensureApp] Using provided core user: ${uid}`)
      } else {
        // Get the current authenticated user
        const { waitForCurrentUser } = useFirestoreManager()
        const currentUser = await waitForCurrentUser()

        if (!currentUser || !currentUser.uid) {
          throw new Error('No authenticated user found')
        }

        uid = currentUser.uid
        console.log(`✅ [ensureApp] Using authenticated user: ${uid}`)
      }

      // Step 2: Get app configuration
      const { appId, appName } = useFireUXConfig()
      const db = useFirestore()

      // Step 3: Check if app already exists
      const appDocRef = doc(db, 'apps', appId)
      const appSnapshot = await getDoc(appDocRef)

      if (appSnapshot.exists()) {
        const appData = appSnapshot.data() as App
        const createdAt = appData.created_at || 'unknown date'
        console.log(
          `✅ [ensureApp] App '${appId}' already exists. Created on ${createdAt}.`
        )
        return appId
      }

      // Step 4: Create the app if it doesn't exist
      const appData: Partial<App> = {
        id: appId,
        app_name: appName,
        admin_ids: [uid],
      }

      await setDocument('apps', appId, appData)
      console.log(`🎉 [ensureApp] App '${appId}' created successfully.`)

      // Step 5: Update core user with admin role
      if (coreUser && coreUser.adminOf && coreUser.adminOf.includes(appId)) {
        console.log(
          `✅ [ensureApp] Core user already has admin role for app '${appId}'.`
        )
      } else {
        const coreUserRef = doc(db, 'core-users', uid)
        await updateDoc(coreUserRef, {
          adminOf: arrayUnion(appId),
        })
        console.log(
          `✅ [ensureApp] Core user updated with admin role for app '${appId}'.`
        )
      }

      // Step 6: Create an app user for this admin
      await createAppUserForAdmin(coreUser)

      return appId
    } catch (error) {
      console.error('❌ [ensureApp] Error occurred:', error)
      throw error
    }
  }

  /**
   * Helper function to create an app user for the admin
   * Dynamically imports useAppUserEnsure to avoid circular dependencies
   * @param coreUser Optional core user object to pass to ensureAppUser
   */
  async function createAppUserForAdmin(coreUser?: any): Promise<void> {
    try {
      const { useAppUserEnsure } = await import(
        '../firestore/AppUser/useAppUserEnsure'
      )
      const ensureAppUser = useAppUserEnsure()
      await ensureAppUser(coreUser)
      console.log('✅ [ensureApp] Created app user for the app admin')
    } catch (appUserError) {
      console.error('❌ [ensureApp] Error creating app user:', appUserError)
      // Don't throw here, as the app has been created successfully
    }
  }

  return { ensureApp }
}
