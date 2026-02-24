// Action: ENSURE · Phases: 1–4
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import type { AppUser, User } from '../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { requireUid } from '../../../utils/useEnsureCommon'

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+$/.test(value)
}

function toPublicDisplayNameSeed(
  displayName?: string | null,
  email?: string | null
): string {
  const primary = String(displayName ?? '').trim()
  if (primary) {
    return looksLikeEmail(primary) ? primary.split('@')[0]?.trim() || '' : primary
  }

  const fallback = String(email ?? '').trim()
  if (!fallback) return ''
  return looksLikeEmail(fallback) ? fallback.split('@')[0]?.trim() || '' : fallback
}

export function useUserEnsure() {
  const db = useFirestore()
  const { setDocument } = useFirestoreCreate()

  async function ensureUser(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    const { uid, auth } = await requireUid()
    const { appId } = useFireUXConfig()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, 'users', uid)
    const coreSnap = await getDoc(coreRef)
    if (!coreSnap.exists()) {
      const payload = {
        id: uid,
        display_name: toPublicDisplayNameSeed(auth.displayName, auth.email),
        email: auth.email ?? '',
        avatar: auth.photoURL ?? '',
        handle: '',
        bio: '',
        profiles: [],
        userOf: [],
        adminOf: [],
        notifications: [],
      } as Omit<User, 'created' | 'updated'>

      await setDocument<User>('users', uid, payload as User, {
        creator: 'require',
        legacyFlat: false,
      } as any)
      createdCore = true
    }

    const appCollection = `apps/${appId}/users`
    const appRef = doc(db, 'apps', appId, 'users', uid)
    const appSnap = await getDoc(appRef)
    if (!appSnap.exists()) {
      const payload = {
        id: uid,
        role: 'user',
        notifications: [],
      } as Omit<AppUser, 'created' | 'updated'>

      await setDocument<AppUser>(appCollection, uid, payload as AppUser, {
        creator: 'require',
        legacyFlat: false,
      } as any)
      createdApp = true
    }

    return { createdCore, createdApp, id: uid }
  }

  return { ensureUser }
}
