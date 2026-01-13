<template>
  <NuxtLink :to="to" class="fx-card fx-card--pill">
    <UAvatar :src="avatarUrl" :alt="displayName" size="xs" />

    <div class="min-w-0 flex-1">
      <div class="min-w-0 truncate text-sm font-medium">{{ displayName }}</div>
      <div v-if="showSubtitle && handle" class="min-w-0 truncate text-xs text-dimmed">
        {{ handle }}
      </div>
      <div v-if="showSubtitle && profiles.length" class="min-w-0 truncate text-xs text-dimmed">
        {{ profiles.join(', ') }}
      </div>
    </div>

    <div v-if="showBadges && badges.length" class="ml-2 flex shrink-0 items-center gap-1">
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
  </NuxtLink>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

type PillProps = Pick<
  UserCard.Card,
  'to' | 'avatarUrl' | 'displayName' | 'handle' | 'badges' | 'profiles'
> & {
  showSubtitle?: boolean
  showBadges?: boolean
}

withDefaults(defineProps<PillProps>(), {
  badges: () => [],
  profiles: () => [],
  showSubtitle: true,
  showBadges: true,
})
</script>
