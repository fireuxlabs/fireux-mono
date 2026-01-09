<template>
  <UCard class="space-y-4">
    <div class="flex items-start gap-3">
      <UAvatar :src="avatarUrl" :alt="displayName" size="sm" />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ displayName }}</div>
            <div v-if="showSubtitle && handle" class="truncate text-sm text-dimmed">
              {{ handle }}
            </div>
          </div>

          <div v-if="showBadges && badges.length" class="flex flex-wrap justify-end gap-1">
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

        <div class="space-y-1">
          <div v-if="showTagline" class="text-sm">
            <span v-if="prop || bio">{{ prop || bio }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
          <div v-if="showMeta" class="text-sm text-dimmed">
            <span v-if="profiles.length">{{ profiles.join(', ') }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

withDefaults(
  defineProps<
    Pick<UserCard.Card, 'avatarUrl' | 'displayName' | 'handle' | 'badges' | 'bio' | 'profiles'> & {
      prop?: string
      showSubtitle?: boolean
      showBadges?: boolean
      showTagline?: boolean
      showMeta?: boolean
    }
  >(),
  {
    showSubtitle: true,
    showBadges: true,
    showTagline: true,
    showMeta: true,
  }
)
</script>
