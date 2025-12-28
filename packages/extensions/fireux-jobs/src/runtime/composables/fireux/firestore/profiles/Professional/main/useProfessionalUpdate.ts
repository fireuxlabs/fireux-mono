import { arrayRemove, arrayUnion, doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { usePlaceSave } from 'fireux-places/runtime/composables/usePlaceSave.ts'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/usePlacesGoogle.ts'
import type { Place } from 'fireux-places/runtime/models/place.model.ts'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import type {
  ProfessionalProfile,
  RelevantExperienceItem,
  OtherExperienceItem,
} from '../../../../../../models/profiles/Professional/Professional.model'

const COLLECTION = 'professionals'

type UpdateOptions = { id?: string | null; scope?: 'core' | 'app' }

const pruneUndefined = <T extends Record<string, any>>(payload: T) => {
  const entries = Object.entries(payload).filter(
    ([, value]) => value !== undefined
  )
  return Object.fromEntries(entries) as Partial<T>
}

export function useProfessionalUpdate(
  profile?: ProfileRefs<ProfessionalProfile>
) {
  const { updateDocument } = useFirestoreUpdate()
  const { ensurePlaceExists } = usePlaceSave()
  const db = useFirestore()
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant' && Boolean(appId)

  const commitUpdate = async (
    patch: Partial<ProfessionalProfile>,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const scope = options.scope ?? 'core'

    if (scope === 'app') {
      await updateAppProfile(patch, options)
      return
    }

    await updateCoreProfile(patch, options)
  }

  const resolveUid = async (explicit?: string | null): Promise<string> => {
    const trimmed = explicit?.trim()
    if (trimmed) return trimmed

    const fromRefs =
      profile?.coreProfile?.value?.id ?? profile?.appProfile?.value?.id ?? null
    if (fromRefs?.trim()) return fromRefs.trim()

    const user = await useRequireUser()
    if (!user?.uid) {
      throw new Error(
        '[useProfessionalUpdate] Unable to resolve professional id'
      )
    }
    return user.uid
  }

  const updateCoreProfile = async (
    patch: Partial<ProfessionalProfile>,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await updateDocument<ProfessionalProfile>(
      COLLECTION,
      uid,
      pruneUndefined(patch)
    )
  }

  const updateAppProfile = async (
    patch: Partial<ProfessionalProfile>,
    options: UpdateOptions = {}
  ): Promise<void> => {
    if (!isTenant || !appId) {
      throw new Error(
        '[useProfessionalUpdate] Tenant context required for app profile updates'
      )
    }

    const uid = await resolveUid(options.id)
    await updateDocument<ProfessionalProfile>(
      `apps/${appId}/${COLLECTION}`,
      uid,
      pruneUndefined(patch)
    )
  }

  const setRelevantExperience = async (
    items: RelevantExperienceItem[] = [],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)

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
      const placeholder: Place = {
        place_id: placeId,
        name: '(unknown)',
        formatted_address: '',
        lat: 0,
        lng: 0,
        source: 'firestore',
        search_term: placeId,
        created_at: new Date(),
      }

      await ensurePlaceExists(placeholder)

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

    await commitUpdate(
      {
        relevant_experience: sanitized,
      },
      { ...options, id: uid }
    )
  }

  const setOtherExperience = async (
    items: OtherExperienceItem[] = [],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)

    const normalized = items.map((item) => ({
      ...item,
      place_id: item.place_id
        ? canonicalPlaceId(item.place_id) ?? null
        : undefined,
    }))

    await commitUpdate(
      {
        other_experience: normalized,
      },
      { ...options, id: uid }
    )
  }

  const updateTagline = async (
    tagline: string,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const value = (tagline ?? '').trim()
    await commitUpdate({ tagline: value || null }, { ...options, id: uid })
  }

  const updateBioShort = async (
    bioShort: string,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const value = (bioShort ?? '').trim()
    await commitUpdate({ bio_short: value || null }, { ...options, id: uid })
  }

  return {
    commitUpdate,
    updateCoreProfile,
    updateAppProfile,
    setRelevantExperience,
    setOtherExperience,
    updateTagline,
    updateBioShort,
  }
}
