import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { type Place } from '../../models/place.model.ts'
import { normalizePlace } from '../../utils/normalize-place'

export async function readPlace(id: string): Promise<Place | null> {
  const latest = await getRuntimeFirestore()
    .collection('places')
    .doc(id)
    .get()
  return latest.exists ? normalizePlace(latest.id, latest.data()) : null
}
