// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/mutations/useProfessionalUpdate.ts
// flag
// Concurrent edit — 2026-07-20 20:17 CEST — Repo Efficiency Pass 2 of 6: expose only bounded single-family Professional mutations.

import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileRootUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { normalizeHttpsUrlInput } from 'fireux-core/runtime/utils/httpsUrl'
import {
  ProfessionalConstraints,
  ProfessionalStorage,
  type Professional,
} from '../../../../../../models/profiles/Professional/Professional.model'
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from '../../../../../../models/profiles/Professional/supporting'

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

type DateSortFields = {
  ongoingKey?: string
  fromYearKey?: string
  fromMonthKey?: string
  toYearKey?: string
  toMonthKey?: string
  startYearKey?: string
  endYearKey?: string
}

const normalizePlaceId = (value?: unknown) => {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!isFirestoreDocumentId(raw)) {
    throw new Error('Experience must reference a valid Place.')
  }
  return raw
}

export function useProfessionalUpdate(
  profile?: ProfileRefs<Professional> | null
) {
  const base = useProfileRootUpdateBase<Professional>(
    ProfessionalStorage.rootCollection,
    profile
  )
  const { uploadImage } = useImageStorage()

  const commitUpdate = async (
    patch: Partial<Professional>,
    options: UpdateOptions = {}
  ) => {
    await base.updateCoreProfile(patch, options)
  }

  const cleanText = (value: unknown, maxSize: number, label = 'Value') => {
    const normalized = typeof value === 'string' ? value.trim() : ''
    if (normalized.length > maxSize) {
      throw new Error(`${label} must be ${maxSize} characters or less.`)
    }
    return normalized
  }

  const assertListLimit = (
    items: unknown[],
    maxItems: number,
    label: string
  ) => {
    if (items.length > maxItems) {
      throw new Error(`${label} supports at most ${maxItems} items.`)
    }
  }

  const assertStructuredTotal = (field: StructuredField, nextCount: number) => {
    const current = profile?.coreProfile?.value
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
    await commitUpdate(
      { [key]: items ?? [] } as unknown as Partial<Professional>,
      options
    )
  }

  const defaultDateFields: Required<DateSortFields> = {
    ongoingKey: 'ongoing',
    fromYearKey: 'from_year',
    fromMonthKey: 'from_month',
    toYearKey: 'to_year',
    toMonthKey: 'to_month',
    startYearKey: 'start_year',
    endYearKey: 'end_year',
  }

  const monthToNumber = (value: unknown): number | null => {
    if (value == null) return null
    const raw = String(value).trim()
    if (raw.length !== 3) return null
    const short = raw.toLowerCase()
    const months = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ]
    const idx = months.indexOf(short)
    return idx >= 0 ? idx + 1 : null
  }

  const toNumber = (value: unknown): number | null => {
    const raw =
      typeof value === 'number' ? value : Number(String(value ?? '').trim())
    return Number.isFinite(raw) ? raw : null
  }

  const resolveDateParts = (item: any, fields: Required<DateSortFields>) => {
    const ongoing = Boolean(item?.[fields.ongoingKey])
    const fromYear = toNumber(
      item?.[fields.fromYearKey] ?? item?.[fields.startYearKey]
    )
    const fromMonth = monthToNumber(item?.[fields.fromMonthKey])
    const toYear = toNumber(
      item?.[fields.toYearKey] ?? item?.[fields.endYearKey]
    )
    const toMonth = monthToNumber(item?.[fields.toMonthKey])

    const startValue = fromYear ? fromYear * 12 + (fromMonth ?? 1) : null
    const endValue = ongoing
      ? Number.POSITIVE_INFINITY
      : toYear
        ? toYear * 12 + (toMonth ?? 1)
        : null

    return { ongoing, startValue, endValue }
  }

  const sortItemsByDate = <T>(list: T[], fields?: DateSortFields): T[] => {
    const merged = { ...defaultDateFields, ...(fields ?? {}) }
    return list
      .map((item, index) => ({
        item,
        index,
        ...resolveDateParts(item, merged),
      }))
      .sort((a, b) => {
        if (a.ongoing !== b.ongoing) return a.ongoing ? -1 : 1

        const endA = a.endValue ?? -Infinity
        const endB = b.endValue ?? -Infinity
        if (endA !== endB) return endB - endA

        const startA = a.startValue ?? -Infinity
        const startB = b.startValue ?? -Infinity
        if (startA !== startB) return startB - startA

        return a.index - b.index
      })
      .map((row) => row.item)
  }

  const cleanYear = (value: unknown): string | null => {
    const normalized =
      typeof value === 'number' && Number.isInteger(value)
        ? String(value)
        : typeof value === 'string'
          ? value.trim()
          : ''
    if (!normalized) return null
    if (!/^\d{4}$/.test(normalized)) {
      throw new Error('Year must contain exactly four digits.')
    }
    const year = Number(normalized)
    if (
      year < ProfessionalConstraints.yearMin ||
      year > ProfessionalConstraints.yearMax
    ) {
      throw new Error('Year is outside the supported range.')
    }
    return normalized
  }

  const cleanExperienceMonth = (value: unknown): string => {
    const normalized = cleanText(value, 16, 'Experience month')
    if (
      ![
        '',
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ].includes(normalized)
    ) {
      throw new Error('Experience month must use a three-letter month.')
    }
    return normalized
  }

  const cleanExperienceYear = (value: unknown): string => cleanYear(value) ?? ''

  // Canon: experience stores ONLY place_id (+ experience fields). No place snapshot fields.
  const sanitizeExperienceItems = (items: ExperienceItem[]) => {
    const sanitized: ExperienceItem[] = []
    assertListLimit(
      items ?? [],
      ProfessionalConstraints.relevantExperience,
      'Experience'
    )
    for (const item of items ?? []) {
      const placeId = normalizePlaceId(item?.place_id)

      sanitized.push({
        place_id: placeId,
        place_collection: cleanText(item?.place_collection, 120),
        role: cleanText(item?.role, 160),
        from_month: cleanExperienceMonth(item?.from_month),
        from_year: cleanExperienceYear(item?.from_year),
        to_month: cleanExperienceMonth(item?.to_month),
        to_year: cleanExperienceYear(item?.to_year),
        ongoing: item?.ongoing === true,
        responsibilities: cleanText(item?.responsibilities, 4_000),
      })
    }
    return sanitized
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
      ProfessionalStorage.rootCollection,
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
