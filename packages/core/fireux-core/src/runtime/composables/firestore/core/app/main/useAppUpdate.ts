// FILE: ~/composables/app/useAppUpdate.ts
import type { Ref } from 'vue'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'
import { arrayRemove, arrayUnion } from 'firebase/firestore'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate.ts'

export function useAppUpdate(appRef: Ref<App | null | undefined>) {
  const { updateDocument } = useFirestoreUpdate()
  const { setDocument } = useFirestoreCreate()

  const ensureAppId = () => {
    const id = appRef.value?.id
    if (!id) throw new Error('[useAppUpdate] Missing app or app.id')
    return id
  }

  async function updateDescription(description: string) {
    const id = ensureAppId()
    const value = String(description ?? '').trim()
    await updateDocument<App>('apps', id, { description: value })
  }

  async function updateInstagram(url: string) {
    const id = ensureAppId()
    const value = String(url ?? '').trim()
    const sanitized = value.length > 0 ? value : null
    await updateDocument<App>('apps', id, {
      social_links: { instagram: sanitized },
    })
  }

  /**
   * Handles an app join request.
   * - Always removes user from `join_requests[]`
   * - If approve=true, adds minimal doc to `apps/{id}/users/{uid}`
   */
  async function handleJoinRequests(uid: string, approve: boolean) {
    const appId = ensureAppId()
    await updateDocument<App>('apps', appId, {
      // Firestore FieldValue cast is safe; updateDocument forwards as-is.
      join_requests: arrayRemove(uid) as unknown as App['join_requests'],
    })

    if (approve) {
      await setDocument(`apps/${appId}/users`, uid, { id: uid, role: 'user' })
      await updateDocument<User>('users', uid, {
        userOf: arrayUnion(appId) as unknown as string[],
      })
    }
  }

  async function setAppUserAdmin(uid: string, makeAdmin: boolean) {
    const appId = ensureAppId()
    const role = makeAdmin ? 'admin' : 'user'

    let updatedDoc = false
    try {
      await updateDocument<AppUser>(`apps/${appId}/users`, uid, { role })
      updatedDoc = true
    } catch {
      updatedDoc = false
    }

    if (!updatedDoc) {
      await setDocument(`apps/${appId}/users`, uid, { id: uid, role })
    }

    await updateDocument<App>('apps', appId, {
      admin_ids: (makeAdmin
        ? arrayUnion(uid)
        : arrayRemove(uid)) as unknown as App['admin_ids'],
    })

    const userUpdates: Partial<User> = makeAdmin
      ? {
          adminOf: arrayUnion(appId) as unknown as string[],
          userOf: arrayUnion(appId) as unknown as string[],
        }
      : {
          adminOf: arrayRemove(appId) as unknown as string[],
        }

    await updateDocument<User>('users', uid, userUpdates)
  }

  return {
    updateDescription,
    updateInstagram,
    handleJoinRequests,
    setAppUserAdmin,
  }
}
