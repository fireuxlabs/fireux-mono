import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  readKitchenRelatedRecords,
  resolveKitchen,
  type KitchenRootRecord,
} from 'fireux-kitchens/runtime/kitchen/server/identity/read'
import { resolveKitchenWorkspaceTargetIds } from 'fireux-kitchens/runtime/kitchen/server/core/workspace-targets'

export async function readKitchenAgentOrientation(uid: string) {
  const ids = await resolveKitchenWorkspaceTargetIds(uid)
  if (!ids.length) return []

  const db = getRuntimeFirestore()
  const snapshots = await db.getAll(
    ...ids.map((id) => db.doc(`kitchens/${id}`))
  )
  const roots: KitchenRootRecord[] = snapshots.flatMap((snapshot) =>
    snapshot.exists ? [{ id: snapshot.id, data: snapshot.data() || {} }] : []
  )
  const related = await readKitchenRelatedRecords(db, roots, {})

  return roots.flatMap((root) => {
    const kitchen = resolveKitchen(root, related, {})
    const name = String(kitchen?.place.name || '').trim()
    return kitchen && name ? [{ id: kitchen.id, name }] : []
  })
}
