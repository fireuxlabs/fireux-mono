<template>
  <UCard>
    <div class="flex items-start gap-3">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />
      <div class="min-w-0 flex-1">
        <div class="truncate font-medium">{{ title }}</div>
        <div v-if="subtitle" class="truncate text-sm text-dimmed">
          {{ subtitle }}
        </div>
        <div v-if="prop" class="truncate text-sm text-dimmed">{{ prop }}</div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { BlogCard } from '../../../../composables/fireux/firestore/blog/utils/view/useBlogInterface';

const { card, avatar: avatarProp, prop } = defineProps<{
  card: BlogCard.Teaser
  avatar?: string | null
  prop?: string
}>()

const { title, author, avatar: cardAvatar } = card
const subtitle = author
const avatar = avatarProp ?? cardAvatar ?? null
</script>
