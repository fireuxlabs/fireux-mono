import type { Ref } from 'vue'
import type { App } from '../../../../../../models/core/app.model'
import { arrayRemove } from 'firebase/firestore'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { useImageStorage } from '../../../../firebase/useImageStorage'
import { useAppEnsure } from './useAppEnsure'
import { ensureUserAppMembership } from '../../user/utils/ensureHelpers'

export function useAppUpdate(appRef: Ref<App | null | undefined>) {
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage, getDownloadUrlForPath } = useImageStorage()
  const { ensureAppMembership } = useAppEnsure()

  const ensureAppId = () => {
    const id = appRef.value?.id
    if (!id) throw new Error('[useAppUpdate] Missing app or app.id')
    return id
  }

  const updateApp = (data: Partial<App>) =>
    updateDocument<App>('apps', ensureAppId(), data)

  const text = (raw: unknown, max: number) =>
    String(raw ?? '')
      .trim()
      .slice(0, max)

  const sanitizeStatus = (raw: string | null | undefined): App['status'] => {
    const value = text(raw, 20)
    if (value === 'active' || value === 'archived') return value
    throw new Error('Status must be active or archived')
  }

  const sanitizeInstagram = (raw: string | null | undefined) => {
    const value = text(raw, 2048)
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
    const value = text(raw, 2048)
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
    await updateApp({ description: text(description, 500) })
  }

  async function updateAppName(name: string) {
    await updateApp({ app_name: text(name, 60) })
  }

  async function updateAppShortName(name: string) {
    await updateApp({ app_short_name: text(name, 40) })
  }

  async function updateEcosystem(ecosystem: string) {
    await updateApp({ ecosystem: text(ecosystem, 60) })
  }

  async function updateStatus(status: string) {
    const value = sanitizeStatus(status)
    await updateApp({ status: value })
  }

  async function updateInstagram(url: string | null) {
    const sanitized = sanitizeInstagram(url)
    await updateApp({ social_links: { instagram: sanitized } })
  }

  async function updateAvatarUrl(url: string | null) {
    const value = sanitizeAvatarUrl(url)
    await updateApp({ avatar_url: value })
  }

  async function uploadAvatar(source: File | Blob) {
    const id = ensureAppId()
    const path = `apps/${id}/media/avatar/current`
    const url = await uploadImage(path, source)
    await updateApp({ avatar_url: cacheBust(url) })
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

    if (kind === 'avatar') await updateApp({ avatar_url: next })
    else if (kind === 'logo') await updateApp({ logo_url: next })
    else await updateApp({ wordmark_url: next })
    return next
  }

  async function overwriteImageFromLocal(kind: AppImageKind, localPath: string) {
    if (!localPath || !localPath.startsWith('/')) {
      throw new Error('Local image path must start with /')
    }

    const id = ensureAppId()
    const path = imageStoragePath(id, kind)
    const url = await uploadImage(path, localPath)
    const next = cacheBust(url)

    if (kind === 'avatar') await updateApp({ avatar_url: next })
    else if (kind === 'logo') await updateApp({ logo_url: next })
    else await updateApp({ wordmark_url: next })
    return next
  }

  /**
   * Handles an app join request.
   * - Always removes user from `join_requests[]`
   * - If approve=true, ensures membership doc and user link are created
   */
  async function handleJoinRequests(uid: string, approve: boolean) {
    await updateApp({
      // Firestore FieldValue cast is safe; updateDocument forwards as-is.
      join_requests: arrayRemove(uid) as unknown as App['join_requests'],
    })

    if (approve) {
      await ensureAppMembership(uid, 'user')
    }
  }

  async function setAppUserAdmin(uid: string, makeAdmin: boolean) {
    const appId = ensureAppId()
    await ensureUserAppMembership(appId, uid, makeAdmin ? 'admin' : 'user')
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
    overwriteImageFromLocal,
    handleJoinRequests,
    setAppUserAdmin,
  }
}
