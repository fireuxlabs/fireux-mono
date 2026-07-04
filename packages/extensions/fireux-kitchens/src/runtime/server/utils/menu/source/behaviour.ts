import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import type { MenuDetailSource } from '../public/types.ts'

export async function readMenuSourceData(source: MenuDetailSource) {
  if (!source.app_id || !source.kitchen_id || !source.menu_id) return {}

  const snap = await getRuntimeFirestore()
    .collection(`apps/${source.app_id}/kitchens/${source.kitchen_id}/menus`)
    .doc(source.menu_id)
    .get()
  if (!snap.exists) return {}

  const data = snap.data() || {}
  return readRecordString(data, 'status') === 'published' ? data : {}
}

export function menuDataWithSourceMenu(
  rootMenuData: Record<string, unknown>,
  sourceData: Record<string, unknown>
) {
  if (!Object.keys(sourceData).length) return rootMenuData

  const name = sourceData.name ?? rootMenuData.name
  const description = sourceData.description ?? rootMenuData.description
  const status = sourceData.status ?? rootMenuData.status
  const ordering = sourceData.ordering ?? rootMenuData.ordering

  return {
    ...rootMenuData,
    ...(name ? { name } : {}),
    ...(description ? { description } : {}),
    ...(status ? { status } : {}),
    ...(ordering ? { ordering } : {}),
  }
}
