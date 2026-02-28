// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/main/useProfessionalUpdate.ts
// flag

import type { ProfileRefs } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useProfileUpdateBase } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/seo/useSeoIndexWrite'
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
  return raw.replace(/^places\//, '') // tolerate legacy "places/<id>"
}

export function useProfessionalUpdate(profile?: ProfileRefs<ProfessionalCore> | null) {
  const base = useProfileUpdateBase<ProfessionalCore>('professionals', profile)
  const { uploadImage } = useImageStorage()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()

  const touchSeoIndex = async (id?: string | null) => {
    const resolvedId = await base.resolveUid(id)
    await upsertSeoIndexDoc('seo_index_professionals', resolvedId, {
      path: `/professionals/${resolvedId}`,
      isPublic: true,
    })
  }

  const updateCoreProfile = async (
    patch: Partial<ProfessionalCore>,
    options: { id?: string | null } = {}
  ) => {
    await base.updateCoreProfile(patch, options)
    await touchSeoIndex(options.id)
  }
  const updateAppProfile = base.updateAppProfile
  const commitUpdate = async (
    patch: Partial<ProfessionalCore>,
    options: UpdateOptions = {}
  ) => {
    await base.commitUpdate(patch, options)
    if (options.scope !== 'app') {
      await touchSeoIndex(options.id)
    }
  }

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
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
    const idx = months.indexOf(short)
    return idx >= 0 ? idx + 1 : null
  }

  const toNumber = (value: unknown): number | null => {
    const raw = typeof value === 'number' ? value : Number(String(value ?? '').trim())
    return Number.isFinite(raw) ? raw : null
  }

  const resolveDateParts = (item: any, fields: Required<DateSortFields>) => {
    const ongoing = Boolean(item?.[fields.ongoingKey])
    const fromYear = toNumber(item?.[fields.fromYearKey] ?? item?.[fields.startYearKey])
    const fromMonth = monthToNumber(item?.[fields.fromMonthKey])
    const toYear = toNumber(item?.[fields.toYearKey] ?? item?.[fields.endYearKey])
    const toMonth = monthToNumber(item?.[fields.toMonthKey])

    const startValue = fromYear ? (fromYear * 12 + (fromMonth ?? 1)) : null
    const endValue = ongoing
      ? Number.POSITIVE_INFINITY
      : toYear
        ? (toYear * 12 + (toMonth ?? 1))
        : null

    return { ongoing, startValue, endValue }
  }

  const sortItemsByDate = <T>(list: T[], fields?: DateSortFields): T[] => {
    const merged = { ...defaultDateFields, ...(fields ?? {}) }
    return list
      .map((item, index) => ({ item, index, ...resolveDateParts(item, merged) }))
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
    const sorted = sortItemsByDate(sanitized)
    await commitUpdate({ relevant_experience: sorted }, options)
  }

  const setOtherExperience = async (
    items: OtherExperienceItem[] = [],
    options: UpdateOptions = {}
  ): Promise<void> => {
    const sanitized = sanitizeExperienceItems<OtherExperienceItem>(items)
    const sorted = sortItemsByDate(sanitized)
    await commitUpdate({ other_experience: sorted }, options)
  }

  const updateTitle = (value: string, options: UpdateOptions = {}) =>
    updateStringField('title', value, options)

  const updateSummary = (value: string, options: UpdateOptions = {}) =>
    updateStringField('summary', value, options)

  const updateBio = (value: string, options: UpdateOptions = {}) =>
    updateStringField('bio', value, options)

  const updateImage = (value: string, options: UpdateOptions = {}) =>
    updateStringField('image', value, options)

  const cacheBust = (url: string) => {
    const stamp = Date.now().toString(36)
    return url.includes('?') ? `${url}&v=${stamp}` : `${url}?v=${stamp}`
  }

  const uploadProfileImage = async (source: File | Blob, options: UpdateOptions = {}) => {
    const id = await base.resolveUid(options.id)
    const path = `professionals/${id}/image/current`
    const url = await uploadImage(path, source)
    const next = cacheBust(url)
    await commitUpdate({ image: next }, options)
    return next
  }

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

  const updateEducation = (items: EducationItem[], options: UpdateOptions = {}) => {
    const sorted = sortItemsByDate(items ?? [], {
      startYearKey: 'start_year',
      endYearKey: 'end_year',
    })
    return updateTypedArrayField('education', sorted, options)
  }

  const updateVolunteering = (items: VolunteeringItem[], options: UpdateOptions = {}) => {
    const sorted = sortItemsByDate(items ?? [])
    return updateTypedArrayField('volunteering', sorted, options)
  }

  const updateProjects = (items: ProjectItem[], options: UpdateOptions = {}) => {
    const sorted = sortItemsByDate(items ?? [])
    return updateTypedArrayField('projects', sorted, options)
  }

  return {
    commitUpdate,
    updateCoreProfile,
    updateAppProfile,

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
