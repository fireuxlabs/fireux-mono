import { arrayRemove, arrayUnion, doc, getDoc } from 'firebase/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { usePlaceSave } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/mutations/usePlaceSave'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { useFirestore } from 'vuefire'
import type { ProfessionalCore } from '../../../../../../models/profiles/Professional/Professional.model'
import type {
  CertificationItem,
  EducationItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from '../../../../../../models/profiles/Professional/supporting'

const COLLECTION = 'professionals'

type UpdateOptions = { id?: string | null; scope?: 'core' | 'app' }

const pruneUndefined = <T extends Record<string, any>>(
  payload: Partial<T>
) => {
  const entries = Object.entries(payload).filter(
    ([, value]) => value !== undefined
  )
  return Object.fromEntries(entries) as Partial<T>
}

const normalizeStringArray = (items: string[] = []) =>
  Array.from(
    new Set(
      items
        .map((item) => (item ?? '').trim())
        .filter((item) => item.length > 0)
    )
  )

export function useProfessionalUpdate(
  profile?: ProfileRefs<ProfessionalCore>
) {
  const { updateDocument } = useFirestoreUpdate()
  const { ensurePlaceExists } = usePlaceSave()
  const db = useFirestore()
  const { appId, role } = useFireUXConfig()
  const isTenant = role === 'tenant' && Boolean(appId)

  const commitUpdate = async (
    patch: Partial<ProfessionalCore>,
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
    patch: Partial<ProfessionalCore>,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await updateDocument<ProfessionalCore>(
      COLLECTION,
      uid,
      pruneUndefined(patch)
    )
  }

  const updateAppProfile = async (
    patch: Partial<ProfessionalCore>,
    options: UpdateOptions = {}
  ): Promise<void> => {
    if (!isTenant || !appId) {
      throw new Error(
        '[useProfessionalUpdate] Tenant context required for app profile updates'
      )
    }

    const uid = await resolveUid(options.id)
    await updateDocument<ProfessionalCore>(
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
      const placeholder: PlaceUpsertInput = {
        id: placeId,
        name: '(unknown)',
        formatted_address: '',
        lat: 0,
        lng: 0,
        place_image: '',
        image_shade: 'neutral',
        claimed_by: '',
        source: 'fireux',
        search_term: placeId,
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

    const normalized: OtherExperienceItem[] = items
      .map((item) => {
        const placeId = canonicalPlaceId(item.place_id) ?? ''
        return { ...item, place_id: placeId }
      })
      .filter((item) => Boolean(item.place_id))

    await commitUpdate(
      {
        other_experience: normalized,
      },
      { ...options, id: uid }
    )
  }

  const updateBioShort = async (
    bioShort: string,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const value = (bioShort ?? '').trim()
    await commitUpdate({ bio_short: value }, { ...options, id: uid })
  }

  const updateBioLong = async (
    bioLong: string,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const value = (bioLong ?? '').trim()
    await commitUpdate({ bio_long: value }, { ...options, id: uid })
  }

  const updateTitle = async (
    title: string,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const value = (title ?? '').trim()
    await commitUpdate({ title: value }, { ...options, id: uid })
  }

  const updateHeadline = async (
    value: string,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const next = (value ?? '').trim()
    await commitUpdate(
      { professional_headline: next || undefined },
      { ...options, id: uid }
    )
  }

  const updateSummary = async (
    value: string,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const next = (value ?? '').trim()
    await commitUpdate(
      { professional_summary: next || undefined },
      { ...options, id: uid }
    )
  }

  const updateBio = async (
    value: string,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const next = (value ?? '').trim()
    await commitUpdate(
      { professional_bio: next || undefined },
      { ...options, id: uid }
    )
  }

  const updateImage = async (
    value: string,
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const next = (value ?? '').trim()
    await commitUpdate(
      { professional_image: next || undefined },
      { ...options, id: uid }
    )
  }

  const updatePositions = async (
    csvOrList: string | string[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const list = Array.isArray(csvOrList)
      ? csvOrList
      : (csvOrList ?? '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
    const unique = normalizeStringArray(list)
    await commitUpdate(
      { professional_positions: unique },
      { ...options, id: uid }
    )
  }

  const updateServiceTypes = async (
    csvOrList: string | string[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const list = Array.isArray(csvOrList)
      ? csvOrList
      : (csvOrList ?? '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
    const unique = normalizeStringArray(list)
    await commitUpdate(
      { professional_service_types: unique },
      { ...options, id: uid }
    )
  }

  const updateWorkAreas = async (
    csvOrList: string | string[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const list = Array.isArray(csvOrList)
      ? csvOrList
      : (csvOrList ?? '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean)
    const unique = normalizeStringArray(list)
    await commitUpdate(
      { professional_work_areas: unique },
      { ...options, id: uid }
    )
  }

  const updateSpecialties = async (
    specialties: string | string[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const list = Array.isArray(specialties)
      ? specialties
      : (specialties ?? '')
          .split(',')
          .map((item) => item.trim())
          .filter((item) => item.length > 0)
    const unique = normalizeStringArray(list)
    await commitUpdate({ specialties: unique }, { ...options, id: uid })
  }

  const updateLocations = async (
    locations: string[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await commitUpdate(
      { locations: normalizeStringArray(locations) },
      { ...options, id: uid }
    )
  }

  const updateHealthCertifications = async (
    healthCertifications: string[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await commitUpdate(
      { health_certifications: normalizeStringArray(healthCertifications) },
      { ...options, id: uid }
    )
  }

  const updateLanguages = async (
    languages: LanguageProficiency[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    const next = (languages ?? [])
      .map((item) => ({
        language: (item?.language ?? '').trim(),
        proficiency: (item?.proficiency ?? '').trim(),
      }))
      .filter((item) => item.language.length > 0)
    await commitUpdate({ languages: next }, { ...options, id: uid })
  }

  const updateCertifications = async (
    certifications: CertificationItem[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await commitUpdate(
      { certifications: certifications ?? [] },
      { ...options, id: uid }
    )
  }

  const updateEducation = async (
    education: EducationItem[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await commitUpdate({ education: education ?? [] }, { ...options, id: uid })
  }

  const updateVolunteering = async (
    volunteering: VolunteeringItem[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await commitUpdate(
      { volunteering: volunteering ?? [] },
      { ...options, id: uid }
    )
  }

  const updateProjects = async (
    projects: ProjectItem[],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await resolveUid(options.id)
    await commitUpdate({ projects: projects ?? [] }, { ...options, id: uid })
  }

  return {
    commitUpdate,
    updateCoreProfile,
    updateAppProfile,
    setRelevantExperience,
    setOtherExperience,
    updateHeadline,
    updateSummary,
    updateBio,
    updateImage,
    updatePositions,
    updateServiceTypes,
    updateWorkAreas,
    updateTitle,
    updateBioShort,
    updateBioLong,
    updateSpecialties,
    updateLocations,
    updateHealthCertifications,
    updateLanguages,
    updateCertifications,
    updateEducation,
    updateVolunteering,
    updateProjects,
  }
}
