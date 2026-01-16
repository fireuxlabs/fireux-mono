<template>
  <div class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="imageUrl || undefined" :alt="title" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ title }}</div>
            <div v-if="showSubtitle && author" class="fx-cell__subtitle">
              {{ author }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="fx-cell__badges">
            <UBadge
              v-for="badge in badges"
              :key="badge"
              variant="soft"
              color="neutral"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="showTagline" class="fx-cell__tagline">
          <span v-if="prop || excerpt">{{ prop || excerpt }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BlogCard } from '../../../../../composables/fireux/firestore/objects/blog/utils/view/useBlogInterface'

type Props = Pick<
  BlogCard.Card,
  'to' | 'title' | 'excerpt' | 'author' | 'imageUrl' | 'badges'
> & {
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
}

withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
})
</script>
