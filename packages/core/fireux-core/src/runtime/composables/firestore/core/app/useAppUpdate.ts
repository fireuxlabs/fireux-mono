// ~/composables/app/useAppUpdate.ts
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  type DocumentData,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'

// Model
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
// Runtime config (only used to double-check/derive id if needed)
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

type UpdateResult<A extends string, Extra extends object = {}> =
  { success: true; action: A } & Extra

export function useAppUpdate(app: App) {
  const db = useFirestore()
  const { appId: runtimeAppId } = useFireUXConfig()

  // Prefer the explicit doc id, fallback to runtime (should match in tenant scope)
  const id = app.id || runtimeAppId
  if (!id) throw new Error('[app/update] No app id available.')

  const appRef = doc(db, 'apps', id)

  // ---------------------------
  // 1) description (editable)
  // ---------------------------
  async function updateDescription(description: string): Promise<UpdateResult<'updateDescription'>> {
    const value = String(description ?? '').trim()
    await updateDoc(appRef, {
      description: value,
      updated_at: serverTimestamp(),
    })
    return { success: true, action: 'updateDescription' }
  }

  // ---------------------------
  // 2) admin_ids (editable)
  // ---------------------------
  function cleanIds(ids: string[]): string[] {
    return Array.from(new Set(ids.map((s) => String(s ?? '').trim()).filter(Boolean)))
  }

  async function addAdmin(userId: string): Promise<UpdateResult<'addAdmin', { uid: string }>> {
    const uid = String(userId ?? '').trim()
    if (!uid) throw new Error('[app/update] addAdmin requires a user id.')

    await updateDoc(appRef, {
      admin_ids: arrayUnion(uid),
      updated_at: serverTimestamp(),
    })
    return { success: true, action: 'addAdmin', uid }
  }

  async function removeAdmin(userId: string): Promise<UpdateResult<'removeAdmin' | 'noop', { uid: string }>> {
    const uid = String(userId ?? '').trim()
    if (!uid) throw new Error('[app/update] removeAdmin requires a user id.')

    // Guard against removing the last admin
    const snap = await getDoc(appRef)
    if (!snap.exists()) throw new Error('[app/update] App document not found.')
    const data = snap.data() as { admin_ids?: string[] }
    const current = cleanIds(data.admin_ids ?? [])

    if (!current.includes(uid)) {
      return { success: true, action: 'noop', uid }
    }
    if (current.length <= 1) {
      throw new Error('[app/update] Cannot remove the last admin.')
    }

    await updateDoc(appRef, {
      admin_ids: arrayRemove(uid),
      updated_at: serverTimestamp(),
    })
    return { success: true, action: 'removeAdmin', uid }
  }

  async function setAdmins(next: string[]): Promise<UpdateResult<'setAdmins', { admin_ids: string[] }>> {
    const cleaned = cleanIds(next)
    if (cleaned.length === 0) {
      throw new Error('[app/update] setAdmins requires at least one admin.')
    }
    await updateDoc(appRef, {
      admin_ids: cleaned,
      updated_at: serverTimestamp(),
    })
    return { success: true, action: 'setAdmins', admin_ids: cleaned }
  }

  // ---------------------------
  // 3) users subcollection
  //    apps/{appId}/users/{uid}
  // ---------------------------
  type AppUserDoc = {
    id: string
    role?: 'user' | 'manager' | 'admin'
    created_at?: unknown
    updated_at?: unknown
  }

  async function addUserToApp(
    userId: string,
    payload?: Partial<AppUserDoc>
  ): Promise<UpdateResult<'addUserToApp', { uid: string }>> {
    const uid = String(userId ?? '').trim()
    if (!uid) throw new Error('[app/update] addUserToApp requires a user id.')

    const userRef = doc(db, `apps/${id}/users`, uid)
    const base: AppUserDoc = {
      id: uid,
      role: 'user',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    }
    const data: DocumentData = { ...base, ...(payload ?? {}) }

    await setDoc(userRef, data, { merge: true })
    await updateDoc(appRef, { updated_at: serverTimestamp() }) // reflect activity

    return { success: true, action: 'addUserToApp', uid }
  }

  async function removeUserFromApp(userId: string): Promise<UpdateResult<'removeUserFromApp', { uid: string }>> {
    const uid = String(userId ?? '').trim()
    if (!uid) throw new Error('[app/update] removeUserFromApp requires a user id.')

    const userRef = doc(db, `apps/${id}/users`, uid)
    await deleteDoc(userRef)
    await updateDoc(appRef, { updated_at: serverTimestamp() }) // reflect activity

    return { success: true, action: 'removeUserFromApp', uid }
  }

  return {
    // description
    updateDescription,

    // admin_ids
    addAdmin,
    removeAdmin,
    setAdmins,

    // users subcollection
    addUserToApp,
    removeUserFromApp,
  }
}