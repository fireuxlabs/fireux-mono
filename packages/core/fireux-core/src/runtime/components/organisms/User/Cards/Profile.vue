<template>
  <UCard>
    <template #header>
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <UAvatar :src="card.avatarUrl || undefined" :alt="card.displayName" size="md" />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold">{{ card.displayName }}</div>
            <div class="text-sm text-dimmed">
              <span v-if="card.handle">{{ card.handle }}</span>
              <span v-else class="italic">missing</span>
            </div>
          </div>
        </div>

        <div v-if="card.badges.length" class="flex flex-wrap justify-end gap-1">
          <UBadge
            v-for="badge in card.badges"
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
          <span v-if="prop || card.bio">{{ prop || card.bio }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Profiles</div>
        <div class="text-sm">
          <span v-if="card.profiles.length">{{ card.profiles.join(', ') }}</span>
          <span v-else class="text-dimmed italic">missing</span>
        </div>
      </div>

      <div class="space-y-1">
        <div class="text-xs text-dimmed">Apps</div>
        <div class="text-sm">
          <span v-if="card.apps">{{ card.apps }}</span>
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
import { toRef } from 'vue'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const props = defineProps<{
  card: UserCard.Card
  user?: {
    id?: string
    created_at?: unknown
    updated_at?: unknown
  } | null
  prop?: string
}>()

const card = toRef(props, 'card')
const user = toRef(props, 'user')
const prop = toRef(props, 'prop')
</script>
