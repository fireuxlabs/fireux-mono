import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { App } from '../../models/core/app.model'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreManager } from '../firestore/useFirestoreManager'
import { useImageStorage } from '../firebase/useImageStorage'

/**
 * Composable to ensure an app exists in Firestore
 * - Creates the app if it doesn't exist
 * - Updates the core user as an admin
 */
export function useAppEnsure() {
  /**
   * Ensures an app exists for the current configuration
   * @param coreUser Optional core user object to use instead of fetching the current user
   * @returns The app ID if successful
   */
  async function ensureApp(coreUser?: any) {
    console.log('🚀 [ensureApp] Function invoked.')

    // Ensure this only runs on the client side
    if (!import.meta.client) {
      console.log('🚫 [ensureApp] Skipping on server side')
      return null
    }

    try {
      // Step 1: Get user data (either provided or from auth)
      const { setDocument } = useFirestoreManager()
      let uid: string

      if (coreUser?.id) {
        // Use the provided core user
        uid = coreUser.id
        console.log(`✅ [ensureApp] Using provided core user: ${uid}`)
      } else {
        // Get the current authenticated user
        const { waitForCurrentUser } = useFirestoreManager()
        const currentUser = await waitForCurrentUser()

        if (!currentUser?.uid) {
          throw new Error('No authenticated user found')
        }

        uid = currentUser.uid
        console.log(`✅ [ensureApp] Using authenticated user: ${uid}`)
      }

      // Step 2: Get app configuration
      const { appId, appName, ecosystem, modules, role } = useFireUXConfig()
      const db = useFirestore()

      console.log(
        `🔍 [ensureApp] Detected modules: ${
          Array.isArray(modules) ? modules.join(', ') : ''
        }`
      )
      console.log(`🔍 [ensureApp] Detected ecosystem: ${ecosystem ?? 'none'}`)

      // Step 3: Check if app already exists
      const appDocRef = doc(db, 'apps', appId)
      const appSnapshot = await getDoc(appDocRef)

      if (appSnapshot.exists()) {
        const appData = appSnapshot.data() as App
        const createdAt =
          typeof appData.created_at === 'string'
            ? appData.created_at
            : 'unknown date'
        console.log(
          `✅ [ensureApp] App '${appId}' already exists. Created on ${createdAt}.`
        )
        return appId
      }

      // Step 4: Prepare default avatar in Storage (best-effort)
      const avatarUrl = await prepareDefaultAppAvatar(appId)

      // Step 5: Create the app if it doesn't exist
      const appData: Partial<App> = {
        id: appId,
        app_name: appName,
        admin_ids: [uid],
        creator_id: uid,
        // Reflect current role: tenant apps mark is_tenant=true; global/platform mark false
        is_tenant: String(role || '').toLowerCase() === 'tenant',
        ...(ecosystem ? { ecosystem } : {}), // Add ecosystem if detected from modules
        ...(avatarUrl ? { avatarUrl } : {}),
        created_at: new Date().toISOString(),
      }

      // Write the app document without automatic stamping (explicit system fields already set)
      await setDocument('apps', appId, appData, { raw: true })
      console.log(
        `🎉 [ensureApp] App '${appId}' created successfully with ecosystem: ${
          ecosystem ?? 'none'
        }`
      )

      // Step 6: Update core user with admin role
      if (coreUser?.adminOf?.includes(appId)) {
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

      return appId
    } catch (error) {
      console.error('❌ [ensureApp] Error occurred:', error)
      throw error
    }
  }

  /** Best-effort default app avatar upload. Returns a URL or undefined on failure. */
  async function prepareDefaultAppAvatar(
    appId: string
  ): Promise<string | undefined> {
    try {
      const { uploadImage, getDefaultImageUrl } = useImageStorage()
      const url = await uploadImage(
        `apps/${appId}/avatar.jpg`,
        getDefaultImageUrl()
      )
      if (url) console.log('🖼️ [ensureApp] App avatar uploaded to Storage')
      return url || undefined
    } catch (e) {
      console.warn('⚠️ [ensureApp] Failed to upload default app avatar:', e)
      return undefined
    }
  }

  return { ensureApp }
}
