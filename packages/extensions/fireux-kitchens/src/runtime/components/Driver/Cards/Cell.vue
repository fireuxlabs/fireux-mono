<template>
  <div class="card card--cell">
    <div class="card__media">
      <UAvatarGroup v-if="secondaryAvatarUrl" size="sm">
        <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />
        <UAvatar :src="secondaryAvatarUrl" :alt="displayName" size="2xs" />
      </UAvatarGroup>
      <UAvatar v-else :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="card__content card__stack">
        <div class="card__header">
          <div class="min-w-0">
            <div class="card__title">{{ displayName }}</div>
            <div v-if="title" class="card__subtitle">
              {{ title }}
            </div>
          </div>

          <div v-if="badges.length" class="card__badges">
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

        <div v-if="summary" class="card__tagline">
          <span>{{ summary }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DriverCard } from '../../../composables/fireux/firestore/profiles/Driver/utils/view/useDriverInterface'

withDefaults(
  defineProps<
    Pick<
      DriverCard.Card,
      | 'avatarUrl'
      | 'secondaryAvatarUrl'
      | 'displayName'
      | 'title'
      | 'badges'
      | 'summary'
    >
  >(),
  {
    secondaryAvatarUrl: undefined,
    badges: () => [],
    summary: '',
  }
)
</script>
