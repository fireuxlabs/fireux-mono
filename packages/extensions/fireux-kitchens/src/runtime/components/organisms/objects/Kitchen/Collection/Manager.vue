<template>
  <UCard :ui="{ body: 'space-y-4' }">
    <template #header>
      <div class="flex items-center justify-between">
        <div class="font-medium">Kitchens</div>
        <div class="text-sm text-dimmed">{{ total }}</div>
      </div>
    </template>

    <div v-if="!cards.length" class="text-sm text-dimmed">
      No kitchens yet.
    </div>

    <div v-else class="grid gap-3 md:grid-cols-2">
      <OrganismsObjectsKitchenCardsCell
        v-for="card in cards"
        :key="card.id"
        :to="card.to"
        :name="card.name"
        :website="card.website"
        :badges="card.badges"
        :avatar-url="card.avatarUrl"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { KitchenCard } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface';

const props = defineProps<{ cards: KitchenCard.Card[]; total?: number }>()

const cards = computed(() => props.cards ?? [])
const total = computed(() => props.total ?? cards.value.length)
</script>
