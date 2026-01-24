<template>
  <div v-if="variant === 'pill'">
    <BlogCardsPill
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>

  <div v-else>
    <BlogCardsCell
      v-for="card in cards"
      :key="card.to || card.id"
      v-bind="card"
      :link="Boolean(card.to)"
      
    />
  </div>
</template>

<script setup lang="ts">
import type { BlogCard } from '../../../../../composables/fireux/firestore/objects/blog/utils/view/useBlogInterface';

withDefaults(
  defineProps<{
    cards: BlogCard.Card[]
    variant?: 'pill' | 'cell'
  }>(),
  {
    variant: 'pill',
  }
)
</script>
