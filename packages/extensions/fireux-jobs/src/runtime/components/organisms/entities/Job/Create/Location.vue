<template>
  <UCard>
    <p class="text-xs text-gray-500">Hello* 10 Location</p>
    <template #header>
      <div class="space-y-1">
        <p class="text-sm text-gray-500">Step 1 · Location</p>
        <h2 class="text-lg font-semibold">
          {{ chosenPlaceCard ? 'Chosen place' : 'Choose the place' }}
        </h2>
        <p class="text-sm text-gray-500">
          {{
            chosenPlaceCard
              ? 'Place selected for this job.'
              : 'Every job must be anchored to a place. We’ll use the Place id in the record.'
          }}
        </p>
      </div>
    </template>

    <div class="space-y-4">
      <div v-show="!chosenPlaceCard" class="space-y-4">
        <UFormField v-if="placeCollections.length > 1" label="Place type">
          <URadioGroup v-model="selectedCollection" :items="collectionOptions" />
        </UFormField>

        <ClientOnly>
          <PlaceSearchSection
            :collection="selectedCollection"
            normalized-field="search_term_normalized"
            :local-fallback="true"
            :extra-collections="[]"
            :allow-google="allowGoogle"
            @confirmed="onPlaceConfirmed"
          />
        </ClientOnly>
      </div>

      <div v-show="chosenPlaceCard" class="space-y-2">
        <PlaceCardsCell v-bind="chosenPlaceCard" :show-source="true" />
      </div>

      <UFormField v-show="!chosenPlaceCard" label="Selected place id" required>
        <UInput v-model="form.place_id" placeholder="Place id" />
      </UFormField>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#imports'
import { doc, getDoc } from 'firebase/firestore'
import { useKitchenCreate } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/mutations/useKitchenCreate'
import { useKitchenUpdate } from 'fireux-kitchens/runtime/composables/fireux/firestore/objects/kitchen/mutations/useKitchenUpdate'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/objects/place.model'
import { computed, ref } from 'vue'
import { useFirestore } from 'vuefire'
import type { JobCreateForm } from '../../../../../composables/fireux/firestore/jobs/mutations/useJobCreate'

// v-model:form connects to useJobCreate().form
const form = defineModel<JobCreateForm>('form', { required: true })

const rc = useRuntimeConfig() as any
const fireuxPublic = (rc?.public?.fireux ?? {}) as Record<string, any>
const ecosystem = String(fireuxPublic?.ecosystem ?? '').toLowerCase()
const jobsConfig = (fireuxPublic?.jobs ?? {}) as Record<string, any>
const placeCollections = Array.isArray(jobsConfig.placeCollections)
  ? jobsConfig.placeCollections
  : jobsConfig.placeCollection
    ? [jobsConfig.placeCollection]
    : ecosystem === 'misebox'
      ? ['kitchens']
      : ['places']
const placeCollection = placeCollections[0] || 'places'
const selectedCollection = ref(placeCollection)
const collectionOptions = computed(() =>
  placeCollections.map((value: string) => ({
    label: value === 'kitchens' ? 'Kitchens' : value === 'places' ? 'Places' : value,
    value,
  }))
)
const allowGoogle =
  typeof jobsConfig.allowGoogle === 'boolean' ? jobsConfig.allowGoogle : true

const confirmDebug = ref<Record<string, unknown> | null>(null)
const chosenPlace = ref<PlaceUpsertInput | null>(null)
const chosenPlaceId = ref<string | null>(null)

const chosenPlaceCard = computed(() => {
  const place = chosenPlace.value
  const id = chosenPlaceId.value
  if (!place || !id) return null

  return {
    id,
    to: '',
    name: place.name ?? '',
    formattedAddress: place.formatted_address ?? '',
    imageUrl: place.place_image ?? '',
    source: (place.source as 'google' | 'fireux' | 'manual') ?? 'fireux',
  }
})

const { createKitchen } = useKitchenCreate()
const { updateKitchen } = useKitchenUpdate()
const db = useFirestore()

const normalizeSearchTerm = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const onPlaceConfirmed = async (payload: {
  placeId: string
  place: PlaceUpsertInput
}) => {
  const id = payload.placeId
  const place = payload.place

  confirmDebug.value = {
    stage: 'start',
    selectedCollection: selectedCollection.value,
    placeId: id,
    placeName: place?.name ?? '',
  }

  if (import.meta.dev) {
    console.info('[jobs][place-confirm]', {
      ecosystem,
      jobsConfig,
      placeCollections,
      selectedCollection: selectedCollection.value,
      placeId: id,
      placeName: place?.name ?? '',
    })
  }

  if (selectedCollection.value === 'kitchens') {
    try {
      const existingSnap = await getDoc(doc(db, 'kitchens', id))
      if (existingSnap.exists()) {
        const existing = existingSnap.data() as Record<string, any>
        const searchTerm = `${place.name} ${place.formatted_address ?? ''}`
          .toLowerCase()
          .trim()
        const searchTermNormalized = normalizeSearchTerm(searchTerm)
        if (!existing.search_term || !existing.search_term_normalized) {
          await updateKitchen(id, {
            search_term: existing.search_term || searchTerm,
            search_term_normalized:
              existing.search_term_normalized || searchTermNormalized,
          } as any)
        }
        confirmDebug.value = {
          ...confirmDebug.value,
          stage: 'kitchen-existing',
        }
        if (import.meta.dev) {
          console.info('[jobs][place-confirm] kitchen exists', { id })
        }
      } else {
        await createKitchen({
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
        confirmDebug.value = {
          ...confirmDebug.value,
          stage: 'kitchen-created',
        }
        if (import.meta.dev) {
          console.info('[jobs][place-confirm] kitchen created', { id })
        }
      }
    } catch (err) {
      confirmDebug.value = {
        ...confirmDebug.value,
        stage: 'kitchen-error',
        error: err instanceof Error ? err.message : String(err),
      }
      if (import.meta.dev) {
        console.error('[jobs][place-confirm] kitchen error', err)
      }
    }
  }

  form.value = {
    ...form.value,
    place_id: id,
  }

  confirmDebug.value = {
    ...confirmDebug.value,
    stage: 'done',
  }

  chosenPlace.value = place
  chosenPlaceId.value = id
}
</script>
