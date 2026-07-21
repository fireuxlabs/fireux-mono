// Concurrent edit — 2026-07-20 20:03 CEST — Repo Efficiency Pass 2 of 6: enrich projected Professional detail from canonical Places.
// Concurrent edit — 2026-07-21 14:30 CEST — Place public projection: enrich public profiles through bounded exact Place reads.
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/google/usePlacesGoogle'
import { usePlaceFetch } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/usePlaceFetch'
import { mapPlaceToBasePlace } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/mapPlaceToBasePlace'
import type { PlaceCard } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlaceInterface'
import { usePlaceInterface } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlaceInterface'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { computed, shallowRef, watch, type Ref } from 'vue'
import type { ProfessionalCard } from './useProfessionalInterface'
import type { PublicProfessionalProfile } from '../../../../../../../models/profiles/Professional/Professional.model'
import type {
  CertificationItem,
  EducationItem,
  LanguageProficiency,
  OtherExperienceItem,
  ProjectItem,
  RelevantExperienceItem,
  VolunteeringItem,
} from '../../../../../../../models/profiles/Professional/supporting'

type AccordionItem = {
  label: string
  value: string
}

export type ProfessionalProfileRelevantExperience = {
  item: RelevantExperienceItem
  placeCard: PlaceCard.Card | null
}

export type ProfessionalProfileOtherExperience = {
  item: OtherExperienceItem
  placeCard: PlaceCard.Card | null
}

export type ProfessionalProfileViewModel = {
  identityCard: ProfessionalCard.Card
  prop: string
  summary: string
  bio: string
  relevantExperience: ProfessionalProfileRelevantExperience[]
  otherExperience: ProfessionalProfileOtherExperience[]
  languages: LanguageProficiency[]
  certifications: CertificationItem[]
  education: EducationItem[]
  volunteering: VolunteeringItem[]
  projects: ProjectItem[]
  accordionItems: AccordionItem[]
}

const safeString = (value: unknown) => String(value ?? '').trim()

const normalizePlaceId = (placeId?: string | null) => {
  const normalized = canonicalPlaceId(placeId ?? '')
  if (normalized) return normalized
  return placeId ? placeId.replace(/^places\//, '') : ''
}

export function useProfessionalProfileView(
  profileRef: Ref<PublicProfessionalProfile | null | undefined>,
  cardRef: Ref<ProfessionalCard.Card | null | undefined>,
  propRef?: Ref<string | null | undefined>
) {
  const profile = computed(() => profileRef.value ?? null)
  const identityCard = computed(() => cardRef.value ?? null)

  const relevantExperience = computed(
    () => profile.value?.relevant_experience ?? []
  )
  const otherExperience = computed(() => profile.value?.other_experience ?? [])
  const languages = computed(() => profile.value?.languages ?? [])
  const certifications = computed(() => profile.value?.certifications ?? [])
  const education = computed(() => profile.value?.education ?? [])
  const volunteering = computed(() => profile.value?.volunteering ?? [])
  const projects = computed(() => profile.value?.projects ?? [])
  const summary = computed(() => profile.value?.summary ?? '')
  const bio = computed(() => profile.value?.bio ?? '')

  const { place: fetchPlace } = usePlaceFetch()
  const placeDocRefs = shallowRef(new Map<string, Ref<Place | undefined>>())

  const experiencePlaceIds = computed(() => {
    const ids = new Set<string>()
    for (const item of [
      ...relevantExperience.value,
      ...otherExperience.value,
    ]) {
      const normalized = normalizePlaceId(item.place_id)
      if (normalized) ids.add(normalized)
    }
    return Array.from(ids)
  })

  if (import.meta.client) {
    watch(
      experiencePlaceIds,
      (ids: string[]) => {
        const current = placeDocRefs.value
        const next = new Map<string, Ref<Place | undefined>>()

        for (const id of ids) {
          const existing = current.get(id)
          const source = existing ?? fetchPlace(id)
          next.set(id, source)
        }
        placeDocRefs.value = next
      },
      { immediate: true, flush: 'sync' }
    )
  }

  const toPlaceBase = mapPlaceToBasePlace()
  const { pill: toPlaceCard } = usePlaceInterface()

  const placeCardLookup = computed(() => {
    const map = new Map<string, PlaceCard.Card | null>()
    for (const [id, docRef] of placeDocRefs.value.entries()) {
      const base = docRef.value ? toPlaceBase(docRef.value) : null
      map.set(id, base ? toPlaceCard(base) : null)
    }
    return map
  })

  const getPlaceCard = (placeId?: string | null) => {
    const normalized = normalizePlaceId(placeId)
    if (!normalized) return null
    return placeCardLookup.value.get(normalized) ?? null
  }

  const relevantExperienceEntries = computed(() =>
    relevantExperience.value.map((item) => ({
      item,
      placeCard: getPlaceCard(item.place_id),
    }))
  )

  const otherExperienceEntries = computed(() =>
    otherExperience.value.map((item) => ({
      item,
      placeCard: getPlaceCard(item.place_id),
    }))
  )

  const accordionItems = computed<AccordionItem[]>(() => {
    const items: AccordionItem[] = []

    if (summary.value.trim()) items.push({ label: 'Summary', value: 'summary' })
    if (bio.value.trim()) items.push({ label: 'Bio', value: 'bio' })
    if (relevantExperience.value.length || otherExperience.value.length) {
      items.push({
        label: 'Relevant Experience',
        value: 'relevant_experience',
      })
    }
    if (languages.value.length)
      items.push({ label: 'Languages', value: 'languages' })
    if (certifications.value.length) {
      items.push({ label: 'Certifications', value: 'certifications' })
    }
    if (education.value.length)
      items.push({ label: 'Education', value: 'education' })
    if (volunteering.value.length) {
      items.push({ label: 'Volunteering', value: 'volunteering' })
    }
    if (projects.value.length)
      items.push({ label: 'Projects', value: 'projects' })

    return items
  })

  const model = computed<ProfessionalProfileViewModel | null>(() => {
    if (!profile.value || !identityCard.value) return null

    return {
      identityCard: identityCard.value,
      prop: safeString(propRef?.value),
      summary: summary.value,
      bio: bio.value,
      relevantExperience: relevantExperienceEntries.value,
      otherExperience: otherExperienceEntries.value,
      languages: languages.value,
      certifications: certifications.value,
      education: education.value,
      volunteering: volunteering.value,
      projects: projects.value,
      accordionItems: accordionItems.value,
    }
  })

  return {
    model,
  }
}
