<template>
  <NuxtLink :to="to" class="fx-card fx-card--cell">
    <div class="fx-card__media">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />

      <div class="fx-card__content fx-card__stack">
        <div class="fx-card__header">
          <div class="min-w-0">
            <div class="fx-card__title">{{ title }}</div>
            <div v-if="subtitle" class="fx-card__subtitle">
              {{ subtitle }}
            </div>
          </div>

          <div v-if="badges.length" class="fx-card__badges">
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

        <div class="fx-card__tagline">
          <span v-if="prop || line1">{{ prop || line1 }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

defineProps<Pick<UserCard.Card, 'to' | 'avatar' | 'title' | 'subtitle' | 'badges' | 'line1'> & { prop?: string }>()
</script>
