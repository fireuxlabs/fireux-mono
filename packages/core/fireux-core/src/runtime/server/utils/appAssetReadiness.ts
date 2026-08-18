import { getStorage } from 'firebase-admin/storage'
import { imageSize } from 'image-size'
import { getAdminApp } from './getAdmin'
import {
  APP_IMAGE_SYNC_KINDS,
  appImageRequirement,
  appImageStoragePath,
  validateAppAssetDimensions,
  type AppImageKind,
} from '../../app/composables/firestore/utils/appMedia'

export type AppAssetReadinessItem = {
  kind: AppImageKind
  label: string
  filename: string
  objectPath: string
  exists: boolean
  valid: boolean
  width?: number
  height?: number
  issue?: string
}

export type AppAssetReadiness = {
  appId: string
  ready: boolean
  assets: AppAssetReadinessItem[]
}

export async function readAppAsset(
  appId: string,
  bucketName: string,
  kind: AppImageKind
) {
  const id = String(appId || '').trim()
  const bucket = String(bucketName || '').trim()
  if (!id || !bucket) throw new Error('App asset read requires App and bucket identity.')
  const file = getStorage(getAdminApp()).bucket(bucket).file(appImageStoragePath(id, kind))
  const [exists] = await file.exists()
  return exists ? file.download().then(([contents]) => contents) : null
}

export async function inspectAppAssetReadiness(
  appId: string,
  bucketName: string
): Promise<AppAssetReadiness> {
  const id = String(appId || '').trim()
  const bucket = String(bucketName || '').trim()
  if (!id || !bucket) throw new Error('App asset readiness requires App and bucket identity.')

  const storage = getStorage(getAdminApp()).bucket(bucket)
  const assets = await Promise.all(APP_IMAGE_SYNC_KINDS.map(async (kind) => {
    const requirement = appImageRequirement(kind)
    const objectPath = appImageStoragePath(id, kind)
    const file = storage.file(objectPath)
    const [exists] = await file.exists()
    if (!exists) {
      return {
        kind,
        label: requirement.label,
        filename: requirement.storageObjectName || '',
        objectPath,
        exists: false,
        valid: false,
        issue: 'Missing',
      }
    }
    const [contents] = await file.download()
    const dimensions = imageSize(contents)
    const issue = validateAppAssetDimensions(
      requirement.label,
      { width: dimensions.width, height: dimensions.height, type: dimensions.type },
      requirement.dimensions
    )
    return {
      kind,
      label: requirement.label,
      filename: requirement.storageObjectName || '',
      objectPath,
      exists,
      valid: !issue,
      width: dimensions.width,
      height: dimensions.height,
      ...(issue ? { issue } : {}),
    }
  }))

  return { appId: id, ready: assets.every((asset) => asset.valid), assets }
}
