<template>
  <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div
          class="flex items-center gap-2 text-sm font-semibold text-gray-800"
        >
          <UIcon name="i-lucide-bookmark" /> Saved places
        </div>
        <UBadge color="neutral" variant="soft" size="xs">{{
          cells.length
        }}</UBadge>
      </div>
    </template>

    <div v-if="cells.length" class="space-y-2">
      <UButton
        v-for="cell in cells"
        :key="cell.place_id"
        :to="`/places/${cell.place_id}`"
        color="neutral"
        variant="ghost"
        class="w-full justify-start px-3 py-3"
      >
        <OrganismsObjectsPlaceCell :place="cell" />
      </UButton>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-inbox"
      title="No saved places yet"
      description="Add a place to Firestore and it will appear here instantly."
    />
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePlaces } from '../../../../composables/fireux/firestore/objects/place/usePlaces'
import {
  usePlacesInterface,
  type PlaceEntity,
} from '../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'

const { toCell } = usePlacesInterface()

const { collection } = usePlaces<PlaceEntity>()
const cells = computed(() =>
  (collection.value ?? []).map((place: PlaceEntity) =>
    toCell({ ...place, avatar: place.avatar ?? null })
  )
)
</script>
