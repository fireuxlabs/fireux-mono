<template>
  <slot :cards="cards" :total="total">
    <UCard :ui="{ body: 'space-y-4' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="font-medium">Products</div>
          <div class="text-sm text-dimmed">{{ total }}</div>
        </div>
      </template>

      <div v-if="!cards.length" class="text-sm text-dimmed">
        No products yet.
      </div>

      <div v-else class="grid gap-3 md:grid-cols-2">
        <OrganismsObjectsProductCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
        />
      </div>
    </UCard>
  </slot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ProductCard } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface';

const props = defineProps<{ cards: ProductCard.Card[]; total?: number }>()

const cards = computed(() => props.cards ?? [])
const total = computed(() => props.total ?? cards.value.length)
</script>

