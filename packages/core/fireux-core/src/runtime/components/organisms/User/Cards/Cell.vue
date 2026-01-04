<template>
  <NuxtLink
    :to="card.to"
    class="block rounded-lg border border-[var(--ui-border)] px-3 py-2 transition-colors hover:bg-[var(--ui-bg-muted)]"
  >
    <div class="flex items-start gap-3">
      <UAvatar :src="card.avatar || undefined" :alt="card.title" size="sm" />

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ card.title }}</div>
            <div v-if="card.subtitle" class="truncate text-sm text-dimmed">
              {{ card.subtitle }}
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

        <div class="mt-1 text-sm text-dimmed">
          <span v-if="prop || card.line1">{{ prop || card.line1 }}</span>
          <span v-else class="italic">missing</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import type { UserCard } from '../../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const props = defineProps<{ card: UserCard.Card; prop?: string }>()

const card = toRef(props, 'card')
const prop = toRef(props, 'prop')
</script>
