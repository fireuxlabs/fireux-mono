import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type { PublicPlaceDetailProjection } from '../../models/place-public.model.ts'
import { PlaceStorage } from '../../models/place.model.ts'
import { projectPublicPlaceDetail } from './public-projection'

export async function readPlaceDetailProjection(
  id: string
): Promise<PublicPlaceDetailProjection | null> {
  const latest = await getRuntimeFirestore()
    .collection(PlaceStorage.collection)
    .doc(id)
    .get()
  return latest.exists
    ? projectPublicPlaceDetail(latest.id, latest.data() || {})
    : null
}
