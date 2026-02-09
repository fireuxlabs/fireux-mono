import type { Firestore } from 'firebase/firestore'
import { doc, getDoc } from 'firebase/firestore'
import type { MapToBasePlace } from './types'

export const resolveExistingPlace = async (
  db: Firestore,
  collection: string,
  id: string,
  mapToCard: MapToBasePlace
) => {
  try {
    const ref = doc(db, collection, id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return mapToCard({ id, ...snap.data() }, collection)
  } catch {
    return null
  }
}
