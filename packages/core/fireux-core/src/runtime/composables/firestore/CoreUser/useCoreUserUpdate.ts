import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore'
import { useCurrentUser, useFirestore } from 'vuefire'
import type { CoreUser } from '../../../models/core/coreUser.model'

// tiny validators/formatters
const isUrl = (s: string) => /^https?:\/\//i.test(s) || s.startsWith('/')
const normHandle = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '-')

export function useCoreUserUpdate() {
  const db = useFirestore()
  const authUserRef = useCurrentUser()

  const coreRef = (uid?: string) => {
    const id = uid || authUserRef.value?.uid
    if (!id) throw new Error('No UID available for CoreUser update.')
    return doc(db, 'core-users', id)
  }

  // Strip undefined/null (and empty strings) and always set updated_at
  const safePayload = (
    updates: Partial<CoreUser> | Record<string, unknown>
  ) => {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(updates || {})) {
      if (v === undefined || v === null) continue
      if (typeof v === 'string' && v.trim() === '') continue
      if (k === 'email') continue // immutable here; update via Auth and ensure
      out[k] = v
    }
    out.updated_at = serverTimestamp()
    return out
  }

  async function addUserApp(appId: string, uid?: string) {
    if (!appId) throw new Error('appId required')
    await updateDoc(coreRef(uid), {
      userOf: arrayUnion(appId),
      updated_at: serverTimestamp(),
    })
  }

  async function removeUserApp(appId: string, uid?: string) {
    if (!appId) throw new Error('appId required')
    await updateDoc(coreRef(uid), {
      userOf: arrayRemove(appId),
      updated_at: serverTimestamp(),
    })
  }

  async function addAdminApp(appId: string, uid?: string) {
    if (!appId) throw new Error('appId required')
    await updateDoc(coreRef(uid), {
      adminOf: arrayUnion(appId),
      updated_at: serverTimestamp(),
    })
  }

  async function removeAdminApp(appId: string, uid?: string) {
    if (!appId) throw new Error('appId required')
    await updateDoc(coreRef(uid), {
      adminOf: arrayRemove(appId),
      updated_at: serverTimestamp(),
    })
  }

  async function updateCoreUser(
    updates: Partial<CoreUser> & Record<string, any>,
    uid?: string
  ) {
    // light normalization/validation
    if ('handle' in updates && typeof updates.handle === 'string') {
      updates.handle = normHandle(updates.handle)
    }
    if ('avatar' in updates && typeof updates.avatar === 'string') {
      const url = updates.avatar
      if (!isUrl(url)) throw new Error('Invalid avatar URL')
    }
    await updateDoc(coreRef(uid), safePayload(updates))
  }

  // Convenience helpers
  const setDisplayName = (display_name: string, uid?: string) =>
    updateCoreUser({ display_name }, uid)

  const setAvatar = (avatarUrl: string, uid?: string) =>
    updateCoreUser({ avatar: avatarUrl }, uid)

  const setHandle = (handle: string, uid?: string) =>
    updateCoreUser({ handle }, uid)

  // Optional: profiles (global badges)
  const setProfiles = (profiles: string[], uid?: string) =>
    updateCoreUser({ profiles }, uid)

  return {
    updateCoreUser,
    setDisplayName,
    setAvatar,
    setHandle,
    setProfiles,
    addUserApp,
    removeUserApp,
    addAdminApp,
    removeAdminApp,
  }
}
