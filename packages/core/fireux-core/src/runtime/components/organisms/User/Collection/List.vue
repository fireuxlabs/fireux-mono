<template>
  <div v-if="variant === 'pill'" class="flex flex-wrap gap-2">
    <component
      :is="wrapperFor(item)"
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="wrapperPropsFor(item)"
      class="block"
    >
      <OrganismsUserCardsPill v-bind="item" />
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
      <OrganismsUserCardsCell v-bind="item" />
    </component>
  </div>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

withDefaults(
  defineProps<{
    cards: UserCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)

const wrapperFor = (item: UserCard.Card) => (item.to ? 'NuxtLink' : 'div')
const wrapperPropsFor = (item: UserCard.Card) => (item.to ? { to: item.to } : {})
</script>
