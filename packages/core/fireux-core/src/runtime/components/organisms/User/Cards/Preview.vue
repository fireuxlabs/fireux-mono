<template>
  <UCard class="space-y-4">
    <div class="flex items-start gap-3">
      <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="sm" />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ displayName }}</div>
            <div v-if="handle" class="truncate text-sm text-dimmed">
              {{ handle }}
            </div>
          </div>

          <div v-if="badges.length" class="flex flex-wrap justify-end gap-1">
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
          <div class="text-sm">
            <span v-if="prop || bio">{{ prop || bio }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
          <div class="text-sm text-dimmed">
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

defineProps<
  Pick<UserCard.Card, 'avatarUrl' | 'displayName' | 'handle' | 'badges' | 'bio' | 'profiles'> & {
    prop?: string
  }
>()
</script>
