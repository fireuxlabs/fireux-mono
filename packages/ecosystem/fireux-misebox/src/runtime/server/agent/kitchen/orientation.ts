import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  readKitchenRelatedRecords,
  resolveKitchen,
  type KitchenRootRecord,
} from 'fireux-kitchens/runtime/kitchen/server/identity/read'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import {
  KITCHEN_ACCESS_COLLECTION_PATH,
  readKitchenAccessIds,
} from 'fireux-kitchens/runtime/kitchen/utils/kitchen-access'

export async function readKitchenAgentOrientation(uid: string, appId: string) {
  const db = getRuntimeFirestore()
  const [membership, access] = await Promise.all([
    db.doc(`apps/${appId}/users/${uid}`).get(),
    db.collection(KITCHEN_ACCESS_COLLECTION_PATH).doc(uid).get(),
  ])
  if (!resolveAppUserAccess(membership.data()).hasMembership) return []
  const ids = readKitchenAccessIds(access.data(), membership.data(), appId)
  if (!ids.length) return []

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
