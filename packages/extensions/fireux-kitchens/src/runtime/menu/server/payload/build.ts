import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import type { MenuDetailPayload } from '../../models/menu-detail.model'
import type { MenuPayloadScope, MenuPayloadSourceKind } from './types'
import { buildMenuManifestPayload } from './manifest'
import { buildMenuDocumentPayload } from './document'
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const readMenuSourceKind = (
  data: Record<string, unknown>
): MenuPayloadSourceKind =>
  readRecordString(data, 'source_kind') === 'kitchen-menu' ||
  readRecordString(data, 'kind') === 'menu'
    ? 'menu'
    : 'doc'

const sourceMenuData = (scope: MenuPayloadScope) => record(scope.sourceMenu)

export async function buildMenuPayload(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
): Promise<MenuDetailPayload> {
  const scopedMenu = Object.keys(sourceMenuData(scope)).length
    ? sourceMenuData(scope)
    : data
  const kitchenMenu =
    scope.sourceKind === 'kitchen-menu' ||
    Boolean(scope.kitchenId && Object.keys(sourceMenuData(scope)).length)
  if (kitchenMenu && text(record(scopedMenu.doc).url)) {
    return buildMenuDocumentPayload(menuId, scopedMenu, {
      ...scope,
      sourceKind: 'kitchen-menu',
    })
  }
  const sourceKind =
    scope.sourceKind === 'kitchen-menu'
      ? 'menu'
      : (scope.sourceKind ?? readMenuSourceKind(data))

  return sourceKind === 'menu'
    ? await buildMenuManifestPayload(menuId, data, scope)
    : buildMenuDocumentPayload(menuId, data, scope)
}
