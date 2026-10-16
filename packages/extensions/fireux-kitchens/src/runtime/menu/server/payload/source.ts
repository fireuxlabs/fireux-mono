import {
  compactMenuPayloadRecord,
  type MenuPayloadScope,
  type MenuPayloadSource,
} from './types.ts'

export function menuSourceFromData(
  _data: Record<string, unknown>,
  scope: MenuPayloadScope = {}
) {
  return compactMenuPayloadRecord<MenuPayloadSource>({
    app_id: scope.kitchenAppId,
    kitchen_id: scope.kitchenId,
    kitchen_slug: scope.kitchenSlug,
    kitchen_name: scope.kitchenName,
    menu_id: scope.kitchenMenuId,
    menu_slug: scope.kitchenMenuSlug,
  })
}
