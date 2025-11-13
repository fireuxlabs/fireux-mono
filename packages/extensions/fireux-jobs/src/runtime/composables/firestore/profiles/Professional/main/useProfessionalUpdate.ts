import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/operations/useFirestoreUpdate.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/firebase/useRequireUser.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { usePlaceSave } from 'fireux-places/runtime/composables/usePlaceSave.ts'
import { useFirestore } from 'vuefire'
import { arrayRemove, arrayUnion, doc, getDoc } from 'firebase/firestore'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/usePlacesGoogle.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/firestore/core/profile/main/useProfileFetch.ts'
import type {
  RelevantExperienceItem,
  OtherExperienceItem,
  ProfessionalProfile,
} from '../../../../../models/profiles/Professional.model.ts'

const COLLECTION = 'professionals'

export function useProfessionalUpdate(
  _profile?: ProfileRefs<ProfessionalProfile>
) {
  const { updateDocument } = useFirestoreUpdate()
  const { ensurePlaceExists } = usePlaceSave()
  const db = useFirestore()
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId

  type UpdateOptions = { id?: string | null }

  const resolveUid = async (explicit?: string | null): Promise<string> => {
    if (explicit?.trim()) return explicit.trim()
    const u = await useRequireUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const updateCoreProfessional = async (
    payload: Partial<ProfessionalProfile>,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await updateDocument(COLLECTION, uid, payload)
  }

  const updateAppProfessional = async (
    payload: Partial<ProfessionalProfile>,
    options: UpdateOptions = {}
  ): Promise<void> => {
    if (!isTenant || !appId) {
      throw new Error(
        'Missing tenant context for app-scoped professional update'
      )
    }
    const uid = await resolveUid(options.id)
    await updateDocument(`apps/${appId}/${COLLECTION}`, uid, payload)
  }

  async function setRelevantExperience(
    items: RelevantExperienceItem[] = []
  ): Promise<void> {
    const uid = await resolveUid()

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

    await updateCoreProfessional(
      {
        relevant_experience: sanitized,
      },
      { id: uid }
    )
  }

  // Overwrite the whole array. Minimal transform: canonicalize optional place_id.
  async function setOtherExperience(
    items: OtherExperienceItem[] = []
  ): Promise<void> {
    const uid = await resolveUid()

    const normalized = items.map((item) => ({
      ...item,
      // keep it optional, but if present make sure it’s canonical
      place_id: item.place_id
        ? canonicalPlaceId(item.place_id) ?? null
        : undefined,
    }))

    await updateCoreProfessional(
      {
        other_experience: normalized,
      },
      { id: uid }
    )
  }

  return {
    updateCoreProfessional,
    updateAppProfessional,
    setRelevantExperience,
    setOtherExperience,
  }
}
