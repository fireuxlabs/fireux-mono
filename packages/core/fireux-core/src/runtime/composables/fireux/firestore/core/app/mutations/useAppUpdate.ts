import type { Ref } from 'vue'
import type { App } from '../../../../../../models/core/app.model'
import type {
  AppUser,
  User,
} from '../../../../../../models/core/user.model'
import { arrayRemove, arrayUnion } from 'firebase/firestore'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useImageStorage } from '../../../../firebase/useImageStorage'
import { useAppEnsure } from './useAppEnsure'

export function useAppUpdate(appRef: Ref<App | null | undefined>) {
  const { updateDocument } = useFirestoreUpdate()
  const { setDocument } = useFirestoreCreate()
  const { uploadImage, getDownloadUrlForPath } = useImageStorage()
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

  const sanitizeAppName = (raw: string | null | undefined) =>
    String(raw ?? '')
      .trim()
      .slice(0, 60)

  const sanitizeAppShortName = (raw: string | null | undefined) =>
    String(raw ?? '')
      .trim()
      .slice(0, 40)

  const sanitizeEcosystem = (raw: string | null | undefined) =>
    String(raw ?? '')
      .trim()
      .slice(0, 60)

  const sanitizeStatus = (raw: string | null | undefined): App['status'] => {
    const value = String(raw ?? '').trim()
    if (value === 'active' || value === 'archived') return value
    throw new Error('Status must be active or archived')
  }

  const sanitizeInstagram = (raw: string | null | undefined) => {
    const value = String(raw ?? '').trim()
    if (!value) return ''

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
    if (!value) return ''
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

  async function updateAppName(name: string) {
    const id = ensureAppId()
    const value = sanitizeAppName(name)
    await updateDocument<App>('apps', id, { app_name: value })
  }

  async function updateAppShortName(name: string) {
    const id = ensureAppId()
    const value = sanitizeAppShortName(name)
    await updateDocument<App>('apps', id, { app_short_name: value })
  }

  async function updateEcosystem(ecosystem: string) {
    const id = ensureAppId()
    const value = sanitizeEcosystem(ecosystem)
    await updateDocument<App>('apps', id, { ecosystem: value })
  }

  async function updateStatus(status: string) {
    const id = ensureAppId()
    const value = sanitizeStatus(status)
    await updateDocument<App>('apps', id, { status: value })
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

  type AppImageKind = 'avatar' | 'logo' | 'wordmark'

  function imageStoragePath(appId: string, kind: AppImageKind): string {
    // "Public bucket" convention: a stable object path that can be overwritten.
    // The UI refresh simply resolves the current download URL and saves it.
    switch (kind) {
      case 'avatar':
        return `apps/${appId}/media/avatar/current`
      case 'logo':
        return `apps/${appId}/media/logo/current`
      case 'wordmark':
        return `apps/${appId}/media/wordmark/current`
    }
  }

  function cacheBust(url: string): string {
    const stamp = Date.now().toString(36)
    return url.includes('?') ? `${url}&v=${stamp}` : `${url}?v=${stamp}`
  }

  async function refreshImageFromBucket(kind: AppImageKind) {
    const id = ensureAppId()
    const path = imageStoragePath(id, kind)
    const url = await getDownloadUrlForPath(path)
    const next = cacheBust(url)

    if (kind === 'avatar') {
      await updateDocument<App>('apps', id, { avatar_url: next })
      return next
    }
    if (kind === 'logo') {
      await updateDocument<App>('apps', id, { logo_url: next })
      return next
    }
    await updateDocument<App>('apps', id, { wordmark_url: next })
    return next
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
    updateAppName,
    updateAppShortName,
    updateEcosystem,
    updateStatus,
    updateInstagram,
    updateAvatarUrl,
    uploadAvatar,
    refreshImageFromBucket,
    handleJoinRequests,
    setAppUserAdmin,
  }
}
