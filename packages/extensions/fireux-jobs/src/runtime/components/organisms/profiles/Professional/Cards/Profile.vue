<template>
  <div class="mx-auto w-full max-w-3xl space-y-3">
    <ProfilesProfessionalCardsCell
      v-bind="identityCard"
      :show-tagline="true"
      :show-subtitle="true"
      :link="Boolean(identityCard.to)"
    />

    <UCard class="profile-card">
      <ClientOnly>
      <UAccordion
        :items="accordionItems"
        :default-value="['summary', 'bio', 'relevant_experience']"
        type="multiple"
        variant="soft"
        size="sm"
      >
        <template #body="{ item }">
          <div v-if="item.value === 'summary'" class="-mt-2">
            <div v-if="prop">{{ prop }}</div>
            <p v-if="summary" class="form-text-body">{{ summary }}</p>
            <p v-else class="form-text-body">No summary listed.</p>
          </div>

          <div v-else-if="item.value === 'bio'">
            <p v-if="bio" class="form-text-body">{{ bio }}</p>
            <p v-else class="form-text-body">No bio listed.</p>
          </div>

          <div v-else-if="item.value === 'relevant_experience'">
            <div v-if="relevantExperienceCards.length || otherExperienceCards.length" class="space-y-4">
              <div
                v-for="entry in relevantExperienceCards"
                :key="`relevant-${entry.item.place_id}-${entry.item.role}`"
                class="space-y-1"
              >
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <span class="text-sm font-semibold text-gray-100">
                    {{ entry.item.role || 'Role' }}
                  </span>
                  <span class="ml-auto text-xs text-gray-300">
                    {{ formatExperienceDates(entry.item) }}
                  </span>
                </div>
                <div class="mt-2">
                  <PlaceCardsPill
                    v-if="entry.placeCard"
                    v-bind="entry.placeCard"
                    :show-badges="false"
                  />
                  <div v-else class="text-xs text-gray-500">Location unavailable</div>
                </div>
                <p v-if="entry.item.responsibilities" class="form-text-body">
                  {{ entry.item.responsibilities }}
                </p>
              </div>

              <div
                v-for="entry in otherExperienceCards"
                :key="`other-${entry.item.place_id}-${entry.item.role}`"
                class="space-y-1"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge size="xs" variant="soft" color="neutral">
                    {{ entry.item.role }}
                  </UBadge>
                  <span class="text-xs text-gray-500">{{ formatExperienceDates(entry.item) }}</span>
                </div>
                <div>
                    <PlaceCardsPill
                      :image-url="entry.imageUrl"
                    :title="entry.title"
                    :subtitle="entry.subtitle"
                    :show-badges="false"
                    :show-subtitle="entry.showSubtitle"
                  />
                </div>
                <p v-if="entry.item.responsibilities" class="form-text-body">
                  {{ entry.item.responsibilities }}
                </p>
              </div>
            </div>
            <p v-else>No experience listed.</p>
          </div>

          <div v-else-if="item.value === 'languages'">
            <div v-if="languages.length">
              <UBadge
                v-for="language in languages"
                :key="`${language.language}-${language.proficiency}`"
                variant="soft"
                color="neutral"
                size="xs"
              >
                {{ language.language }}{{ language.proficiency ? ` · ${language.proficiency}` : '' }}
              </UBadge>
            </div>
            <p v-else>No languages listed.</p>
          </div>

          <div v-else-if="item.value === 'certifications'">
            <div v-if="certifications.length">
              <div v-for="cert in certifications" :key="`${cert.name}-${cert.year}`">
                <div>{{ cert.name }}</div>
                <div>{{ cert.place_name }} · {{ cert.year || 'Year not listed' }}</div>
                <a
                  v-if="cert.document_url"
                  :href="cert.document_url"
                  target="_blank"
                  rel="noreferrer"
                >
                  View document
                </a>
              </div>
            </div>
            <p v-else>No certifications listed.</p>
          </div>

          <div v-else-if="item.value === 'education'">
            <div v-if="education.length">
              <div v-for="entry in education" :key="`${entry.institution}-${entry.degree}`">
                <div>{{ entry.degree }}</div>
                <div>
                  {{ entry.institution }} ·
                  {{ formatRange(entry.start_year, entry.end_year, entry.ongoing) }}
                </div>
                <a
                  v-if="entry.document_url"
                  :href="entry.document_url"
                  target="_blank"
                  rel="noreferrer"
                >
                  View document
                </a>
              </div>
            </div>
            <p v-else>No education listed.</p>
          </div>

          <div v-else-if="item.value === 'volunteering'">
            <div v-if="volunteering.length">
              <div v-for="entry in volunteering" :key="`${entry.organization}-${entry.role}`">
                <div>{{ entry.organization }}</div>
                <div>{{ entry.role }} · {{ formatRange(entry.from_year, entry.to_year, entry.ongoing) }}</div>
                <p v-if="entry.responsibilities" class="form-text form-text-muted">
                  {{ entry.responsibilities }}
                </p>
              </div>
            </div>
            <p v-else>No volunteering listed.</p>
          </div>

          <div v-else-if="item.value === 'projects'">
            <div v-if="projects.length">
              <div v-for="project in projects" :key="`${project.name}-${project.role}`">
                <div>{{ project.name }}</div>
                <div>{{ project.role }} · {{ formatRange(project.from_year, project.to_year, project.ongoing) }}</div>
                <p v-if="project.responsibilities" class="form-text form-text-muted">
                  {{ project.responsibilities }}
                </p>
              </div>
            </div>
            <p v-else>No projects listed.</p>
          </div>
        </template>
      </UAccordion>
      <template #fallback>
        <div>Loading profile details…</div>
      </template>
    </ClientOnly>

    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/place/fetch/google/usePlacesGoogle'
import { mapPlaceToBasePlace } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/mapPlaceToBasePlace'
import type { PlaceCard } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlacesInterface'
import { usePlacesInterface } from 'fireux-places/runtime/composables/fireux/firestore/place/utils/view/usePlacesInterface'
import type { Place } from 'fireux-places/runtime/models/place.model'
import type { Ref } from 'vue'
import { computed, shallowRef, toRefs, watch } from 'vue'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model'

const props = defineProps<{
  card: ProfessionalCard.Card
  profile?: ProfessionalCore | null
  computed?: Record<string, unknown> | null
  prop?: string
}>()

const { prop } = toRefs(props)
const profile = computed(() => props.profile ?? null)
const identityCard = computed(() => ({ badges: [] as string[], ...props.card }))

const positions = computed(() => profile.value?.positions ?? [])
const certifications = computed(() => profile.value?.certifications ?? [])
const languages = computed(() => profile.value?.languages ?? [])
const education = computed(() => profile.value?.education ?? [])
const volunteering = computed(() => profile.value?.volunteering ?? [])
const projects = computed(() => profile.value?.projects ?? [])
const summary = computed(() => profile.value?.summary ?? '')
const bio = computed(() => profile.value?.bio ?? '')
const relevantExperience = computed(() => profile.value?.relevant_experience ?? [])
const otherExperience = computed(() => profile.value?.other_experience ?? [])
const experienceCount = computed(
  () => relevantExperience.value.length + otherExperience.value.length
)

const normalizePlaceId = (placeId?: string | null) => {
  const normalized = canonicalPlaceId(placeId ?? '')
  if (normalized) return normalized
  return placeId ? placeId.replace(/^places\//, '') : ''
}

const { firestoreFetchDoc } = useFirestoreManager()
const placeDocRefs = shallowRef(new Map<string, Ref<Place | undefined>>())

const relevantPlaceIds = computed(() => {
  const ids = new Set<string>()
  for (const item of relevantExperience.value) {
    const normalized = normalizePlaceId(item.place_id)
    if (normalized) ids.add(normalized)
  }
  return Array.from(ids)
})

if (import.meta.client) {
  watch(
    relevantPlaceIds,
    (ids) => {
      const next = new Map<string, Ref<Place | undefined>>()
      for (const id of ids) {
        const existing = placeDocRefs.value.get(id)
        next.set(id, existing ?? firestoreFetchDoc<Place>('places', id))
      }
      placeDocRefs.value = next
    },
    { immediate: true }
  )
}

const toPlaceBase = mapPlaceToBasePlace()
const { interface: toPlaceCard } = usePlacesInterface()

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

const relevantExperienceCards = computed(() =>
  relevantExperience.value.map((item) => ({
    item,
    placeCard: getPlaceCard(item.place_id),
  }))
)

const otherExperienceCards = computed(() =>
  otherExperience.value.map((item) => {
    const subtitle = item.short_address || item.formatted_address || ''
    return {
      item,
      title: item.name || 'External venue',
      subtitle,
      imageUrl: item.image_url || '',
      showSubtitle: Boolean(subtitle),
    }
  })
)

const accordionItems = computed(() => {
  const hasSummary = Boolean(summary.value?.trim())
  const hasBio = Boolean(bio.value?.trim())
  const hasExperience = Boolean(relevantExperience.value.length || otherExperience.value.length)
  const hasLanguages = Boolean(languages.value.length)
  const hasCertifications = Boolean(certifications.value.length)
  const hasEducation = Boolean(education.value.length)
  const hasVolunteering = Boolean(volunteering.value.length)
  const hasProjects = Boolean(projects.value.length)

  return [
    hasSummary ? { label: 'Summary', value: 'summary' } : null,
    hasBio ? { label: 'Bio', value: 'bio' } : null,
    hasExperience ? { label: 'Relevant Experience', value: 'relevant_experience' } : null,
    hasLanguages ? { label: 'Languages', value: 'languages' } : null,
    hasCertifications ? { label: 'Certifications', value: 'certifications' } : null,
    hasEducation ? { label: 'Education', value: 'education' } : null,
    hasVolunteering ? { label: 'Volunteering', value: 'volunteering' } : null,
    hasProjects ? { label: 'Projects', value: 'projects' } : null,
  ].filter(Boolean)
})

const formatExperienceDates = (item: {
  from_month?: string
  from_year?: string
  to_month?: string
  to_year?: string
  ongoing?: boolean
}) => {
  const start = [item.from_month, item.from_year].filter(Boolean).join(' ')
  const end = item.ongoing
    ? 'Present'
    : [item.to_month, item.to_year].filter(Boolean).join(' ')
  return [start, end].filter(Boolean).join(' · ')
}

const formatRange = (
  from?: string | number | null,
  to?: string | number | null,
  ongoing?: boolean
) => {
  const start = from != null && String(from).trim() ? String(from) : ''
  const end = ongoing
    ? 'Present'
    : to != null && String(to).trim()
      ? String(to)
      : ''
  return [start, end].filter(Boolean).join(' · ') || 'Dates not listed'
}

</script>
