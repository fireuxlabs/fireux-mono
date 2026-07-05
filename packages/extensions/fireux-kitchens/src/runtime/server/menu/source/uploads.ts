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
  readUploadedMultipartFiles,
  type MultipartParts,
} from 'fireux-core/runtime/server/utils/uploads/multipart.ts'
import { saveStorageFileWithDownloadToken } from 'fireux-core/runtime/server/utils/uploads/storage.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'
import { KitchenStorage } from '../../../models/kitchen.model'
import { MenuSourceUploadStorage } from '../../../models/kitchen/menu/menu-source-upload.model'

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
    replaceExisting: text(query.replace) === '1' || text(query.replace) === 'true',
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
    replaceExisting: text(query.replace) === '1' || text(query.replace) === 'true',
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
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
  const paths = new Set<string>()
  const primary = text(source.storage_path)
  if (primary) paths.add(primary)

  if (Array.isArray(source.files)) {
    for (const file of source.files) {
      const row = file && typeof file === 'object' && !Array.isArray(file)
        ? file as Record<string, unknown>
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
  const singleKind = Array.from(new Set(fileKinds)).length === 1
    ? fileKinds[0]
    : 'document'

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
