import { arrayRemove, arrayUnion, deleteField } from 'firebase/firestore'
import type { Ref } from 'vue'
import type { AppModel } from '../../../../../../models/core/app.model'
import type { AppSocialLinks } from '../../../../../../models/core/app.supporting'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useImageStorage } from '../../../../firebase/useImageStorage'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import {
    appImageFirestoreField,
    appImageStoragePath,
    isWordmarkKind,
    type AppImageKind,
} from '../utils/appMedia'

export function useAppUpdate(appRef: Ref<AppModel | null | undefined>) {
  const cfg = useFireUXConfig()
  const { updateDocument } = useFirestoreUpdate()
  const { uploadImage, getDownloadUrlForPath } = useImageStorage()

  const ensureAppId = () => {
    const id = appRef.value?.id ?? cfg.appId
    if (!id) throw new Error('[useAppUpdate] Missing app or app.id')
    return id
  }

  const updateApp = (data: Partial<AppModel> | Record<string, any>) =>
    updateDocument<any>('apps', ensureAppId(), data as any)

  const updateUserMembership = async (
    uid: string,
    membershipRole: 'admin' | 'user'
  ) => {
    const appId = ensureAppId()
    const userId = String(uid ?? '').trim()
    if (!userId) throw new Error('[useAppUpdate] Missing uid')

    await updateDocument('users', userId, {
      userOf: arrayUnion(appId) as unknown as string[],
      adminOf:
        membershipRole === 'admin'
          ? (arrayUnion(appId) as unknown as string[])
          : (arrayRemove(appId) as unknown as string[]),
    })
  }

  const updateAppMembership = async (
    uid: string,
    membershipRole: 'admin' | 'user'
  ) => {
    const userId = String(uid ?? '').trim()
    if (!userId) throw new Error('[useAppUpdate] Missing uid')

    await updateApp({
      admin_ids:
        membershipRole === 'admin'
          ? (arrayUnion(userId) as unknown as App['admin_ids'])
          : (arrayRemove(userId) as unknown as App['admin_ids']),
    })
  }

  const updateAppUserRole = async (
    uid: string,
    membershipRole: 'admin' | 'user'
  ) => {
    const appId = ensureAppId()
    const userId = String(uid ?? '').trim()
    if (!userId) throw new Error('[useAppUpdate] Missing uid')

    await updateDocument(`apps/${appId}/users`, userId, {
      role: membershipRole,
    })
  }

  const text = (raw: unknown, max: number) =>
    String(raw ?? '')
      .trim()
      .slice(0, max)

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

  const sanitizeThumbnailUrl = (raw: string | null | undefined) => {
    const value = text(raw, 2048)
    if (!value) return ''
    try {
      const url = new URL(value)
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Thumbnail URL must use http or https')
      }
      return url.toString()
    } catch (error) {
      throw new Error(
        error instanceof Error && error.message
          ? error.message
          : 'Invalid thumbnail URL'
      )
    }
  }

  async function updateDescription(description: string) {
    await updateApp({ description: text(description, 500) })
  }

  async function updateTagline(tagline: string) {
    await updateApp({ tagline: text(tagline, 120) })
  }

  async function updateShortBio(shortBio: string) {
    await updateApp({ short_bio: text(shortBio, 240) })
  }

  async function updateLongBio(longBio: string) {
    await updateApp({ long_bio: text(longBio, 4000) })
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

  async function updateInstagram(url: string | null) {
    const sanitized = sanitizeInstagram(url)
    await updateApp({
      'social_links.instagram': sanitized,
    })
  }

  async function updateSocialLinks(links: AppSocialLinks) {
    await updateApp({ social_links: links })
  }

  async function updateAvatarUrl(url: string | null) {
    const value = sanitizeThumbnailUrl(url)
    await updateApp({ 'media.thumbnail_url': value })
  }

  async function updateThumbnailUrl(url: string | null) {
    return updateAvatarUrl(url)
  }

  async function uploadAvatar(source: File | Blob) {
    const id = ensureAppId()
    const path = appImageStoragePath(id, 'thumbnail')
    const url = await uploadImage(path, source)
    await updateApp({ 'media.thumbnail_url': cacheBust(url) })
    return url
  }

  async function uploadThumbnail(source: File | Blob) {
    return uploadAvatar(source)
  }

  function cacheBust(url: string): string {
    const stamp = Date.now().toString(36)
    return url.includes('?') ? `${url}&v=${stamp}` : `${url}?v=${stamp}`
  }

  async function refreshImageFromBucket(kind: AppImageKind) {
    const id = ensureAppId()
    const path = appImageStoragePath(id, kind)
    const url = await getDownloadUrlForPath(path)
    const next = cacheBust(url)

    const field = appImageFirestoreField(kind)
    const patch: Record<string, any> = { [field]: next }
    if (isWordmarkKind(kind)) patch.wordmark_url = deleteField()
    await updateApp(patch)
    return next
  }

  async function overwriteImageFromLocal(kind: AppImageKind, localPath: string) {
    if (!localPath || !localPath.startsWith('/')) {
      throw new Error('Local image path must start with /')
    }

    const id = ensureAppId()
    const path = appImageStoragePath(id, kind)
    const url = await uploadImage(path, localPath)
    const next = cacheBust(url)

    const field = appImageFirestoreField(kind)
    const patch: Record<string, any> = { [field]: next }
    if (isWordmarkKind(kind)) patch.wordmark_url = deleteField()
    await updateApp(patch)
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
      join_requests: arrayRemove(uid) as unknown as AppModel['join_requests'],
    })

    if (approve) {
      await updateAppUserRole(uid, 'user')
      await updateUserMembership(uid, 'user')
      await updateAppMembership(uid, 'user')
    }
  }

  async function setAppUserAdmin(uid: string, makeAdmin: boolean) {
    const membershipRole = makeAdmin ? 'admin' : 'user'
    await updateAppUserRole(uid, membershipRole)
    await updateUserMembership(uid, membershipRole)
    await updateAppMembership(uid, membershipRole)
  }

  return {
    updateDescription,
    updateTagline,
    updateShortBio,
    updateLongBio,
    updateAppName,
    updateAppShortName,
    updateEcosystem,
    updateInstagram,
    updateSocialLinks,
    updateAvatarUrl,
    updateThumbnailUrl,
    uploadAvatar,
    uploadThumbnail,
    refreshImageFromBucket,
    overwriteImageFromLocal,
    handleJoinRequests,
    setAppUserAdmin,
    membership: {
      setAdmin: (uid: string, makeAdmin: boolean) =>
        updateAppMembership(uid, makeAdmin ? 'admin' : 'user'),
    },
  }
}
