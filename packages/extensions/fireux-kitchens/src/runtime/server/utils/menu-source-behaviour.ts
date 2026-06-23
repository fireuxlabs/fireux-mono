import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import type { MenuSurfaceSource } from './menu-surface-types.ts'

export async function readMenuSourceData(source: MenuSurfaceSource) {
  if (!source.app_id || !source.kitchen_id || !source.menu_id) return {}

  const snap = await getRuntimeFirestore()
    .collection(`apps/${source.app_id}/kitchens/${source.kitchen_id}/menus`)
    .doc(source.menu_id)
    .get()
  if (!snap.exists) return {}

  const data = snap.data() || {}
  return readRecordString(data, 'status') === 'published' ? data : {}
}

export function menuSurfaceDataWithSourceBehaviour(
  doorwayData: Record<string, unknown>,
  sourceData: Record<string, unknown>
) {
  if (!Object.keys(sourceData).length) return doorwayData

  // Public menu doorway spine: docs/concepts/family-menu.md. Root doorways keep stable paths; source menus own structured behaviour.
  return {
    ...doorwayData,
    ordering_enabled: sourceData.ordering_enabled,
    ordering_modes: sourceData.ordering_modes,
    public_views: sourceData.public_views,
  }
}
