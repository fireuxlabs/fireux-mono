// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: route App-admin membership and entitlement changes through the trusted server transaction.
// Concurrent edit — 2026-07-21 15:25 CEST — Dashboard SSR repair: defer App Firestore and Storage clients until an administrator action.

import type { Ref } from 'vue'
import type { App } from '../../../models/app.model.ts'
import type { AppSocialLinks } from '../../../models/app.model.ts'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { useImageStorage } from '../../../../composables/fireux/firebase/useImageStorage'
import { useRequireUser } from '../../../../composables/fireux/firebase/useRequireUser'
import { mutateAppMembership } from '../../../../user/composables/firestore/utils/appMembershipMutation'
import {
  appImageRequirement,
  appImageFirestoreField,
  appImageStoragePath,
  validateAppAssetDimensions,
  type AppImageKind,
} from '../utils/appMedia'

export function useAppUpdate(appRef: Ref<App | null | undefined>) {
  const cfg = useFireUXConfig()

  const ensureAppId = () => {
    const id = appRef.value?.id ?? cfg.appId
    if (!id) throw new Error('[useAppUpdate] Missing app or app.id')
    return id
  }

  const updateApp = async (data: Partial<App> | Record<string, unknown>) => {
    ensureAppId()
    const user = await useRequireUser()
    const response = await fetch('/api/internal/app/settings', {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${await user.getIdToken()}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    const payload = (await response.json().catch(() => null)) as Record<
      string,
      unknown
    > | null
    if (!response.ok) {
      const message = String(
        payload?.statusMessage || payload?.message || 'App update failed.'
      ).trim()
      throw new Error(message)
    }
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
    await updateDescription(tagline)
  }

  async function updateShortBio(shortBio: string) {
    await updateDescription(shortBio)
  }

  async function updateLongBio(longBio: string) {
    await updateDescription(longBio)
  }

  async function updateAppName(name: string) {
    await updateApp({ name: text(name, 60) })
  }

  async function updateAppShortName(name: string) {
    await updateApp({ short_name: text(name, 40) })
  }

  async function updateInstagram(url: string | null) {
    sanitizeInstagram(url)
    throw new Error('Social links are not part of canonical App storage.')
  }

  async function updateSocialLinks(links: AppSocialLinks) {
    void links
    throw new Error('Social links are not part of canonical App storage.')
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
    const { uploadImage } = useImageStorage()
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
    const { getDownloadUrlForPath } = useImageStorage()
    const url = await getDownloadUrlForPath(path)
    const next = cacheBust(url)

    const field = appImageFirestoreField(kind)
    const patch: Record<string, unknown> = { [field]: next }
    await updateApp(patch)
    return next
  }

  function imageTypeFromBlob(blob: Blob): string {
    const type = blob.type.toLowerCase()
    if (type.includes('png')) return 'png'
    if (type.includes('svg')) return 'svg'
    if (type.includes('jpeg') || type.includes('jpg')) return 'jpg'
    if (type.includes('ico') || type.includes('icon')) return 'ico'
    return ''
  }

  async function readBrowserImageDimensions(blob: Blob) {
    return new Promise<{ width: number; height: number; type: string }>(
      (resolve, reject) => {
        const objectUrl = URL.createObjectURL(blob)
        const image = new Image()

        const cleanup = () => URL.revokeObjectURL(objectUrl)

        image.onload = () => {
          const width = image.naturalWidth || image.width
          const height = image.naturalHeight || image.height
          cleanup()
          resolve({ width, height, type: imageTypeFromBlob(blob) })
        }

        image.onerror = () => {
          cleanup()
          reject(new Error('Unable to read local image dimensions'))
        }

        image.src = objectUrl
      }
    )
  }

  async function readValidatedLocalAppImage(
    kind: AppImageKind,
    localPath: string
  ) {
    const response = await fetch(localPath, { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Missing local asset: ${localPath}`)
    }

    const blob = await response.blob()
    if (!blob.size) {
      throw new Error(`Empty local asset: ${localPath}`)
    }

    const dimensions = await readBrowserImageDimensions(blob)
    const requirement = appImageRequirement(kind)
    const dimensionError = validateAppAssetDimensions(
      requirement.label,
      dimensions,
      requirement.dimensions
    )
    if (dimensionError) {
      throw new Error(`${localPath}: ${dimensionError}`)
    }

    return blob
  }

  async function overwriteImageFromLocal(
    kind: AppImageKind,
    localPath: string
  ) {
    if (!localPath || !localPath.startsWith('/')) {
      throw new Error('Local image path must start with /')
    }

    const id = ensureAppId()
    const path = appImageStoragePath(id, kind)
    const source = await readValidatedLocalAppImage(kind, localPath)
    const { uploadImage } = useImageStorage()
    const url = await uploadImage(path, source)
    const next = cacheBust(url)

    const field = appImageFirestoreField(kind)
    const patch: Record<string, unknown> = { [field]: next }
    await updateApp(patch)
    return next
  }

  /**
   * Handles an app join request.
   * - Always removes user from `join_requests[]`
   * - If approve=true, ensures membership doc and user link are created
   */
  async function handleJoinRequests(uid: string, approve: boolean) {
    await mutateAppMembership({
      action: 'review-join',
      userId: uid,
      approve,
    })
  }

  async function setAppUserAdmin(uid: string, makeAdmin: boolean) {
    const membershipRole = makeAdmin ? 'admin' : 'user'
    await mutateAppMembership({
      action: 'set-role',
      userId: uid,
      role: membershipRole,
    })
  }

  async function setAppUserPremium(uid: string, isPremium: boolean) {
    await mutateAppMembership({
      action: 'set-premium',
      userId: uid,
      isPremium: Boolean(isPremium),
    })
  }

  return {
    updateDescription,
    updateTagline,
    updateShortBio,
    updateLongBio,
    updateAppName,
    updateAppShortName,
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
    setAppUserPremium,
    membership: {
      setAdmin: (uid: string, makeAdmin: boolean) =>
        mutateAppMembership({
          action: 'set-role',
          userId: uid,
          role: makeAdmin ? 'admin' : 'user',
        }),
    },
  }
}
