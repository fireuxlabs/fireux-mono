import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { AppUser } from '../../../models/core/appUser.model'
import { useFireUXConfig } from '../../FireUXConfig'
import { useFirestoreCreate } from '../useFirestoreCreate'
import { useFirestoreManager } from '../useFirestoreManager'

export function useAppUserEnsure() {
  /**
   * Ensure an AppUser exists for the current auth user in the current app.
   * - Writes ONLY tenant-scoped state (role, profiles?) to apps/{appId}/users/{uid}
   * - Ensures CoreUser exists and updates core-users/{uid}.userOf += appId
   */
  async function ensureAppUser(coreUser?: {
    id: string
    email?: string
    profiles?: string[]
  }): Promise<void> {
    console.log('🚀 [ensureAppUser] start')

    const { appId } = useFireUXConfig()
    if (!appId) {
      console.warn('⚠️ [ensureAppUser] No appId in config')
      return
    }

    const { waitForCurrentUser } = useFirestoreManager()
    const authUser = await waitForCurrentUser()
    const uid = authUser?.uid
    if (!uid) {
      console.warn('⚠️ [ensureAppUser] No authenticated user')
      return
    }

    // 1) Ensure CoreUser exists (if caller didn’t pass it)
    if (!coreUser) {
      const { useCoreUserEnsure } = await import(
        '../CoreUser/useCoreUserEnsure'
      )
      const { ensureCoreUser } = useCoreUserEnsure()
      await ensureCoreUser()
    }

    const db = useFirestore()

    // 2) Verify app exists
    const appRef = doc(db, 'apps', appId)
    const appSnap = await getDoc(appRef)
    if (!appSnap.exists()) {
      console.warn(`❌ [ensureAppUser] App '${appId}' not found`)
      return
    }
    const app = appSnap.data() as { admin_ids?: string[] }

    // 3) If app user already exists, we're done
    const appUserRef = doc(db, `apps/${appId}/users`, uid)
    const appUserSnap = await getDoc(appUserRef)
    if (appUserSnap.exists()) {
      console.log(`✅ [ensureAppUser] AppUser already exists for ${appId}`)
      return
    }

    // 4) Build tenant payload (minimal + compatibility mirrors)
    const role: AppUser['role'] = app?.admin_ids?.includes(uid)
      ? 'admin'
      : 'user'

    // Load core user to mirror select fields for compatibility
    const coreUserRef = doc(db, 'core-users', uid)
    const coreSnap = await getDoc(coreUserRef)
    const coreData = (coreSnap.exists() ? (coreSnap.data() as any) : null) || {}

    const payload: Partial<AppUser> & Record<string, any> = {
      id: uid,
      role,
      // Optional: seed tenant profiles from core (safe to omit)
      // profiles: coreUser?.profiles ?? [],
      // Compatibility mirrors for existing consumers (keep non-sensitive)
      uid, // duplicate id for older UIs expecting `uid`
      appId, // some UIs query/render this field
      avatar: coreData.avatar,
      // Do NOT mirror email into tenant scope. Avoid setting display_name unless present; never fallback to email.
      ...(coreData.display_name ? { display_name: coreData.display_name } : {}),
    }

    // 5) Create app user (adds created_at/updated_at)
    const { setDocument } = useFirestoreCreate()
    await setDocument(`apps/${appId}/users`, uid, payload)
    console.log(`✅ [ensureAppUser] Created AppUser in ${appId}`)

    // 6) Update CoreUser.userOf
    const coreRef = doc(db, 'core-users', uid)
    await updateDoc(coreRef, { userOf: arrayUnion(appId) })
    console.log(`✅ [ensureAppUser] Added '${appId}' to CoreUser.userOf`)
  }

  return { ensureAppUser }
}
