// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/mutations/useProfessionalUpdate.ts
// flag
// Concurrent edit — 2026-07-20 20:17 CEST — Repo Efficiency Pass 2 of 6: expose only bounded single-family Professional mutations.
// Concurrent edit — 2026-07-21 14:08 CEST — Trusted Professional API: route every structured family through fixed-user Admin validation.

import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { normalizeHttpsUrlInput } from 'fireux-core/runtime/utils/httpsUrl'
import {
  ProfessionalConstraints,
  ProfessionalStorage,
  type Professional,
} from '../../../../../../models/profiles/Professional/Professional.model'
import type {
  CertificationItem,
  EducationItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from '../../../../../../models/profiles/Professional/supporting'
import {
  assertProfessionalListLimit as assertListLimit,
  cleanProfessionalText as cleanText,
  cleanProfessionalYear as cleanYear,
  sanitizeProfessionalExperienceItems as sanitizeExperienceItems,
  sortProfessionalItemsByDate as sortItemsByDate,
} from './professionalUpdateValidation'

type UpdateOptions = { id?: string | null }

type StructuredField =
  | 'relevant_experience'
  | 'other_experience'
  | 'languages'
  | 'certifications'
  | 'education'
  | 'volunteering'
  | 'projects'

const STRUCTURED_FIELDS: StructuredField[] = [
  'relevant_experience',
  'other_experience',
  'languages',
  'certifications',
  'education',
  'volunteering',
  'projects',
]

export function useProfessionalUpdate(
  profile?: ProfileRefs<Professional> | null
) {
  const base = useProfileUpdateBase<Professional>(
    ProfessionalStorage.document,
    profile
  )
  const { uploadImage } = useImageStorage()

  const commitUpdate = async (
    patch: Partial<Professional>,
    options: UpdateOptions = {}
  ) => {
    await base.updateProfile(patch, options)
  }

  const assertStructuredTotal = (field: StructuredField, nextCount: number) => {
    const current = profile?.profile?.value
    if (!current) {
      throw new Error(
        'Load the Professional profile before updating its lists.'
      )
    }
    const total = STRUCTURED_FIELDS.reduce(
      (count, key) =>
        count +
        (key === field
          ? nextCount
          : Array.isArray(current[key])
            ? current[key].length
            : 0),
      0
    )
    if (total > ProfessionalConstraints.structuredTotal) {
      throw new Error(
        `Professional details support at most ${ProfessionalConstraints.structuredTotal} structured items in total.`
      )
    }
  }

  const updateStringField = async <K extends keyof Professional>(
    key: K,
    value: string,
    maxSize: number,
    options: UpdateOptions = {}
  ) => {
    await commitUpdate(
      {
        [key]: cleanText(value, maxSize),
      } as unknown as Partial<Professional>,
      options
    )
  }

  const updateStringArrayField = async <K extends keyof Professional>(
    key: K,
    csvOrList: string | string[],
    options: UpdateOptions = {}
  ) => {
    const values = base.toStringArray(csvOrList)
    assertListLimit(values, ProfessionalConstraints.positions, 'Positions')
    const normalized = values.map((value) =>
      cleanText(value, ProfessionalConstraints.stringItemLength, 'Position')
    )
    await commitUpdate(
      { [key]: normalized } as unknown as Partial<Professional>,
      options
    )
  }

  const updateStructuredArrayField = async <T>(
    key: StructuredField,
    items: T[],
    maxItems: number,
    label: string,
    options: UpdateOptions = {}
  ) => {
    assertListLimit(items, maxItems, label)
    assertStructuredTotal(key, items.length)
    const user = await useRequireUser()
    const requestedId = String(options.id ?? '').trim()
    if (requestedId && requestedId !== user.uid) {
      throw new Error('Professional structured updates are self-only.')
    }
    const token = await user.getIdToken()
    await $fetch('/api/internal/profiles/professional/structured', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: { field: key, items: items ?? [] },
    })
  }

  const setRelevantExperience = async (
    items: RelevantExperienceItem[] = [],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const sanitized = sanitizeExperienceItems(items)
    const sorted = sortItemsByDate(sanitized)
    await updateStructuredArrayField(
      'relevant_experience',
      sorted,
      ProfessionalConstraints.relevantExperience,
      'Relevant experience',
      options
    )
  }

  const setOtherExperience = async (
    items: OtherExperienceItem[] = [],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const sanitized = sanitizeExperienceItems(items)
    const sorted = sortItemsByDate(sanitized)
    await updateStructuredArrayField(
      'other_experience',
      sorted,
      ProfessionalConstraints.otherExperience,
      'Other experience',
      options
    )
  }

  const updateTitle = (value: string, options: UpdateOptions = {}) =>
    updateStringField('title', value, 120, options)

  const updateSummary = (value: string, options: UpdateOptions = {}) =>
    updateStringField('summary', value, 1_000, options)

  const updateBio = (value: string, options: UpdateOptions = {}) =>
    updateStringField('bio', value, 4_000, options)

  const updateImage = (value: string, options: UpdateOptions = {}) =>
    commitUpdate(
      {
        image: normalizeHttpsUrlInput(value, {
          label: 'Profile image URL',
          maxLength: ProfessionalConstraints.urlLength,
        }),
      },
      options
    )

  const cacheBust = (url: string) => {
    const stamp = Date.now().toString(36)
    return url.includes('?') ? `${url}&v=${stamp}` : `${url}?v=${stamp}`
  }

  const uploadProfileImage = async (
    source: File | Blob,
    options: UpdateOptions = {}
  ) => {
    const id = await base.resolveUid(
      ProfessionalStorage.document,
      options.id
    )
    const path = `professionals/${id}/image/current`
    const url = await uploadImage(path, source)
    const next = normalizeHttpsUrlInput(cacheBust(url), {
      label: 'Profile image URL',
      maxLength: ProfessionalConstraints.urlLength,
    })
    await commitUpdate({ image: next }, options)
    return next
  }

  const updatePositions = (
    value: string | string[],
    options: UpdateOptions = {}
  ) => updateStringArrayField('positions', value, options)

  const updateLanguages = async (
    languages: LanguageProficiency[],
    options: UpdateOptions = {}
  ) => {
    assertListLimit(
      languages ?? [],
      ProfessionalConstraints.languages,
      'Languages'
    )
    const next = (languages ?? [])
      .map((item) => ({
        language: cleanText(item?.language, 120, 'Language'),
        proficiency: cleanText(item?.proficiency, 120, 'Proficiency'),
      }))
      .filter((item) => item.language.length > 0)

    await updateStructuredArrayField(
      'languages',
      next,
      ProfessionalConstraints.languages,
      'Languages',
      options
    )
  }

  const updateCertifications = (
    items: CertificationItem[],
    options: UpdateOptions = {}
  ) =>
    updateStructuredArrayField(
      'certifications',
      (items ?? []).map((item) => ({
        name: cleanText(item?.name, 240),
        year: cleanYear(item?.year),
        place_name: cleanText(item?.place_name, 240),
        formatted_address: cleanText(item?.formatted_address, 500),
        document_url: normalizeHttpsUrlInput(item?.document_url, {
          label: 'Certification document URL',
          maxLength: ProfessionalConstraints.urlLength,
        }),
        image_url: normalizeHttpsUrlInput(item?.image_url, {
          label: 'Certification image URL',
          maxLength: ProfessionalConstraints.urlLength,
        }),
      })),
      ProfessionalConstraints.certifications,
      'Certifications',
      options
    )

  const updateEducation = (
    items: EducationItem[],
    options: UpdateOptions = {}
  ) => {
    const normalized = (items ?? []).map((item) => ({
      institution: cleanText(item?.institution, 240),
      degree: cleanText(item?.degree, 240),
      start_year: cleanYear(item?.start_year),
      end_year: cleanYear(item?.end_year),
      ongoing: item?.ongoing === true,
      formatted_address: cleanText(item?.formatted_address, 500),
      document_url: normalizeHttpsUrlInput(item?.document_url, {
        label: 'Education document URL',
        maxLength: ProfessionalConstraints.urlLength,
      }),
      image_url: normalizeHttpsUrlInput(item?.image_url, {
        label: 'Education image URL',
        maxLength: ProfessionalConstraints.urlLength,
      }),
    }))
    const sorted = sortItemsByDate(normalized, {
      startYearKey: 'start_year',
      endYearKey: 'end_year',
    })
    return updateStructuredArrayField(
      'education',
      sorted,
      ProfessionalConstraints.education,
      'Education',
      options
    )
  }

  const updateVolunteering = (
    items: VolunteeringItem[],
    options: UpdateOptions = {}
  ) => {
    const normalized = (items ?? []).map((item) => ({
      organization: cleanText(item?.organization, 240),
      role: cleanText(item?.role, 160),
      from_year: cleanYear(item?.from_year),
      to_year: cleanYear(item?.to_year),
      ongoing: item?.ongoing === true,
      responsibilities: cleanText(item?.responsibilities, 4_000),
    }))
    const sorted = sortItemsByDate(normalized)
    return updateStructuredArrayField(
      'volunteering',
      sorted,
      ProfessionalConstraints.volunteering,
      'Volunteering',
      options
    )
  }

  const updateProjects = (
    items: ProjectItem[],
    options: UpdateOptions = {}
  ) => {
    const normalized = (items ?? []).map((item) => ({
      name: cleanText(item?.name, 240),
      role: cleanText(item?.role, 160),
      from_year: cleanYear(item?.from_year),
      to_year: cleanYear(item?.to_year),
      ongoing: item?.ongoing === true,
      responsibilities: cleanText(item?.responsibilities, 4_000),
    }))
    const sorted = sortItemsByDate(normalized)
    return updateStructuredArrayField(
      'projects',
      sorted,
      ProfessionalConstraints.projects,
      'Projects',
      options
    )
  }

  return {
    setRelevantExperience,
    setOtherExperience,

    updateTitle,
    updateSummary,
    updateBio,
    updateImage,
    uploadProfileImage,
    updatePositions,
    updateLanguages,
    updateCertifications,
    updateEducation,
    updateVolunteering,
    updateProjects,
  }
}
