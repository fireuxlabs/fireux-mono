import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { AppDoc, AppRole, AppDefaults } from '../../models/core/app.model'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreManager } from '../firestore/useFirestoreManager'

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
    if (!import.meta.client) return null

    const { setDocument, waitForCurrentUser } = useFirestoreManager()
    const uid = await resolveActorId(coreUser, waitForCurrentUser)

    const {
      appId,
      appName,
      appShortName,
      ecosystem,
      role,
      globalAppId,
      primaryColor,
      neutralColor,
    } = useFireUXConfig()

    const db = useFirestore()
    const normalizedRole = (role === 'global' ? 'global' : 'tenant') as AppRole
    let targetAppId = appId

    if (normalizedRole === 'global') {
      targetAppId = globalAppId || appId
      if (!targetAppId && ecosystem) {
        targetAppId = `${ecosystem}-app`
      }
    }

    if (!targetAppId) {
      throw new Error(
        'Missing app identifier. Set APP_ID or configure ecosystem.'
      )
    }

    const snapshot = await getDoc(doc(db, 'apps', targetAppId))
    if (snapshot.exists()) return targetAppId

    const payload = buildAppPayload({
      appId: targetAppId,
      appName,
      appShortName,
      ecosystem,
      role: normalizedRole,
      uid,
      primaryColor,
      neutralColor,
    })

    await setDocument('apps', targetAppId, payload, { raw: true })
    await ensureCoreUserAdmin(db, uid, targetAppId, coreUser)

    return targetAppId
  }

  async function resolveActorId(
    coreUser: any,
    waitForCurrentUser: () => Promise<any>
  ) {
    if (coreUser?.id) return coreUser.id

    const currentUser = await waitForCurrentUser()
    if (!currentUser?.uid) {
      throw new Error('No authenticated user found')
    }

    return currentUser.uid
  }

  function buildAppPayload(params: {
    appId: string
    appName: string
    appShortName?: string
    ecosystem?: string
    role: AppRole
    uid: string
    primaryColor?: string
    neutralColor?: string
  }): Partial<AppDoc> {
    const {
      appId,
      appName,
      appShortName,
      ecosystem,
      role,
      uid,
      primaryColor,
      neutralColor,
    } = params

    if (!ecosystem) {
      throw new Error('Missing ecosystem configuration for app creation.')
    }

    const payload: Partial<AppDoc> = {
      id: appId,
      app_name: appName,
      role,
      ecosystem,
      admin_ids: [uid],
      creator_id: uid,
    }

    if (appShortName) {
      payload.app_short_name = appShortName
    }

    if (role === 'global') {
      const brand: AppDefaults['brand'] | undefined =
        primaryColor || neutralColor
          ? {
              ...(primaryColor ? { primary: primaryColor } : {}),
              ...(neutralColor ? { neutral: neutralColor } : {}),
            }
          : undefined

      if (brand) {
        payload.defaults = { brand }
      }
    }

    return payload
  }

  async function ensureCoreUserAdmin(
    db: Firestore,
    uid: string,
    appId: string,
    coreUser?: any
  ) {
    if (coreUser?.adminOf?.includes(appId)) return

    const coreUserRef = doc(db, 'core-users', uid)
    await updateDoc(coreUserRef, {
      adminOf: arrayUnion(appId),
    })
  }

  return { ensureApp }
}
