<template>
  <NuxtLink :to="to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatarUrl || undefined" :alt="title" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ title }}</div>
            <div v-if="showSubtitle && status" class="fx-cell__subtitle">
              {{ status }}
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
          <span v-if="prop">{{ prop }}</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { RecipeCard } from '../../../../../composables/fireux/firestore/objects/recipe/utils/view/useRecipeInterface'

type Props = Pick<RecipeCard.Card, 'to' | 'title' | 'status' | 'badges'> & {
  avatarUrl?: string
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
}

withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
})
</script>
