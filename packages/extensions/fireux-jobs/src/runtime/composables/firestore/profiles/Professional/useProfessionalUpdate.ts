import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate.ts'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/firestore/useFirestoreUtils.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'
import { usePlaceSave } from 'fireux-places/runtime/composables/usePlaceSave.ts'
import { useFirestore } from 'vuefire'
import { arrayRemove, arrayUnion, doc, getDoc } from 'firebase/firestore'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/usePlacesGoogle.ts'
import type {
  RelevantExperienceItem,
  OtherExperienceItem,
} from '../../../../models/profiles/Professional.model'

const COLLECTION = 'professionals'

export function useProfessionalUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { waitForCurrentUser } = useFirestoreUtils()
  const { ensurePlaceExists } = usePlaceSave()
  const { uploadImage } = useImageStorage()
  const db = useFirestore()

  async function getUid(): Promise<string> {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  async function setRelevantExperience(
    items: RelevantExperienceItem[] = []
  ): Promise<void> {
    const uid = await getUid()

    const professionalRef = doc(db, COLLECTION, uid)
    const snapshot = await getDoc(professionalRef)
    const previousItems = Array.isArray(snapshot.data()?.relevant_experience)
      ? (snapshot.data()?.relevant_experience as RelevantExperienceItem[])
      : []

    const previousPlaceIds = new Set(
      previousItems
        .map((item) => canonicalPlaceId(item?.place_id ?? undefined))
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    )

    const sanitized: RelevantExperienceItem[] = []
    const roster = new Map<string, boolean>()

    for (const item of items) {
      const placeId = canonicalPlaceId(item?.place_id ?? undefined)
      if (!placeId) continue

      const normalized: RelevantExperienceItem = {
        ...item,
        place_id: placeId,
        ongoing: item?.ongoing === true,
      }

      sanitized.push(normalized)

      if (roster.get(placeId) === true) continue
      roster.set(placeId, normalized.ongoing === true)
    }

    const newPlaceIds = new Set(roster.keys())

    const removalTargets = [...previousPlaceIds].filter(
      (placeId) => !newPlaceIds.has(placeId)
    )

    const placeTasks: Promise<void>[] = []

    for (const [placeId, isCurrent] of roster) {
      await ensurePlaceExists({
        place_id: placeId,
        name: '(unknown)',
        formatted_address: '',
        lat: 0,
        lng: 0,
        source: 'firestore',
        search_term: placeId,
        created_at: new Date(),
      } as any)

      placeTasks.push(
        updateDocument('places', placeId, {
          professionals_current: isCurrent ? arrayUnion(uid) : arrayRemove(uid),
          professionals_alumni: isCurrent ? arrayRemove(uid) : arrayUnion(uid),
        })
      )
    }

    for (const placeId of removalTargets) {
      placeTasks.push(
        updateDocument('places', placeId, {
          professionals_current: arrayRemove(uid),
          professionals_alumni: arrayRemove(uid),
        })
      )
    }

    await Promise.all(placeTasks)

    await updateDocument(COLLECTION, uid, {
      relevant_experience: sanitized,
    })
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

  async function updateDisplayName(display_name: string): Promise<void> {
    const uid = await getUid()
    await updateDocument(COLLECTION, uid, { display_name })
  }

  async function updateAvatar(source: Blob | string): Promise<string> {
    const uid = await getUid()
    const path = `${COLLECTION}/${uid}/avatar`
    const url = await uploadImage(path, source)
    await updateDocument(COLLECTION, uid, { avatar: url })
    return url
  }

  return {
    updateDisplayName,
    updateAvatar,
    setRelevantExperience,
    setOtherExperience,
  }
}
