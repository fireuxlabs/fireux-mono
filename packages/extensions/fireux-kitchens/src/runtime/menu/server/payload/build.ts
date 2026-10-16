import type { MenuDetailPayload } from '../../models/menu-detail.model'
import type { MenuPayloadScope } from './types'
import { buildMenuManifestPayload } from './manifest'
import { buildMenuDocumentPayload } from './document'

export async function buildMenuPayload(
  menuId: string,
  data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
): Promise<MenuDetailPayload> {
  return data.format === 'document'
    ? buildMenuDocumentPayload(menuId, data, scope)
    : await buildMenuManifestPayload(menuId, data, scope)
}
