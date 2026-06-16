import {
  createError,
  getQuery,
  readMultipartFormData,
  type H3Event,
} from 'h3'
import { AppStorage } from 'fireux-core/runtime/models/core/app.model.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { readString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import {
  multipartField,
  readUploadedMultipartFile,
  type MultipartParts,
} from 'fireux-core/runtime/server/utils/uploads/multipart.ts'
import { saveStorageFileWithDownloadToken } from 'fireux-core/runtime/server/utils/uploads/storage.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { KitchenStorage } from '../../models/kitchen.model'
import { MenuSourceUploadStorage } from '../../models/menu/menu-source-upload.model'

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
  file: KitchenMenuUploadFile
}

export type SavedKitchenMenuUploadFile = {
  fileUrl: string
  objectPath: string
}

export function setKitchenMenuUploadCors(event: H3Event, method: 'GET' | 'POST') {
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

function requireMenuName(uploadId: string) {
  const validation = menuNameValidation(uploadId)
  if (!validation.isValid) {
    throw createError({
      statusCode: 400,
      statusMessage: validation.message || 'Menu name is not valid.',
    })
  }
}

function readMenuFile(parts: MultipartParts): KitchenMenuUploadFile {
  return readUploadedMultipartFile(parts, {
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
  const file = readMenuFile(parts)

  requireMenuName(uploadId)

  return {
    appId,
    kitchenId,
    uploadId,
    file,
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
  }
}

export function kitchenMenuUploadKitchenPath(appId: string, kitchenId: string) {
  return `${AppStorage.collection}/${appId}/${KitchenStorage.scopeCollection}/${kitchenId}`
}

export function kitchenMenuUploadPath(
  appId: string,
  kitchenId: string,
  uploadId: string
) {
  return `${kitchenMenuUploadKitchenPath(appId, kitchenId)}/${menuUploadCollection}/${uploadId}`
}

function canUploadForKitchen(
  data: Record<string, unknown> | undefined,
  uid: string
) {
  const accessIds = [
    ...(Array.isArray(data?.operator_ids) ? data.operator_ids : []),
    ...(Array.isArray(data?.team_ids) ? data.team_ids : []),
  ].map((value) => text(value))

  return Boolean(uid && accessIds.includes(uid))
}

export async function assertKitchenMenuUploadAccess(
  appId: string,
  kitchenId: string,
  uid: string
) {
  const snap = await getRuntimeFirestore()
    .doc(kitchenMenuUploadKitchenPath(appId, kitchenId))
    .get()

  if (!snap.exists || !canUploadForKitchen(snap.data(), uid)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'You do not have access to this kitchen.',
    })
  }
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

export async function saveKitchenMenuUploadFile(
  request: KitchenMenuUploadRequest
): Promise<SavedKitchenMenuUploadFile> {
  const objectPath = `${kitchenMenuUploadKitchenPath(request.appId, request.kitchenId)}/${menuUploadCollection}/${request.uploadId}/source/${request.file.fileName}`
  const saved = await saveStorageFileWithDownloadToken({
    objectPath,
    data: request.file.data,
    contentType: request.file.contentType,
  })

  return {
    fileUrl: saved.fileUrl,
    objectPath,
  }
}

export function kitchenMenuUploadRecord(
  request: KitchenMenuUploadRequest,
  saved: SavedKitchenMenuUploadFile,
  uid: string
) {
  return {
    id: request.uploadId,
    kitchen_id: request.kitchenId,
    app_id: request.appId,
    provider: 'go-qr',
    tool: 'doc',
    storage_owner: 'consumer-app',
    storage_app_id: request.appId,
    file_url: saved.fileUrl,
    file_name: request.file.fileName,
    file_type: request.file.contentType,
    file_kind: documentKindFromFile({
      fileName: request.file.fileName,
      contentType: request.file.contentType,
    }),
    storage_path: saved.objectPath,
    status: 'uploaded',
    created: serverAuditStamp({ by: uid, appId: request.appId }),
    updated: serverAuditStamp({ by: uid }),
  }
}

export function kitchenMenuUploadResponse(
  request: KitchenMenuUploadRequest,
  saved: SavedKitchenMenuUploadFile
) {
  return {
    ok: true,
    id: request.uploadId,
    slug: request.uploadId,
    path: '',
    qr_path: '',
    url: saved.fileUrl,
    qr_url: '',
    file_name: request.file.fileName,
    file_type: request.file.contentType,
    storage_owner: 'consumer-app',
    storage_app_id: request.appId,
  }
}
