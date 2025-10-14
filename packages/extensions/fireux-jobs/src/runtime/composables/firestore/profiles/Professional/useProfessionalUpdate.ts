/* eslint-disable no-console */
import { useFirestoreUtils } from '#fireux-core-runtime/composables/firestore/useFirestoreUtils'
import { useFirestoreUpdate } from '#fireux-core-runtime/composables/firestore/useFirestoreUpdate'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/usePlacesGoogle.ts'
import type {
  RelevantExperienceItem,
  OtherExperienceItem,
} from '../../../../models/profiles/Professional.model'

const COLLECTION = 'professionals'

export function useProfessionalUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { waitForCurrentUser } = useFirestoreUtils()

  async function getUid(): Promise<string> {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  // TODO: implement ensurePlaceExists + alumni/ongoing flags, then update profile.
  async function setRelevantExperience(
    _items: RelevantExperienceItem[] = []
  ): Promise<void> {
    console.warn(
      '[jobs][useProfessionalUpdate] setRelevantExperience not implemented yet'
    )
  }

  // Overwrite the whole array. Minimal transform: canonicalize optional place_id.
  async function setOtherExperience(
    items: OtherExperienceItem[] = []
  ): Promise<void> {
    const uid = await getUid()

    const normalized = items.map((item) => ({
      ...item,
      // keep it optional, but if present make sure it’s canonical
      place_id: item.place_id
        ? canonicalPlaceId(item.place_id) ?? null
        : undefined,
    }))

    await updateDocument(COLLECTION, uid, {
      other_experience: normalized,
    })
  }

  return {
    setRelevantExperience,
    setOtherExperience,
  }
}
