import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { getRuntimeIdentityFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { UserStorage } from 'fireux-core/runtime/models/core/user.model.ts'
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
  sourceKind?: string
  viewLabel?: string
  viewTo?: string
  path?: string
  qrPath?: string
  createdByLabel?: string
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

const readMenuSourceKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'source_kind') ||
  readRecordString(data, 'kind')

const readMenuDocumentKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'doc_kind') ||
  readRecordString(data, 'kind')

function appPublicOrigin(appData: Record<string, unknown>) {
  const links = appData.social_links
  const socialLinks = links && typeof links === 'object' && !Array.isArray(links)
    ? links as Record<string, unknown>
    : {}

  return origin(socialLinks.website) || origin(appData.source_url)
}

const uniqueText = (values: unknown[]) =>
  Array.from(new Set(values.map((value) => text(value)).filter(Boolean)))

const userDisplayLabel = (data: Record<string, unknown>) =>
  readRecordString(data, 'display_name') ||
  readRecordString(data, 'displayName') ||
  readRecordString(data, 'handle')

export async function readPublicMenuCreatorLabels(createdByIds: string[]) {
  const ids = uniqueText(createdByIds)
  if (!ids.length) return new Map<string, string>()

  const db = getRuntimeIdentityFirestore()
  const entries = await Promise.all(
    ids.map(async (id) => {
      const snap = await db.collection(UserStorage.rootCollection).doc(id).get()
      const label = snap.exists ? userDisplayLabel(snap.data() || {}) : ''

      return [id, label || 'User'] as const
    })
  )

  return new Map(entries)
}

export function publicMenuCreatorLabel(
  createdBy: string,
  creatorLabels: Map<string, string>
) {
  if (!createdBy) return 'Guest'

  return creatorLabels.get(createdBy) || 'User'
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
  const sourceKind = scope.sourceKind ?? readMenuSourceKind(data)
  const kind = publicMenuKind({
    sourceKind,
    docName,
    docType,
    storedKind: readMenuDocumentKind(data),
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
    created_by_label:
      scope.createdByLabel ?? readRecordString(data, 'created_by_label'),
    path,
    qr_path: scope.qrPath || readRecordString(data, 'qr_path') || `${path}/qr`,
    view_label: scope.viewLabel || defaultViewLabel(kind),
    view_to: scope.viewTo || path,
  }
}
