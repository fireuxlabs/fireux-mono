<template>
  <div class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__title">{{ title }}</div>
        <div v-if="subtitle" class="fx-cell__subtitle">
          {{ subtitle }}
        </div>
        <div v-if="prop" class="fx-cell__tagline">{{ prop }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BlogCard } from '../../../../../composables/fireux/firestore/objects/blog/utils/view/useBlogInterface'

const { card, avatar: avatarProp, prop } = defineProps<{
  card: BlogCard.Cell
  avatar?: string | null
  prop?: string
}>()

const { title, author, avatar: cardAvatar } = card
const subtitle = author
const avatar = avatarProp ?? cardAvatar ?? null
</script>
