import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { readMenuPageStyle } from './menu-page-style.ts'
import {
  isMenuOrderingEnabled,
  readMenuOrderingConfig,
} from './menu-ordering.ts'
import {
  compactMenuFile,
  hasMenuFile,
  menuFileKind,
  readMenuDocumentKind,
  readMenuFile,
} from './menu-surface-file.ts'
import { menuSourceFromData } from './menu-surface-source.ts'
import {
  type MenuSurfaceKind,
  type MenuSurfaceScope,
} from './menu-surface-types.ts'
import { readMenuViews } from './menu-surface-view.ts'

const menuSlug = (data: Record<string, unknown>, docId: string) =>
  readRecordString(data, 'slug') || docId

const menuPath = (slug: string) => `/menus/${encodeURIComponent(slug)}`

const readMenuSourceKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'source_kind') ||
  readRecordString(data, 'kind')

export function menuSurfaceFromData(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuSurfaceScope = {}
) {
  const slug = menuSlug(data, menuId)
  const path = scope.path || readRecordString(data, 'path') || menuPath(slug)
  const file = readMenuFile(data)
  const sourceKind = scope.sourceKind ?? readMenuSourceKind(data)
  const kind: MenuSurfaceKind = sourceKind === 'kitchen-menu' || sourceKind === 'menu'
    ? 'menu'
    : 'doc'
  const fileKind = menuFileKind({
    file,
    storedKind: readMenuDocumentKind(data),
  })
  const source = menuSourceFromData(data, scope)
  const createdBy = readRecordString(data, 'created_by')
  const createdByLabel =
    scope.createdByLabel ?? readRecordString(data, 'created_by_label')
  const description = readRecordString(data, 'description')
  const status = readRecordString(data, 'status')
  const pageStyle = readMenuPageStyle(scope.page_style)
  const ordering = readMenuOrderingConfig(data, scope.fulfilment)
  const orderingEnabled = isMenuOrderingEnabled(ordering)
  const menuViews = kind === 'menu'
    ? readMenuViews(data, orderingEnabled)
    : []
  const result = {
    id: menuId,
    slug,
    name: readRecordString(data, 'name') || slug,
    path,
    qr_path: scope.qrPath || readRecordString(data, 'qr_path') || `${path}/qr`,
    kind,
    ...(description ? { description } : {}),
    ...(status ? { status } : {}),
    ...(ordering.order_types.length ? { ordering } : {}),
    ...(kind === 'menu' && menuViews.length ? { public_views: menuViews } : {}),
    ...(kind === 'menu' && Array.isArray(scope.public_choices) && scope.public_choices.length
      ? { public_choices: scope.public_choices }
      : {}),
    ...(kind === 'doc' ? { file_kind: fileKind } : {}),
    ...(kind === 'doc' && hasMenuFile(file) ? { file: compactMenuFile(file) } : {}),
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
