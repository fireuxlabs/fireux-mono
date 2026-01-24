<template>
  <div v-if="variant === 'pill'">
    <OrganismsUserCardsPill
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      
    />
  </div>

  <div v-else>
    <OrganismsUserCardsCell
      v-for="item in cards"
      :key="item.to || item.id"
      v-bind="item"
      :link="Boolean(item.to)"
      
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
