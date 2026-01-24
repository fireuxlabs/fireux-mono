<template>
  <div v-if="variant === 'pill'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    <OrganismsUserCardsPill
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      class="block"
    />
  </div>

  <div v-else class="grid gap-3 md:grid-cols-2">
    <OrganismsUserCardsCell
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      class="block"
    />
  </div>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface';

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
