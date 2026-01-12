<template>
  <NuxtLink :to="to" class="fx-cell">
    <div class="fx-cell__media">
      <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="fx-cell__content fx-cell__stack">
        <div class="fx-cell__header">
          <div class="min-w-0">
            <div class="fx-cell__title">{{ displayName }}</div>
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
            <span v-if="tagline">{{ tagline }}</span>
            <span v-else class="italic">missing</span>
          </div>

        <div v-if="showMeta && userCount !== null" class="fx-cell__meta">
          <UBadge
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

type Props = Omit<
  Pick<AppCard.Card, 'to' | 'avatarUrl' | 'displayName' | 'badges' | 'tagline' | 'userCount'>,
  'userCount'
> & {
  userCount?: number | null

  showBadges?: boolean
  showTagline?: boolean
  showMeta?: boolean
}

withDefaults(defineProps<Props>(), {
  badges: () => [],
  tagline: '',
  userCount: null,
  showBadges: true,
  showTagline: true,
  showMeta: true,
})
</script>