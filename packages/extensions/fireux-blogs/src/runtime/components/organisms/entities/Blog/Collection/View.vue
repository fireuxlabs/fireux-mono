<template>
  <BlogCollectionManager :cards="cards" :total="total" />
</template>

<script setup lang="ts">
import type { BlogCard } from '../../../../../composables/fireux/firestore/objects/blog/utils/view/useBlogInterface';

withDefaults(
  defineProps<{
    cards: BlogCard.Card[]
    total?: number
  }>(),
  {
    total: undefined,
  }
)
</script>
