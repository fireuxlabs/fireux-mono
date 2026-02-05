<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ title }}</div>
        <div v-if="subtitle" class="truncate text-sm text-dimmed">{{ subtitle }}</div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProductCard } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface'

const { card, avatar: avatarProp, prop } = defineProps<{
  card: ProductCard.Card
  avatar?: string | null
  prop?: string
}>()

const title = card.title || card.name
const subtitle = card.subtitle || card.description
const avatar = avatarProp ?? card.avatarUrl ?? card.imageUrl ?? null
</script>
