<template>
  <div v-if="variant === 'pill'" class="flex flex-wrap gap-2">
    <component
      :is="wrapperFor(item)"
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="wrapperPropsFor(item)"
      class="block"
    >
      <OrganismsAppCardsPill v-bind="item" />
    </component>
  </div>

  <div v-else class="fx-section__grid">
    <component
      :is="wrapperFor(item)"
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="wrapperPropsFor(item)"
      class="block"
    >
      <OrganismsAppCardsCell v-bind="item" />
    </component>
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

const wrapperFor = (item: AppCard.Card) => (item.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (item: AppCard.Card) => (item.to ? { to: item.to } : {})
</script>
