<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #ctas>
        <UButton
          v-if="canEdit"
          icon="i-lucide-pencil"
          size="xs"
          color="primary"
          variant="solid"
          @click="navigateTo('/dashboard/professional/profile')"
        >
          Edit Profile
        </UButton>
      </template>
    </UPageHeader>
    <UPageBody>
      <div v-if="pending">Loading profile…</div>

      <div v-else-if="!professionalProfile">
        <h1>Profile Not Found</h1>
        <p>The profile you're looking for doesn't exist.</p>
        <NuxtLink to="/professionals">← Back</NuxtLink>
      </div>

      <div v-else>
        <OrganismsProfilesProfessionalCardsProfile
          v-if="professionalCard"
          :card="professionalCard"
        />

        <UCard>
          <template #header>
            <h3>About</h3>
          </template>
          <div>
            <p v-if="bioShort">{{ bioShort }}</p>
            <p v-if="bioLong">{{ bioLong }}</p>
            <p v-if="!bioShort && !bioLong">No bio provided yet.</p>
          </div>
        </UCard>

        <UCard v-if="relevantExperience.length || otherExperience.length">
          <template #header>
            <h3>Experience</h3>
          </template>
          <div>
            <div v-for="entry in relevantExperienceCards" :key="`relevant-${entry.item.place_id}-${entry.item.role}`">
              <div>{{ entry.item.role }}</div>
              <div>{{ formatExperienceDates(entry.item) }}</div>
              <div>
                <PlaceCardsPill
                  v-if="entry.placeCard"
                  v-bind="entry.placeCard"
                  :show-badges="false"
                />
                <div v-else>Location unavailable</div>
              </div>
              <p>{{ entry.item.responsibilities }}</p>
            </div>
            <div v-for="entry in otherExperienceCards" :key="`other-${entry.item.place_id}-${entry.item.role}`">
              <div>{{ entry.item.role }}</div>
              <div>{{ formatExperienceDates(entry.item) }}</div>
              <div>
                <PlaceCardsPill
                  :avatar-url="entry.avatarUrl"
                  :title="entry.title"
                  :subtitle="entry.subtitle"
                  :badges="[]"
                  :show-badges="false"
                  :show-subtitle="entry.showSubtitle"
                />
              </div>
              <p>{{ entry.item.responsibilities }}</p>
            </div>
          </div>
        </UCard>

        <UCard v-if="projects.length">
          <template #header>
            <h3>Projects</h3>
          </template>
          <div>
            <div v-for="project in projects" :key="`${project.name}-${project.role}`">
              <div>{{ project.name }}</div>
              <div>
                {{ project.role }} · {{ formatRange(project.from_year, project.to_year, project.ongoing) }}
              </div>
              <p>{{ project.responsibilities }}</p>
            </div>
          </div>
        </UCard>

        <UCard v-if="volunteering.length">
          <template #header>
            <h3>Volunteering</h3>
          </template>
          <div>
            <div v-for="entry in volunteering" :key="`${entry.organization}-${entry.role}`">
              <div>{{ entry.organization }}</div>
              <div>
                {{ entry.role }} · {{ formatRange(entry.from_year, entry.to_year, entry.ongoing) }}
              </div>
              <p>{{ entry.responsibilities }}</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3>Specialties</h3>
          </template>
          <div v-if="specialties.length">
            <UBadge
              v-for="specialty in specialties"
              :key="specialty"
              size="xs"
              variant="soft"
              color="neutral"
            >
              {{ specialty }}
            </UBadge>
          </div>
          <p v-else>No specialties listed.</p>
        </UCard>

        <UCard>
          <template #header>
            <h3>Locations</h3>
          </template>
          <div v-if="locations.length">
            <div v-for="location in locations" :key="location">
              {{ location }}
            </div>
          </div>
          <p v-else>No locations listed.</p>
        </UCard>

        <UCard>
          <template #header>
            <h3>Health Certifications</h3>
          </template>
          <div v-if="healthCertifications.length">
            <UBadge
              v-for="cert in healthCertifications"
              :key="cert"
              size="xs"
              variant="soft"
              color="secondary"
            >
              {{ cert }}
            </UBadge>
          </div>
          <p v-else>No health certifications listed.</p>
        </UCard>

        <UCard>
          <template #header>
            <h3>Languages</h3>
          </template>
          <div v-if="languages.length">
            <UBadge
              v-for="language in languages"
              :key="`${language.language}-${language.proficiency}`"
              size="xs"
              variant="soft"
              color="neutral"
            >
              {{ language.language }}{{ language.proficiency ? ` · ${language.proficiency}` : '' }}
            </UBadge>
          </div>
          <p v-else>No languages listed.</p>
        </UCard>

        <UCard>
          <template #header>
            <h3>Certifications</h3>
          </template>
          <div v-if="certifications.length">
            <div v-for="cert in certifications" :key="`${cert.name}-${cert.year}`">
              <div>{{ cert.name }}</div>
              <div>{{ cert.place_name }} · {{ cert.year || 'Year not listed' }}</div>
              <div>
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
          </div>
          <p v-else>No certifications listed.</p>
        </UCard>

        <UCard>
          <template #header>
            <h3>Education</h3>
          </template>
          <div v-if="education.length">
            <div v-for="entry in education" :key="`${entry.institution}-${entry.degree}`">
              <div>{{ entry.degree }}</div>
              <div>
                {{ entry.institution }} · {{ formatRange(entry.start_year, entry.end_year, entry.ongoing) }}
              </div>
              <div>
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
          </div>
          <p v-else>No education listed.</p>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { navigateTo, useHead, useRoute } from '#imports'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { mapPlaceToCard } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/mapPlaceToCard'
import type { PlaceCard } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { Place } from 'fireux-places/runtime/models/objects/place.model'
import type { Ref } from 'vue'
import { computed, shallowRef, watch } from 'vue'
import type { ProfessionalProfile } from '../../composables/fireux/firestore/profiles/Professional/useProfessional'
import { useProfessionalInterface } from '../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import { professionalConfig } from '../../models/profiles/Professional/Professional.model.ts'

const route = useRoute()
const professionalId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  return String(raw ?? '').trim() || null
})

const { profile, pending } = useProfileFetch<ProfessionalProfile>(
  professionalId,
  professionalConfig
)

const professionalProfile = computed(() => profile.coreProfile.value ?? null)

const { appUser } = useUserFetch(professionalId)
const { user } = useUserFetch(professionalId)

const { card } = useProfessionalInterface(profile, user)
const professionalCard = computed(() =>
  professionalProfile.value ? card(professionalProfile.value) : null
)

const displayName = computed(() => user.value?.display_name ?? '')
const avatarUrl = computed(() => user.value?.avatar ?? '')
const headline = computed(
  () =>
    professionalProfile.value?.tagline ||
    professionalProfile.value?.title ||
    professionalProfile.value?.subtitle ||
    ''
)
const tags = computed(() => professionalProfile.value?.tags ?? [])
const specialties = computed(() => professionalProfile.value?.specialties ?? [])
const locations = computed(() => professionalProfile.value?.locations ?? [])
const healthCertifications = computed(
  () => professionalProfile.value?.health_certifications ?? []
)
const certifications = computed(
  () => professionalProfile.value?.certifications ?? []
)
const languages = computed(
  () => professionalProfile.value?.languages ?? []
)
const education = computed(
  () => professionalProfile.value?.education ?? []
)
const volunteering = computed(
  () => professionalProfile.value?.volunteering ?? []
)
const projects = computed(
  () => professionalProfile.value?.projects ?? []
)
const bioShort = computed(() => professionalProfile.value?.bio_short ?? '')
const bioLong = computed(() => professionalProfile.value?.bio_long ?? '')
const relevantExperience = computed(
  () => professionalProfile.value?.relevant_experience ?? []
)
const otherExperience = computed(
  () => professionalProfile.value?.other_experience ?? []
)
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

const toPlaceCard = mapPlaceToCard()

const placeCardLookup = computed(() => {
  const map = new Map<string, PlaceCard.Card | null>()
  for (const [id, docRef] of placeDocRefs.value.entries()) {
    map.set(id, docRef.value ? toPlaceCard(docRef.value) : null)
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
      avatarUrl: item.image_url || '',
      showSubtitle: Boolean(subtitle),
    }
  })
)

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

useHead({
  title: computed(() =>
    displayName.value
      ? `${displayName.value} · Professional Profile`
      : 'Professional Profile'
  ),
})

const pageTitle = computed(() => displayName.value || 'Professional Profile')
const pageDescription = computed(() =>
  displayName.value
    ? `Inspect ${displayName.value} and their public details.`
    : 'Inspect the selected professional profile.'
)

const canEdit = computed(
  () =>
    !!(
      appUser.value?.id &&
      professionalProfile.value?.id &&
      appUser.value.id === professionalProfile.value.id
    )
)
</script>
