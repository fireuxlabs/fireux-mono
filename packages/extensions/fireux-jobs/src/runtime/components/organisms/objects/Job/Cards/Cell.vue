<template>
  <NuxtLink :to="to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatarUrl || undefined" :alt="title" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="fx-cell__subtitle">
              {{ subtitle }}
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
          <span v-if="prop || description">{{ prop || description }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { JobCard } from '../../../../../composables/fireux/firestore/jobs/utils/view/useJobInterface'

type Props = Pick<JobCard.Card, 'to' | 'title' | 'description' | 'badges'> & {
  avatarUrl?: string
  subtitle?: string
  prop?: string
  showSubtitle?: boolean
  showBadges?: boolean
  showTagline?: boolean
}

withDefaults(defineProps<Props>(), {
  avatarUrl: '',
  subtitle: '',
  prop: '',
  showSubtitle: true,
  showBadges: true,
  showTagline: true,
})
</script>
