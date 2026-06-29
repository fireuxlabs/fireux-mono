import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import {
  compactMenuSurfaceRecord,
  type MenuSurfaceScope,
  type MenuSurfaceSource,
} from './types.ts'

export function menuSourceFromData(
  data: Record<string, unknown>,
  scope: MenuSurfaceScope = {}
) {
  const source = readRecord(data.source)

  return compactMenuSurfaceRecord<MenuSurfaceSource>({
    app_id:
      scope.kitchenAppId ||
      readRecordString(source, 'app_id'),
    kitchen_id:
      scope.kitchenId ||
      readRecordString(source, 'kitchen_id'),
    kitchen_slug:
      scope.kitchenSlug ||
      readRecordString(source, 'kitchen_slug'),
    kitchen_name:
      scope.kitchenName ||
      readRecordString(source, 'kitchen_name'),
    menu_id:
      scope.kitchenMenuId ||
      readRecordString(source, 'menu_id'),
  })
}
