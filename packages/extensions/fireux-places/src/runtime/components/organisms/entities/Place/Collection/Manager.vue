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

    <div v-else>
      <div
        v-if="variant === 'pill'"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        <template v-for="card in cards" :key="card.id">
          <PlaceCardsPill v-bind="card" :link="Boolean(card.to)" class="block" />
        </template>
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <template v-for="card in cards" :key="card.id">
          <PlaceCardsCell v-bind="card" :link="Boolean(card.to)" class="block" />
        </template>
      </div>
    </div>

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
