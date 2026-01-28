import { arrayRemove, arrayUnion, doc, getDoc } from 'firebase/firestore'
import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
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

type UpdateOptions = { id?: string | null; scope?: 'core' | 'app' }

const normalizePlaceId = (value?: unknown) => (typeof value === 'string' ? value.trim() : '')

export function useProfessionalUpdate(profile?: ProfileRefs<ProfessionalCore> | null) {
  const base = useProfileUpdateBase<ProfessionalCore>('professionals', profile)
  const { updateDocument } = useFirestoreUpdate()
  const { ensurePlaceExists } = usePlaceSave()
  const db = useFirestore()
  const updateCoreProfile = base.updateCoreProfile
  const updateAppProfile = base.updateAppProfile
  const commitUpdate = base.commitUpdate

  const updateStringField = async <K extends keyof ProfessionalCore>(
    key: K,
    value: string,
    options: UpdateOptions = {}
  ) => {
    await commitUpdate(
      { [key]: base.cleanString(value) ?? '' } as unknown as Partial<ProfessionalCore>,
      options
    )
  }

  const updateStringArrayField = async <K extends keyof ProfessionalCore>(
    key: K,
    csvOrList: string | string[],
    options: UpdateOptions = {}
  ) => {
    await commitUpdate(
      { [key]: base.toStringArray(csvOrList) } as unknown as Partial<ProfessionalCore>,
      options
    )
  }

  const updateTypedArrayField = async <K extends keyof ProfessionalCore, T>(
    key: K,
    items: T[],
    options: UpdateOptions = {}
  ) => {
    await commitUpdate(
      { [key]: items ?? [] } as unknown as Partial<ProfessionalCore>,
      options
    )
  }

  const sanitizeExperienceItems = <T extends { place_id: string; ongoing?: boolean }>(items: T[]) => {
    const sanitized: T[] = []
    for (const item of items ?? []) {
      const placeId = normalizePlaceId((item as any)?.place_id)
      if (!placeId) continue
      sanitized.push({
        ...item,
        place_id: placeId,
        ongoing: (item as any)?.ongoing === true,
      })
    }
    return sanitized
  }

  const setRelevantExperience = async (
    items: RelevantExperienceItem[] = [],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const uid = await base.resolveUid(options.id)

    const professionalRef = doc(db, 'professionals', uid)
    const snapshot = await getDoc(professionalRef)

    const previousItems = Array.isArray(snapshot.data()?.relevant_experience)
      ? (snapshot.data()?.relevant_experience as RelevantExperienceItem[])
      : []

    const previousPlaceIds = new Set(
      previousItems.map((item) => normalizePlaceId((item as any)?.place_id)).filter(Boolean)
    )

    const sanitized = sanitizeExperienceItems<RelevantExperienceItem>(items)

    const roster = new Map<string, boolean>()
    for (const item of sanitized) {
      if (roster.has(item.place_id)) continue
      roster.set(item.place_id, item.ongoing === true)
    }

    const newPlaceIds = new Set(roster.keys())
    const removalTargets = [...previousPlaceIds].filter((placeId) => !newPlaceIds.has(placeId))

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
    await commitUpdate({ relevant_experience: sanitized }, options)
  }

  const setOtherExperience = async (
    items: OtherExperienceItem[] = [],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const sanitized = sanitizeExperienceItems<OtherExperienceItem>(items)
    await commitUpdate({ other_experience: sanitized }, options)
  }

  const updateJobTitle = (value: string, options: UpdateOptions = {}) =>
    updateStringField('job_title', value, options)

  const updateSummary = (value: string, options: UpdateOptions = {}) =>
    updateStringField('summary', value, options)

  const updateBio = (value: string, options: UpdateOptions = {}) =>
    updateStringField('bio', value, options)

  const updateImage = (value: string, options: UpdateOptions = {}) =>
    updateStringField('image', value, options)

  const updatePositions = (value: string | string[], options: UpdateOptions = {}) =>
    updateStringArrayField('positions', value, options)

  const updateLanguages = async (languages: LanguageProficiency[], options: UpdateOptions = {}) => {
    const next = (languages ?? [])
      .map((item) => ({
        language: base.cleanString(item?.language),
        proficiency: base.cleanString(item?.proficiency),
      }))
      .filter((item) => (item.language ?? '').length > 0)

    await updateTypedArrayField('languages', next, options)
  }

  const updateCertifications = (items: CertificationItem[], options: UpdateOptions = {}) =>
    updateTypedArrayField('certifications', items ?? [], options)

  const updateEducation = (items: EducationItem[], options: UpdateOptions = {}) =>
    updateTypedArrayField('education', items ?? [], options)

  const updateVolunteering = (items: VolunteeringItem[], options: UpdateOptions = {}) =>
    updateTypedArrayField('volunteering', items ?? [], options)

  const updateProjects = (items: ProjectItem[], options: UpdateOptions = {}) =>
    updateTypedArrayField('projects', items ?? [], options)

  return {
    commitUpdate,
    updateCoreProfile,
    updateAppProfile,
    setRelevantExperience,
    setOtherExperience,
    updateJobTitle,
    updateSummary,
    updateBio,
    updateImage,
    updatePositions,
    updateLanguages,
    updateCertifications,
    updateEducation,
    updateVolunteering,
    updateProjects,
  }
}
