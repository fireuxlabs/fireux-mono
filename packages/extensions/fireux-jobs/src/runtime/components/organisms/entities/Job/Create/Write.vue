<!-- FILE: packages/extensions/fireux-jobs/src/runtime/components/Organisms/Jobs/Create/Write.vue -->
<!-- NOTE for Copilot:
  - This is the WRITE surface for job creation.
  - It must stay in sync with useJobCreate() form shape.
-->

<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Step 1 · Location</p>
          <h2 class="text-lg font-semibold">Choose the place</h2>
          <p class="text-sm text-gray-500">
            Every job must be anchored to a place. We’ll use the Place id in the record.
          </p>
        </div>
      </template>

      <template v-if="!chosenPlaceCard">
        <UFormField label="Place type">
          <div class="space-y-2">
            <UCheckbox
              v-for="option in collectionOptions"
              :key="option.value"
              :label="option.label"
              :model-value="selectedCollection === option.value"
              @update:model-value="(checked: boolean) => onCollectionToggle(option.value, checked)"
            />
          </div>
        </UFormField>

        <PlaceSearchSection
          :collection="selectedCollection"
          normalized-field="search_term_normalized"
          :local-fallback="true"
          :extra-collections="extraCollections"
          :allow-google="true"
          @confirmed="onPlaceConfirmed"
        />
      </template>

      <template v-else>
        <PlaceCardsPill v-bind="chosenPlaceCard" />
      </template>
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm text-gray-500">Step 2 · Company</p>
          <h2 class="text-lg font-semibold">Choose the company</h2>
          <p class="text-sm text-gray-500">
            Link a company overlay if needed. We’ll use it for this job when available.
          </p>
        </div>
      </template>

      <template v-if="!chosenCompanyCard">
        <PlaceSearchSection
          collection="places"
          target-collection="companies"
          normalized-field="search_term_normalized"
          :local-fallback="true"
          :extra-collections="[]"
          :allow-google="allowGoogle"
          @confirmed="onCompanyConfirmed"
        />
      </template>

      <template v-else>
        <PlaceCardsPill v-bind="chosenCompanyCard" />
      </template>
    </UCard>

    <JobCreateBasics
      v-model:form="form"
      step-label="Step 3"
      title="Job basics"
      subtitle="Capture the title, description, and status."
    />
  </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#imports'
import { doc, getDoc } from 'firebase/firestore'
import { useCompanyCreate } from '../../../../../../../../fireux-companies/src/runtime/composables/fireux/firestore/objects/company/mutations/useCompanyCreate'
import { useCompanyUpdate } from '../../../../../../../../fireux-companies/src/runtime/composables/fireux/firestore/objects/company/mutations/useCompanyUpdate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { computed, ref } from 'vue'
import { useFirestore } from 'vuefire'
import type { JobCreateForm } from '../../../../../composables/fireux/firestore/jobs/mutations/useJobCreate';

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })

const rc = useRuntimeConfig() as any
const fireuxPublic = (rc?.public?.fireux ?? {}) as Record<string, any>
const ecosystem = String(fireuxPublic?.ecosystem ?? '').toLowerCase()
const jobsConfig = (fireuxPublic?.jobs ?? {}) as Record<string, any>
const allowGoogle =
  typeof jobsConfig.allowGoogle === 'boolean' ? jobsConfig.allowGoogle : true

const normalizeCollection = (value: string) => {
  if (value === 'kitchen') return 'kitchens'
  if (value === 'place') return 'places'
  if (value === 'company') return 'companies'
  return value
}

const placeCollections = Array.isArray(jobsConfig.placeCollections)
  ? jobsConfig.placeCollections.map((value: string) => normalizeCollection(value))
  : jobsConfig.placeCollection
    ? [normalizeCollection(jobsConfig.placeCollection)]
    : ecosystem === 'misebox'
      ? ['kitchens']
      : ['places']

const selectedCollection = ref(placeCollections[0] || 'places')
const collectionOptions = computed(() =>
  placeCollections.map((value: string) => ({
    label: value,
    value,
  }))
)

const extraCollections = computed(() =>
  selectedCollection.value !== 'places' ? ['places'] : []
)

const onCollectionToggle = (value: string, checked: boolean) => {
  if (checked) selectedCollection.value = value
}

const chosenPlace = ref<PlaceUpsertInput | null>(null)
const chosenPlaceId = ref<string | null>(null)
const chosenCompany = ref<PlaceUpsertInput | null>(null)
const chosenCompanyId = ref<string | null>(null)

const chosenPlaceCard = computed(() => {
  const place = chosenPlace.value
  const id = chosenPlaceId.value
  if (!place || !id) return null

  return {
    id,
    to: '',
    name: place.name ?? '',
    subtitle: place.formatted_address ?? '',
    formattedAddress: place.formatted_address ?? '',
    imageUrl: place.place_image ?? '',
    avatarUrl: place.place_image ?? '',
    source: (place.source as 'google' | 'fireux' | 'manual') ?? 'fireux',
  }
})

const chosenCompanyCard = computed(() => {
  const place = chosenCompany.value
  const id = chosenCompanyId.value
  if (!place || !id) return null

  return {
    id,
    to: '',
    name: place.name ?? '',
    subtitle: place.formatted_address ?? '',
    formattedAddress: place.formatted_address ?? '',
    imageUrl: place.place_image ?? '',
    avatarUrl: place.place_image ?? '',
    source: (place.source as 'google' | 'fireux' | 'manual') ?? 'fireux',
  }
})

const onPlaceConfirmed = (payload: { placeId: string; place: PlaceUpsertInput }) => {
  form.value = {
    ...form.value,
    place_id: payload.placeId,
  }

  chosenPlace.value = payload.place
  chosenPlaceId.value = payload.placeId
}

const { createCompany } = useCompanyCreate()
const { updateCompany } = useCompanyUpdate()
const db = useFirestore()

const normalizeSearchTerm = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const onCompanyConfirmed = async (payload: { placeId: string; place: PlaceUpsertInput }) => {
  const id = payload.placeId
  const place = payload.place

  try {
    const existingSnap = await getDoc(doc(db, 'companies', id))
    if (existingSnap.exists()) {
      const existing = existingSnap.data() as Record<string, any>
      const searchTerm = `${place.name} ${place.formatted_address ?? ''}`
        .toLowerCase()
        .trim()
      const searchTermNormalized = normalizeSearchTerm(searchTerm)
      if (!existing.search_term || !existing.search_term_normalized) {
        await updateCompany(id, {
          search_term: existing.search_term || searchTerm,
          search_term_normalized:
            existing.search_term_normalized || searchTermNormalized,
        } as any)
      }
    } else {
      await createCompany({
        id,
        place,
        name: place.name,
        formatted_address: place.formatted_address ?? '',
        lat: place.lat ?? 0,
        lng: place.lng ?? 0,
        place_image: place.place_image ?? '',
        website: '',
        search_term: `${place.name} ${place.formatted_address ?? ''}`
          .toLowerCase()
          .trim(),
        search_term_normalized: normalizeSearchTerm(
          `${place.name} ${place.formatted_address ?? ''}`
        ),
      } as any)
    }
  } catch (err) {
    if (import.meta.dev) {
      console.error('[jobs][company-confirm] company error', err)
    }
  }

  form.value = {
    ...form.value,
    company_id: id,
  }

  chosenCompany.value = place
  chosenCompanyId.value = id
}
</script>
