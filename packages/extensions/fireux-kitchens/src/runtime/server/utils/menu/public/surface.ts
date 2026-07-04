import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { readMenuPageStyle } from './page-style.ts'
import { readMenuOrderingConfig } from '../ordering/config.ts'
import {
  compactMenuFile,
  hasMenuFile,
  menuFileKind,
  readMenuDocumentKind,
  readMenuFile,
} from './file.ts'
import { menuSourceFromData } from './source.ts'
import {
  type MenuSurfaceKind,
  type MenuSurfaceScope,
} from './types.ts'

const menuPath = (publicId: string) => `/menus/${encodeURIComponent(publicId)}`

const readMenuSourceKind = (data: Record<string, unknown>) =>
  readRecordString(data, 'source_kind') ||
  readRecordString(data, 'kind')

export function menuSurfaceFromData(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuSurfaceScope = {}
) {
  const path = scope.path || menuPath(menuId)
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
  const ordering = readMenuOrderingConfig(
    data,
    scope.fulfilment,
    scope.kitchen_operation_hours
  )
  const result = {
    id: menuId,
    name: readRecordString(data, 'name') || menuId,
    path,
    qr_path: scope.qrPath || `${path}/qr`,
    kind,
    ...(description ? { description } : {}),
    ...(status ? { status } : {}),
    ...(ordering.order_types.length ? { ordering } : {}),
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
