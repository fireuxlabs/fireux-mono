import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import {
  kitchenPublicMenuPath,
  kitchenPublicMenuRouteMode,
} from '../../utils/kitchen-public-menu-route.ts'

type PublicMenuScope = {
  kitchenId?: string
  kitchenSlug?: string
  kitchenName?: string
  kitchenAppId?: string
  kitchenMenuId?: string
  viewLabel?: string
  viewTo?: string
  path?: string
  qrPath?: string
}

const menuSlug = (data: Record<string, unknown>, docId: string) =>
  readRecordString(data, 'slug') || docId

const publicMenuPath = (slug: string) => `/menus/${encodeURIComponent(slug)}`

const text = (value: unknown) => String(value ?? '').trim()
const origin = (value: unknown) => text(value).replace(/\/+$/, '')

const publicMenuKind = (options: {
  sourceKind: string
  docName: string
  docType: string
  storedKind: string
}) => {
  if (options.sourceKind === 'kitchen-menu') return 'menu'

  return documentKindFromFile({
    fileName: options.docName,
    contentType: options.docType,
    storedKind: options.storedKind,
  })
}

const defaultViewLabel = (kind: string) => {
  if (kind === 'menu') return 'View menu'
  if (kind === 'photo') return 'View photo'
  if (kind === 'pdf') return 'View PDF'

  return 'View document'
}

function appPublicOrigin(appData: Record<string, unknown>) {
  const links = appData.social_links
  const socialLinks = links && typeof links === 'object' && !Array.isArray(links)
    ? links as Record<string, unknown>
    : {}

  return origin(socialLinks.website) || origin(appData.source_url)
}

export function publicMenuOwnerAppView(options: {
  ownerAppId: string
  currentAppId: string
  ownerAppData: Record<string, unknown>
  ownerAppKitchenCount: number
  kitchenSlug: string
  menuId: string
}) {
  if (!options.ownerAppId || options.ownerAppId === options.currentAppId) {
    return {}
  }

  const publicOrigin = appPublicOrigin(options.ownerAppData)
  const path = kitchenPublicMenuPath({
    mode: kitchenPublicMenuRouteMode(options.ownerAppKitchenCount),
    kitchenSlug: options.kitchenSlug,
    menuId: options.menuId,
  })

  if (!publicOrigin || !path) return {}

  return {
    viewLabel: 'View app',
    viewTo: new URL(path, publicOrigin).toString(),
  }
}

export function publicMenuFromData(
  menuId: string,
  data: Record<string, unknown>,
  scope: PublicMenuScope = {}
) {
  const slug = menuSlug(data, menuId)
  const path = scope.path || readRecordString(data, 'path') || publicMenuPath(slug)
  const docName = readRecordString(data, 'doc_name')
  const docType = readRecordString(data, 'doc_type')
  const sourceKind = readRecordString(data, 'source_kind')
  const kind = publicMenuKind({
    sourceKind,
    docName,
    docType,
    storedKind: readRecordString(data, 'doc_kind'),
  })

  return {
    id: menuId,
    slug,
    name: readRecordString(data, 'name') || slug,
    description: readRecordString(data, 'description'),
    status: readRecordString(data, 'status'),
    doc_url: readRecordString(data, 'doc_url'),
    doc_name: docName,
    doc_type: docType,
    kind,
    doc_storage_path: readRecordString(data, 'doc_storage_path'),
    kitchen_id: scope.kitchenId ?? readRecordString(data, 'kitchen_id'),
    kitchen_slug: scope.kitchenSlug ?? readRecordString(data, 'kitchen_slug'),
    kitchen_name: scope.kitchenName ?? readRecordString(data, 'kitchen_name'),
    kitchen_app_id: scope.kitchenAppId ?? readRecordString(data, 'kitchen_app_id'),
    kitchen_menu_id: scope.kitchenMenuId ?? readRecordString(data, 'kitchen_menu_id'),
    created_by: readRecordString(data, 'created_by'),
    path,
    qr_path: scope.qrPath || readRecordString(data, 'qr_path') || `${path}/qr`,
    view_label: scope.viewLabel || defaultViewLabel(kind),
    view_to: scope.viewTo || path,
  }
}
