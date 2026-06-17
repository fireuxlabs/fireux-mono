import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'

type PublicMenuScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  path?: string
  qrPath?: string
}

const menuSlug = (data: Record<string, unknown>, docId: string) =>
  readRecordString(data, 'slug') || docId

const publicMenuPath = (slug: string) => `/menus/${encodeURIComponent(slug)}`

export function publicMenuFromData(
  menuId: string,
  data: Record<string, unknown>,
  scope: PublicMenuScope = {}
) {
  const slug = menuSlug(data, menuId)
  const path = scope.path || readRecordString(data, 'path') || publicMenuPath(slug)
  const docName = readRecordString(data, 'doc_name')
  const docType = readRecordString(data, 'doc_type')

  return {
    id: menuId,
    slug,
    name: readRecordString(data, 'name') || slug,
    description: readRecordString(data, 'description'),
    status: readRecordString(data, 'status'),
    doc_url: readRecordString(data, 'doc_url'),
    doc_name: docName,
    doc_type: docType,
    kind: documentKindFromFile({
      fileName: docName,
      contentType: docType,
      storedKind: readRecordString(data, 'doc_kind'),
    }),
    doc_storage_path: readRecordString(data, 'doc_storage_path'),
    kitchen_id: scope.kitchenId ?? readRecordString(data, 'kitchen_id'),
    kitchen_slug: scope.kitchenSlug ?? readRecordString(data, 'kitchen_slug'),
    kitchen_app_id: scope.kitchenAppId ?? readRecordString(data, 'kitchen_app_id'),
    kitchen_menu_id: scope.kitchenMenuId ?? readRecordString(data, 'kitchen_menu_id'),
    created_by: readRecordString(data, 'created_by'),
    path,
    qr_path: scope.qrPath || readRecordString(data, 'qr_path') || `${path}/qr`,
  }
}
