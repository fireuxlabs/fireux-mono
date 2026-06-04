<template>
  <UCard>
    <template #header>
      <div class="console-card-header">
        <div class="console-card-header__title">Linked Place</div>
        <p class="console-card-header__description">
          Place is shared location truth. Changes here update the linked Place record.
        </p>
      </div>
    </template>

    <div v-if="!placeId" class="space-y-2">
      <p class="text-sm text-dimmed">
        This kitchen is not linked to a Place yet.
      </p>
    </div>

    <MoleculesStateCard
      v-else-if="pending"
      entity="linked place"
      kind="document"
      loading
    />

    <UAlert
      v-else-if="!place"
      color="warning"
      variant="soft"
      title="Linked Place not found"
      :description="`Kitchen points to Place ${placeId}, but that record is not available.`"
    />

    <div v-else class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <div class="truncate text-sm font-medium text-highlighted">
            {{ place.name || placeId }}
          </div>
          <p class="truncate text-xs text-dimmed">
            {{ place.formatted_address || place.short_address || placeId }}
          </p>
        </div>

        <UButton
          size="xs"
          variant="soft"
          color="neutral"
          icon="i-lucide-map-pin"
          :to="`/places/edit/${encodeURIComponent(placeId)}`"
        >
          Full Place editor
        </UButton>
      </div>

      <PlaceEdit :place="place" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, shallowRef, watch, type Ref, type ShallowRef } from 'vue'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { PlaceStorage, type Place } from 'fireux-places/runtime/models/place.model'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'

const { placeId } = useKitchenConsoleIdentity()
const { firestoreFetchDoc } = useFirestoreRead()
const placeSource = shallowRef(null) as ShallowRef<Ref<Place | undefined> | null>

watch(
  placeId,
  (nextPlaceId) => {
    placeSource.value = nextPlaceId
      ? firestoreFetchDoc<Place>(PlaceStorage.collection, nextPlaceId)
      : null
  },
  { immediate: true }
)

const pending = computed(() => Boolean(placeId.value) && placeSource.value?.value === undefined)
const place = computed(() => placeSource.value?.value ?? null)
</script>
