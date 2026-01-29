// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalUpdate.ts
// flag

import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
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

const normalizePlaceId = (value?: unknown) => {
  const raw = typeof value === 'string' ? value.trim() : ''
  return raw.replace(/^places\//, '') // tolerate legacy "places/<id>"
}

export function useProfessionalUpdate(profile?: ProfileRefs<ProfessionalCore> | null) {
  const base = useProfileUpdateBase<ProfessionalCore>('professionals', profile)

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

  // Canon: experience stores ONLY place_id (+ experience fields). No place snapshot fields.
  const sanitizeExperienceItems = <T extends { place_id: string; ongoing?: boolean }>(
    items: T[]
  ) => {
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
    const sanitized = sanitizeExperienceItems<RelevantExperienceItem>(items)
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