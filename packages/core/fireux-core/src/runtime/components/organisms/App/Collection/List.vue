<template>
  <div v-if="variant === 'pill'" class="flex flex-wrap gap-2">
    <OrganismsAppCardsPill
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      class="block"
    />
  </div>

  <div v-else class="fx-section__grid">
    <OrganismsAppCardsCell
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      class="block"
    />
  </div>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';

withDefaults(
  defineProps<{
    cards: AppCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)

</script>
