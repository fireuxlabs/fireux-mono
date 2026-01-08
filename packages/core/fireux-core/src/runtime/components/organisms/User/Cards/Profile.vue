<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <UAvatar :src="avatarUrl || undefined" :alt="displayName" size="md" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ displayName }}</div>
            <div class="text-sm text-dimmed">
              <span v-if="handle">{{ handle }}</span>
              <span v-else class="italic">missing</span>
            </div>
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
    </template>

    <div class="space-y-4">
      <div class="space-y-1">
        <div class="text-xs text-dimmed">Bio</div>
        <div class="text-sm">
          <span v-if="prop || bio">{{ prop || bio }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Profiles</div>
        <div class="text-sm">
          <span v-if="profiles.length">{{ profiles.join(', ') }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Apps</div>
        <div class="text-sm">
          <span v-if="apps">{{ apps }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="rounded border p-3">
        <div class="text-xs font-medium opacity-70">Details</div>

        <div class="mt-2 grid gap-2">
          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">User id</div>
            <div class="text-sm">
              <span v-if="user?.id">{{ user.id }}</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Created</div>
            <div class="text-sm">
              <span v-if="user?.created_at">set</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3">
            <div class="text-xs opacity-70">Updated</div>
            <div class="text-sm">
              <span v-if="user?.updated_at">set</span>
              <span v-else class="opacity-50">missing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

defineProps<
  Pick<
    UserCard.Card,
    'avatarUrl' | 'displayName' | 'handle' | 'badges' | 'bio' | 'profiles' | 'apps'
  > & {
    user?: {
      id?: string
      created_at?: unknown
      updated_at?: unknown
    } | null
    prop?: string
  }
>()
</script>
