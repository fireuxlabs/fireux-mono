import { computed, type Ref } from 'vue'
import type { App } from '../models/app.model'
import { useImageStorage } from '../../composables/fireux/firebase/useImageStorage'
import { useAppUpdate } from './useAppUpdate'
import {
  appImageFirestoreField,
  appImageRequirement,
  appImageStoragePath,
  validateAppAssetDimensions,
  type AppImageKind,
} from './firestore/utils/appMedia'

export function useAppMedia(app: Ref<App | null | undefined>) {
  const { updateApp } = useAppUpdate(computed(() => app.value?.id || ''))

  async function readImage(kind: AppImageKind, localPath: string) {
    const response = await fetch(localPath, { cache: 'no-store' })
    if (!response.ok) throw new Error(`Missing local asset: ${localPath}`)
    const blob = await response.blob()
    const dimensions = await new Promise<{ width: number; height: number; type: string }>((resolve, reject) => {
      const url = URL.createObjectURL(blob)
      const image = new Image()
      image.onload = () => {
        const type = blob.type.includes('png') ? 'png' : blob.type.includes('svg') ? 'svg' : blob.type.includes('jpeg') ? 'jpg' : ''
        resolve({ width: image.naturalWidth, height: image.naturalHeight, type })
        URL.revokeObjectURL(url)
      }
      image.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Unable to read local image dimensions'))
      }
      image.src = url
    })
    const requirement = appImageRequirement(kind)
    const error = validateAppAssetDimensions(requirement.label, dimensions, requirement.dimensions)
    if (error) throw new Error(`${localPath}: ${error}`)
    return blob
  }

  async function overwriteImageFromLocal(kind: AppImageKind, localPath: string) {
    const appId = String(app.value?.id || '').trim()
    if (!appId) throw new Error('App id is required.')
    if (!localPath.startsWith('/')) throw new Error('Local image path must start with /')
    const blob = await readImage(kind, localPath)
    const { uploadImage } = useImageStorage()
    const url = await uploadImage(appImageStoragePath(appId, kind), blob)
    const mediaKey = appImageFirestoreField(kind).replace(/^media\./, '') as keyof NonNullable<App['media']>
    await updateApp({
      media: {
        ...app.value?.media,
        [mediaKey]: url,
      },
    })
    return url
  }

  return { overwriteImageFromLocal }
}
