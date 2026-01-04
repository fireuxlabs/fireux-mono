<template>
  <div v-if="variant === 'pill'" class="flex flex-wrap gap-2">
    <OrganismsUserCardsPill
      v-for="item in cards"
      :key="item.to"
      v-bind="item"
    />
  </div>

  <div v-else class="fx-section__grid">
    <article v-for="item in cards" :key="item.to">
      <OrganismsUserCardsCell v-bind="item" />
    </article>
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
</script>
