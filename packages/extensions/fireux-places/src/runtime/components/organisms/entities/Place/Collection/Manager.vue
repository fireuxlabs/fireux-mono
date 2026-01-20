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
          <NuxtLink v-if="card.to" :to="card.to" class="block">
            <PlaceCardsPill v-bind="card" />
          </NuxtLink>
          <div v-else class="block">
            <PlaceCardsPill v-bind="card" />
          </div>
        </template>
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <template v-for="card in cards" :key="card.id">
          <NuxtLink v-if="card.to" :to="card.to" class="block">
            <PlaceCardsCell v-bind="card" />
          </NuxtLink>
          <div v-else class="block">
            <PlaceCardsCell v-bind="card" />
          </div>
        </template>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

const props = defineProps<{ cards: PlaceCard.Card[] }>()

const cards = computed(() => props.cards ?? [])

type Variant = 'pill' | 'cell'
const variant = ref<Variant>('cell')
const toggleVariant = () => {
  variant.value = variant.value === 'pill' ? 'cell' : 'pill'
}

const wrapperFor = (card: PlaceCard.Card) => (card.to ? 'NuxtLink' : 'div')

const wrapperPropsFor = (card: PlaceCard.Card) => (card.to ? { to: card.to } : {})
</script>
