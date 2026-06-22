import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'

type MenuSurfaceScope = {
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
  page_style?: Record<string, unknown>
  sections?: unknown[]
}

type MenuSurfaceFile = {
  url?: string
  name?: string
  type?: string
  storage_path?: string
}

type MenuSurfaceSource = {
  app_id?: string
  kitchen_id?: string
  kitchen_slug?: string
  kitchen_name?: string
  menu_id?: string
}

const menuPublicViews = ['classic', 'order'] as const

const menuSlug = (data: Record<string, unknown>, docId: string) =>
  readRecordString(data, 'slug') || docId

const menuPath = (slug: string) => `/menus/${encodeURIComponent(slug)}`

const text = (value: unknown) => String(value ?? '').trim()
const list = (value: unknown) => Array.isArray(value) ? value : []

const menuFileKind = (options: {
  docName: string
  docType: string
  storedKind: string
}) => {
  return documentKindFromFile({
    fileName: options.docName,
    contentType: options.docType,
    storedKind: options.storedKind,
  })
}

const defaultViewLabel = (kind: string) => {
  if (kind === 'menu') return 'View menu'
  if (kind === 'doc') return 'View file'

  return 'View menu'
}

const readMenuSourceKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'source_kind') ||
  readRecordString(data, 'kind')

const readMenuDocumentKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'file_kind') ||
  readRecordString(data, 'doc_kind') ||
  readRecordString(data, 'kind')

const readMenuFile = (data: Record<string, unknown>): MenuSurfaceFile => {
  const file = readRecord(data.file)

  return {
    url: readRecordString(file, 'url') || readRecordString(data, 'file_url') || readRecordString(data, 'doc_url'),
    name: readRecordString(file, 'name') || readRecordString(data, 'file_name') || readRecordString(data, 'doc_name'),
    type: readRecordString(file, 'type') || readRecordString(data, 'file_type') || readRecordString(data, 'doc_type'),
    storage_path:
      readRecordString(file, 'storage_path') ||
      readRecordString(data, 'file_storage_path') ||
      readRecordString(data, 'doc_storage_path'),
  }
}

const hasFile = (file: MenuSurfaceFile) =>
  Boolean(file.url || file.name || file.type || file.storage_path)

const compactFile = (file: MenuSurfaceFile) =>
  Object.fromEntries(
    Object.entries(file).filter(([, value]) => Boolean(text(value)))
  ) as MenuSurfaceFile

const compactSource = (source: MenuSurfaceSource) =>
  Object.fromEntries(
    Object.entries(source).filter(([, value]) => Boolean(text(value)))
  ) as MenuSurfaceSource

const readMenuPublicViews = (
  data: Record<string, unknown>,
  orderingEnabled: boolean
) => {
  const configured = list(data.public_views)
    .map(text)
    .filter((view): view is (typeof menuPublicViews)[number] =>
      menuPublicViews.includes(view as (typeof menuPublicViews)[number])
    )

  const fallback = orderingEnabled ? [...menuPublicViews] : ['classic']
  const views = configured.length ? configured : fallback

  return views.filter((view) => view === 'classic' || orderingEnabled)
}

export function menuSourceFromData(
  data: Record<string, unknown>,
  scope: MenuSurfaceScope = {}
) {
  const source = readRecord(data.source)

  return compactSource({
    app_id:
      scope.kitchenAppId ||
      readRecordString(source, 'app_id') ||
      readRecordString(data, 'kitchen_app_id'),
    kitchen_id:
      scope.kitchenId ||
      readRecordString(source, 'kitchen_id') ||
      readRecordString(data, 'kitchen_id'),
    kitchen_slug:
      scope.kitchenSlug ||
      readRecordString(source, 'kitchen_slug') ||
      readRecordString(data, 'kitchen_slug'),
    kitchen_name:
      scope.kitchenName ||
      readRecordString(source, 'kitchen_name') ||
      readRecordString(data, 'kitchen_name'),
    menu_id:
      scope.kitchenMenuId ||
      readRecordString(source, 'menu_id') ||
      readRecordString(data, 'kitchen_menu_id'),
  })
}

export function menuSurfaceFromData(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuSurfaceScope = {}
) {
  const slug = menuSlug(data, menuId)
  const path = scope.path || readRecordString(data, 'path') || menuPath(slug)
  const file = readMenuFile(data)
  const sourceKind = scope.sourceKind ?? readMenuSourceKind(data)
  const kind = sourceKind === 'kitchen-menu' || sourceKind === 'menu'
    ? 'menu'
    : 'doc'
  const fileKind = menuFileKind({
    docName: file.name || '',
    docType: file.type || '',
    storedKind: readMenuDocumentKind(data),
  })
  const source = menuSourceFromData(data, scope)
  const createdBy = readRecordString(data, 'created_by')
  const createdByLabel =
    scope.createdByLabel ?? readRecordString(data, 'created_by_label')
  const description = readRecordString(data, 'description')
  const status = readRecordString(data, 'status')
  const pageStyle = readRecord(scope.page_style)
  const orderingModes = list(data.ordering_modes).length
    ? list(data.ordering_modes).map(text).filter(Boolean)
    : list(data.service_modes).map(text).filter(Boolean)
  const orderingEnabled =
    data.ordering_enabled === true || orderingModes.length > 0
  const publicViews = readMenuPublicViews(data, orderingEnabled)
  const result = {
    id: menuId,
    slug,
    name: readRecordString(data, 'name') || slug,
    path,
    qr_path: scope.qrPath || readRecordString(data, 'qr_path') || `${path}/qr`,
    kind,
    view_label: scope.viewLabel || defaultViewLabel(kind),
    view_to: scope.viewTo || path,
    ...(description ? { description } : {}),
    ...(status ? { status } : {}),
    ...(orderingEnabled ? { ordering_enabled: true } : {}),
    ...(orderingModes.length ? { ordering_modes: orderingModes } : {}),
    ...(publicViews.length ? { public_views: publicViews } : {}),
    ...(kind === 'doc' ? { file_kind: fileKind } : {}),
    ...(kind === 'doc' && hasFile(file) ? { file: compactFile(file) } : {}),
    ...(kind === 'menu' && Object.keys(source).length ? { source } : {}),
    ...(kind === 'menu' && Array.isArray(scope.sections) && scope.sections.length
      ? { sections: scope.sections }
      : {}),
    ...(kind === 'menu' && Object.keys(pageStyle).length
      ? { page_style: pageStyle }
      : {}),
    ...(createdBy ? { created_by: createdBy } : {}),
    ...(createdByLabel ? { created_by_label: createdByLabel } : {}),
  }

  return result
}
