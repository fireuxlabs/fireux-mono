<template>
  <UCard>
    <template #header>
      <div>
        <UAvatar :src="card.avatarUrl || undefined" :alt="card.displayName" size="md" />
        <div>{{ card.displayName || 'Professional' }}</div>
        <div v-if="card.tagline">{{ card.tagline }}</div>
        <div v-if="card.badges.length">
          <UBadge
            v-for="badge in card.badges"
            :key="badge"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </template>

    <div>
      <h3>Specialties</h3>
      <div v-if="specialties.length">
        <UBadge
          v-for="specialty in specialties"
          :key="specialty"
          variant="soft"
          color="neutral"
          size="xs"
        >
          {{ specialty }}
        </UBadge>
      </div>
      <p v-else>No specialties listed.</p>
    </div>

    <ClientOnly>
      <UAccordion
        :items="accordionItems"
        :default-value="['bio_short']"
        type="multiple"
        variant="soft"
        size="sm"
      >
        <template #body="{ item }">
          <div v-if="item.value === 'bio_short'">
            <div v-if="prop">{{ prop }}</div>
            <p v-if="bioShort">{{ bioShort }}</p>
            <p v-else>No bio short listed.</p>
          </div>

          <div v-else-if="item.value === 'bio_long'">
            <p v-if="bioLong">{{ bioLong }}</p>
            <p v-else>No bio long listed.</p>
          </div>

          <div v-else-if="item.value === 'health_certifications'">
            <div v-if="healthCertifications.length">
              <UBadge
                v-for="cert in healthCertifications"
                :key="cert"
                variant="soft"
                color="secondary"
                size="xs"
              >
                {{ cert }}
              </UBadge>
            </div>
            <p v-else>No health certifications listed.</p>
          </div>

          <div v-else-if="item.value === 'relevant_experience'">
            <div v-if="relevantExperienceCards.length || otherExperienceCards.length">
              <div
                v-for="entry in relevantExperienceCards"
                :key="`relevant-${entry.item.place_id}-${entry.item.role}`"
              >
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
                <p v-if="entry.item.responsibilities">{{ entry.item.responsibilities }}</p>
              </div>

              <div
                v-for="entry in otherExperienceCards"
                :key="`other-${entry.item.place_id}-${entry.item.role}`"
              >
                <div>{{ entry.item.role }}</div>
                <div>{{ formatExperienceDates(entry.item) }}</div>
                <div>
                  <PlaceCardsPill
                    v-if="entry.placeCard"
                    v-bind="entry.placeCard"
                    :show-badges="false"
                  />
                  <PlaceCardsPill
                    v-else
                    :avatar-url="entry.avatarUrl"
                    :title="entry.title"
                    :subtitle="entry.subtitle"
                    :show-badges="false"
                    :show-subtitle="entry.showSubtitle"
                  />
                </div>
                <p v-if="entry.item.responsibilities">{{ entry.item.responsibilities }}</p>
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
                <p v-if="entry.responsibilities">{{ entry.responsibilities }}</p>
              </div>
            </div>
            <p v-else>No volunteering listed.</p>
          </div>

          <div v-else-if="item.value === 'projects'">
            <div v-if="projects.length">
              <div v-for="project in projects" :key="`${project.name}-${project.role}`">
                <div>{{ project.name }}</div>
                <div>{{ project.role }} · {{ formatRange(project.from_year, project.to_year, project.ongoing) }}</div>
                <p v-if="project.responsibilities">{{ project.responsibilities }}</p>
              </div>
            </div>
            <p v-else>No projects listed.</p>
          </div>

          <div v-else-if="item.value === 'locations'">
            <div v-if="locations.length">
              <div v-for="location in locations" :key="location">{{ location }}</div>
            </div>
            <p v-else>No locations listed.</p>
          </div>
        </template>
      </UAccordion>
      <template #fallback>
        <div>Loading profile details…</div>
      </template>
    </ClientOnly>

    <div>
      <h3>Summary</h3>
      <ul>
        <li>Relevant Experience: {{ relevantExperience.length }}</li>
        <li>Other Experience: {{ otherExperience.length }}</li>
        <li>Tags: {{ tags.length }}</li>
        <li>Health Certifications: {{ healthCertifications.length }}</li>
        <li>Specialties: {{ specialties.length }}</li>
        <li>Languages: {{ languages.length }}</li>
        <li>Certifications: {{ certifications.length }}</li>
        <li>Education: {{ education.length }}</li>
        <li>Volunteering: {{ volunteering.length }}</li>
        <li>Projects: {{ projects.length }}</li>
      </ul>
      <div v-if="computedEntries.length">
        <div v-for="field in computedEntries" :key="field.key">
          <div>{{ field.label }}</div>
          <pre v-if="isComplexValue(field.value)">{{ formatValue(field.value) }}</pre>
          <div v-else>{{ formatValue(field.value) }}</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { canonicalPlaceId } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/fetch/google/usePlacesGoogle'
import { mapPlaceToCard } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/mapPlaceToCard'
import type { PlaceCard } from 'fireux-places/runtime/composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { Place } from 'fireux-places/runtime/models/objects/place.model'
import type { Ref } from 'vue'
import { computed, reactive, shallowRef, toRefs, unref, watch, watchEffect } from 'vue'
import type { ProfessionalCard } from '../../../../../composables/fireux/firestore/profiles/Professional/useProfessional'
import type { ProfessionalCore } from '../../../../../models/profiles/Professional/Professional.model'

const props = defineProps<{
  card: ProfessionalCard.Card
  profile?: ProfessionalCore | null
  computed?: Record<string, unknown> | null
  prop?: string
}>()

const card = reactive({ ...props.card })

watchEffect(() => {
  Object.assign(card, props.card)
})

const { prop } = toRefs(props)
const profile = computed(() => props.profile ?? null)

const tags = computed(() => profile.value?.tags ?? [])
const specialties = computed(() => profile.value?.specialties ?? [])
const locations = computed(() => profile.value?.locations ?? [])
const healthCertifications = computed(() => profile.value?.health_certifications ?? [])
const certifications = computed(() => profile.value?.certifications ?? [])
const languages = computed(() => profile.value?.languages ?? [])
const education = computed(() => profile.value?.education ?? [])
const volunteering = computed(() => profile.value?.volunteering ?? [])
const projects = computed(() => profile.value?.projects ?? [])
const bioShort = computed(() => profile.value?.bio_short ?? '')
const bioLong = computed(() => profile.value?.bio_long ?? '')
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

const allPlaceIds = computed(() => {
  const ids = new Set<string>()
  for (const item of [...relevantExperience.value, ...otherExperience.value]) {
    const normalized = normalizePlaceId(item.place_id)
    if (normalized) ids.add(normalized)
  }
  return Array.from(ids)
})

if (import.meta.client) {
  watch(
    allPlaceIds,
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
      placeCard: getPlaceCard(item.place_id),
      title: item.name || item.place_name || 'External venue',
      subtitle,
      avatarUrl: item.image_url || '',
      showSubtitle: Boolean(subtitle),
    }
  })
)

const computedEntries = computed(() => {
  const values = unref(props.computed) ?? {}
  return Object.entries(values).map(([key, value]) => ({
    key,
    label: key,
    value,
  }))
})

const accordionItems = computed(() => {
  const items = [
    { label: 'Bio Short', value: 'bio_short' },
    { label: 'Bio Long', value: 'bio_long' },
    { label: 'Health Certifications', value: 'health_certifications' },
    { label: 'Relevant Experience', value: 'relevant_experience' },
    { label: 'Languages', value: 'languages' },
    { label: 'Certifications', value: 'certifications' },
    { label: 'Education', value: 'education' },
    { label: 'Volunteering', value: 'volunteering' },
    { label: 'Projects', value: 'projects' },
    { label: 'Locations', value: 'locations' },
  ]

  return items
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

const isComplexValue = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.some((entry) => typeof entry === 'object' && entry !== null)
  }
  return typeof value === 'object' && value !== null
}

const formatValue = (value: unknown) => {
  if (value == null || value === '') return 'missing'
  if (Array.isArray(value)) {
    if (!value.length) return 'missing'
    if (value.every((entry) => ['string', 'number', 'boolean'].includes(typeof entry))) {
      return value.join(', ')
    }
    return JSON.stringify(value, null, 2)
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}
</script>
