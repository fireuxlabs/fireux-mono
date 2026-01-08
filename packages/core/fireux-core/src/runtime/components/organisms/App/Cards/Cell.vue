<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/App/Cards/Cell.vue -->
<template>
  <NuxtLink :to="to" class="fx-card fx-card--cell">
    <div class="fx-card__media">
      <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="fx-card__content fx-card__stack">
        <div class="fx-card__header">
          <div class="min-w-0">
            <div class="fx-card__title">{{ displayName }}</div>
          </div>

          <div v-if="showBadges && badges.length" class="fx-card__badges">
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

        <div v-if="showTagline && tagline" class="fx-card__tagline">
          {{ tagline }}
        </div>

        <div v-if="showMeta" class="fx-card__meta">
          <UBadge
            v-if="userCount !== null"
            variant="soft"
            color="neutral"
            size="xs"
            class="inline-flex items-center gap-1"
          >
            <UIcon name="i-lucide-users" class="size-3 shrink-0" />
            <span class="truncate">{{ userCount }}</span>
          </UBadge>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

withDefaults(
  defineProps<
    Pick<AppCard.Card, 'to' | 'avatarUrl' | 'displayName' | 'badges' | 'tagline' | 'userCount'> & {
      showBadges?: boolean
      showTagline?: boolean
      showMeta?: boolean
    }
  >(),
  {
    showBadges: true,
    showTagline: true,
    showMeta: true,
  }
)
</script>