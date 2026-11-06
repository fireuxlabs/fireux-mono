<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    @activate="emit('action')"
  >
    <div class="fx-card--cell">
      <UAvatar :src="imageUrl || undefined" :alt="title" size="md" />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="card__content">
            <div class="card__title">{{ title }}</div>
            <div v-if="showSubtitle && author" class="card__subtitle">
              {{ author }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="card__badges">
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

        <div v-if="showTagline" class="card__subtitle">
          <span v-if="prop || excerpt">{{ prop || excerpt }}</span>
          <span v-else class="fx-card__tagline--empty">missing</span>
        </div>
      </div>
    </div>
  </FireActionSurface>
</template>

<script setup lang="ts">
import type { BlogCard } from '../../composables/useBlogInterface'

type Props = Pick<
  BlogCard.Card,
  'to' | 'title' | 'excerpt' | 'author' | 'imageUrl' | 'badges'
> & {
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{
  (event: 'action'): void
}>()

withDefaults(defineProps<Props>(), {
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
  link: false,
  action: false,
})
</script>
