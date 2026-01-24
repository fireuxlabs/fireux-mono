<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Places</div>

        <div class="flex items-center gap-2">
          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>
          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">
      No places yet.
    </div>

    <OrganismsEntitiesPlaceCollectionList
      v-else
      :cards="cards"
      :variant="variant"
    />

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Places (JSON)'"
        :data="debugPayload"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlacesInterface } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';
import type { BasePlace } from '../../../../../models/objects/place.model';

const props = defineProps<{ collection?: BasePlace[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard } = usePlacesInterface()
const cards = computed(() =>
  collection.value
    .map((place) => makeCard(place))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalPlaces: collection.value.length,
  places: collection.value,
}))

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('cell')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

</script>
