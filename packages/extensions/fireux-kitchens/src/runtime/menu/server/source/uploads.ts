// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: require explicit currency through concrete Place runtime imports.
import { createError, getQuery, readMultipartFormData, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { readString } from 'fireux-core/runtime/server/utils/records/read'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  multipartField,
  readUploadedMultipartFiles,
  type MultipartParts,
} from 'fireux-core/runtime/server/utils/uploads/multipart'
import { saveStorageFileWithDownloadToken } from 'fireux-core/runtime/server/utils/uploads/storage'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { MenuSourceUploadStorage } from '../../utils/menu-source-upload.ts'

const menuUploadCollection = MenuSourceUploadStorage.collection
const maxFileSizeMb = 10
const allowedTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]
const extensionTypes: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

export type KitchenMenuUploadFile = {
  data: Buffer
  fileName: string
  contentType: string
}

export type KitchenMenuUploadRequest = {
  appId: string
  kitchenId: string
  uploadId: string
  replaceExisting: boolean
  files: KitchenMenuUploadFile[]
}

export type SavedKitchenMenuUploadFile = {
  fileUrl: string
  objectPath: string
  fileName: string
  contentType: string
}

export function setKitchenMenuUploadCors(
  event: H3Event,
  method: 'GET' | 'POST'
) {
  setCorsHeaders(event, {
    methods: [method],
    headers: ['content-type', 'authorization'],
  })
}

export function text(value: unknown): string {
  return readString(value)
}

function menuNameValidation(uploadId: string) {
  return validatePublicSlug(uploadId, {
    label: 'Menu name',
    reservedScope: 'entity',
    reserved: ['create', 'edit', 'new', 'qr', 'sections'],
  })
}

export function requireMenuName(uploadId: string) {
  const validation = menuNameValidation(uploadId)
  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message || 'Menu name is not valid.',
    })
  }
}

function readMenuFiles(parts: MultipartParts): KitchenMenuUploadFile[] {
  return readUploadedMultipartFiles(parts, {
    label: 'Menu file',
    defaultFileName: 'menu-file',
    maxFileSizeMb,
    allowedTypes,
    extensionTypes,
    invalidTypeMessage: 'Upload a PDF or image menu file.',
  })
}

export async function requireKitchenMenuUploadUser(
  event: H3Event,
  message = 'Sign in before saving a menu upload.'
) {
  const user = await requireFirebaseBearerUser(event, message)
  return user.uid
}

export async function readKitchenMenuUploadRequest(
  event: H3Event
): Promise<KitchenMenuUploadRequest> {
  const query = getQuery(event)
  const parts = await readMultipartFormData(event)
  const appId = requirePathSegment(query.appId, 'App id')
  const kitchenId = requirePathSegment(query.kitchenId, 'Kitchen id')
  const uploadId = normalizeSlug(multipartField(parts, 'slug'))
  const files = readMenuFiles(parts)

  requireMenuName(uploadId)

  return {
    appId,
    kitchenId,
    uploadId,
    replaceExisting:
      text(query.replace) === '1' || text(query.replace) === 'true',
    files,
  }
}

export function readKitchenMenuUploadAvailabilityRequest(event: H3Event) {
  const query = getQuery(event)
  const uploadId = normalizeSlug(query.id)
  const validation = menuNameValidation(uploadId)

  if (!validation.isValid) {
    return {
      isValid: false as const,
      response: {
        id: uploadId,
        is_valid: false,
        taken: false,
        available: false,
        message: validation.message || 'Menu name is not valid.',
      },
    }
  }

  return {
    isValid: true as const,
    appId: requirePathSegment(query.appId, 'App id'),
    kitchenId: requirePathSegment(query.kitchenId, 'Kitchen id'),
    uploadId,
    replaceExisting:
      text(query.replace) === '1' || text(query.replace) === 'true',
  }
}

export function kitchenMenuUploadKitchenPath(
  _appId: string,
  kitchenId: string
) {
  return `kitchens/${kitchenId}`
}

export function kitchenMenuUploadPath(
  appId: string,
  kitchenId: string,
  uploadId: string
) {
  return `${kitchenMenuUploadKitchenPath(appId, kitchenId)}/${menuUploadCollection}/${uploadId}`
}

export async function assertKitchenMenuUploadAccess(
  _appId: string,
  kitchenId: string,
  uid: string
) {
  const snap = await getRuntimeFirestore()
    .doc(`kitchens/${kitchenId}/team/${uid}`)
    .get()

  const role = text(snap.get('role'))
  if (
    !snap.exists ||
    text(snap.get('user_id')) !== uid ||
    text(snap.get('status')) !== 'active' ||
    (role !== 'owner' && role !== 'operator')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have access to this kitchen.',
    })
  }
}

export async function assertKitchenMenuCurrencyCode(
  _appId: string,
  kitchenId: string
) {
  const db = getRuntimeFirestore()
  const rootSnap = await db
    .doc(`kitchens/${kitchenId}`)
    .get()
  if (!rootSnap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Kitchen not found.' })
  }
  const placeSnap = await db
    .collection('places')
    .doc(kitchenId)
    .get()
  const currencyCode = readPlaceCurrencyCode(placeSnap.data())

  if (!currencyCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Set the linked Place currency before creating menus.',
    })
  }

  return currencyCode
}

export async function kitchenMenuUploadExists(
  appId: string,
  kitchenId: string,
  uploadId: string
) {
  const snap = await getRuntimeFirestore()
    .doc(kitchenMenuUploadPath(appId, kitchenId, uploadId))
    .get()

  return snap.exists
}

export async function assertKitchenMenuUploadAvailable(
  appId: string,
  kitchenId: string,
  uploadId: string
) {
  if (await kitchenMenuUploadExists(appId, kitchenId, uploadId)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This menu name is already taken.',
    })
  }
}

export async function saveKitchenMenuUploadFiles(
  request: KitchenMenuUploadRequest
): Promise<SavedKitchenMenuUploadFile[]> {
  return Promise.all(
    request.files.map(async (file, index) => {
      const objectPath = `${kitchenMenuUploadKitchenPath(request.appId, request.kitchenId)}/${menuUploadCollection}/${request.uploadId}/source/${index + 1}-${file.fileName}`
      const saved = await saveStorageFileWithDownloadToken({
        objectPath,
        data: file.data,
        contentType: file.contentType,
      })

      return {
        fileUrl: saved.fileUrl,
        objectPath,
        fileName: file.fileName,
        contentType: file.contentType,
      }
    })
  )
}

export function storagePathsFromMenuUpload(value: unknown) {
  const source =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  const paths = new Set<string>()
  const primary = text(source.storage_path)
  if (primary) paths.add(primary)

  if (Array.isArray(source.files)) {
    for (const file of source.files) {
      const row =
        file && typeof file === 'object' && !Array.isArray(file)
          ? (file as Record<string, unknown>)
          : {}
      const path = text(row.storage_path)
      if (path) paths.add(path)
    }
  }

  return Array.from(paths)
}

export function kitchenMenuUploadRecord(
  request: KitchenMenuUploadRequest,
  savedFiles: SavedKitchenMenuUploadFile[],
  uid: string
) {
  const primaryFile = savedFiles[0]
  const fileKinds = savedFiles.map((file) =>
    documentKindFromFile({
      fileName: file.fileName,
      contentType: file.contentType,
    })
  )
  const singleKind =
    Array.from(new Set(fileKinds)).length === 1 ? fileKinds[0] : 'document'

  return {
    id: request.uploadId,
    kitchen_id: request.kitchenId,
    app_id: request.appId,
    provider: 'go-qr',
    tool: 'doc',
    storage_owner: 'consumer-app',
    storage_app_id: request.appId,
    file_url: primaryFile?.fileUrl ?? '',
    file_name: primaryFile?.fileName ?? '',
    file_type: primaryFile?.contentType ?? '',
    file_kind: singleKind,
    storage_path: primaryFile?.objectPath ?? '',
    files: savedFiles.map((file, index) => ({
      id: String(index + 1),
      file_url: file.fileUrl,
      file_name: file.fileName,
      file_type: file.contentType,
      file_kind: documentKindFromFile({
        fileName: file.fileName,
        contentType: file.contentType,
      }),
      storage_path: file.objectPath,
      sort_order: index,
    })),
    files_count: savedFiles.length,
    status: 'uploaded',
    created: serverAuditStamp({ by: uid, appId: request.appId }),
    updated: serverAuditStamp({ by: uid }),
  }
}

export function kitchenMenuUploadResponse(
  request: KitchenMenuUploadRequest,
  savedFiles: SavedKitchenMenuUploadFile[]
) {
  const primaryFile = savedFiles[0]

  return {
    ok: true,
    id: request.uploadId,
    slug: request.uploadId,
    path: '',
    qr_path: '',
    url: primaryFile?.fileUrl ?? '',
    qr_url: '',
    file_name: primaryFile?.fileName ?? '',
    file_type: primaryFile?.contentType ?? '',
    files: savedFiles.map((file) => ({
      url: file.fileUrl,
      file_name: file.fileName,
      file_type: file.contentType,
      storage_path: file.objectPath,
    })),
    files_count: savedFiles.length,
    storage_owner: 'consumer-app',
    storage_app_id: request.appId,
  }
}
