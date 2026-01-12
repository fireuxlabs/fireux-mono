<template>
  <div class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__title">{{ title }}</div>
        <div v-if="subtitle" class="fx-cell__subtitle">{{ subtitle }}</div>
        <div v-if="prop" class="fx-cell__tagline">{{ prop }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductCardProps } from '../../../../../composables/fireux/firestore/objects/product/utils/view/useProductInterface'

const { card, avatar: avatarProp, prop } = defineProps<{
  card: ProductCardProps
  avatar?: string | null
  prop?: string
}>()

const { title, description, priceLabel } = card
const subtitle = priceLabel ?? description
const avatar = avatarProp ?? null
</script>
