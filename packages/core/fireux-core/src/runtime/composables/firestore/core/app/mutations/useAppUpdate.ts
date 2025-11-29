import type { Ref } from 'vue'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'
import { arrayRemove, arrayUnion } from 'firebase/firestore'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'
import { useAppEnsure } from '../core/useAppEnsure.ts'

export function useAppUpdate(appRef: Ref<App | null | undefined>) {
  const { updateDocument } = useFirestoreUpdate()
  const { setDocument } = useFirestoreCreate()
  const { uploadImage } = useImageStorage()
  const { ensureAppMembership } = useAppEnsure()

  const ensureAppId = () => {
    const id = appRef.value?.id
    if (!id) throw new Error('[useAppUpdate] Missing app or app.id')
    return id
  }

  const sanitizeDescription = (description: string) =>
    String(description ?? '')
      .trim()
      .slice(0, 500)

  const sanitizeInstagram = (raw: string | null | undefined) => {
    const value = String(raw ?? '').trim()
    if (!value) return null

    const normalised = (() => {
      if (value.startsWith('@'))
        return `https://instagram.com/${value.slice(1)}`
      if (/^https?:\/\//i.test(value)) return value
      return `https://instagram.com/${value}`
    })()

    try {
      const url = new URL(normalised)
      return url.toString()
    } catch {
      throw new Error('Invalid Instagram URL')
    }
  }

  const sanitizeAvatarUrl = (raw: string | null | undefined) => {
    const value = String(raw ?? '').trim()
    if (!value) return null
    try {
      const url = new URL(value)
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Avatar URL must use http or https')
      }
      return url.toString()
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message
          ? error.message
          : 'Invalid avatar URL'
      )
    }
  }

  async function updateDescription(description: string) {
    const id = ensureAppId()
    const value = sanitizeDescription(description)
    await updateDocument<App>('apps', id, { description: value })
  }

  async function updateInstagram(url: string | null) {
    const id = ensureAppId()
    const sanitized = sanitizeInstagram(url)
    await updateDocument<App>('apps', id, {
      social_links: { instagram: sanitized },
    })
  }

  async function updateAvatarUrl(url: string | null) {
    const id = ensureAppId()
    const value = sanitizeAvatarUrl(url)
    await updateDocument<App>('apps', id, { avatar_url: value })
  }

  async function uploadAvatar(source: File | Blob) {
    const id = ensureAppId()
    const token =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : Date.now().toString(36)
    const path = `apps/${id}/media/avatar/${token}`
    const url = await uploadImage(path, source)
    await updateDocument<App>('apps', id, { avatar_url: url })
    return url
  }

  /**
   * Handles an app join request.
   * - Always removes user from `join_requests[]`
   * - If approve=true, ensures membership doc and user link are created
   */
  async function handleJoinRequests(uid: string, approve: boolean) {
    const appId = ensureAppId()
    await updateDocument<App>('apps', appId, {
      // Firestore FieldValue cast is safe; updateDocument forwards as-is.
      join_requests: arrayRemove(uid) as unknown as App['join_requests'],
    })

    if (approve) {
      await ensureAppMembership(uid, 'user')
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
    updateAvatarUrl,
    uploadAvatar,
    handleJoinRequests,
    setAppUserAdmin,
  }
}
