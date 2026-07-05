import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read.ts'
import {
  compactMenuDetailRecord,
  type MenuDetailScope,
  type MenuDetailSource,
} from './types.ts'

export function menuSourceFromData(
  data: Record<string, unknown>,
  scope: MenuDetailScope = {}
) {
  const source = readRecord(data.source)

  return compactMenuDetailRecord<MenuDetailSource>({
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
