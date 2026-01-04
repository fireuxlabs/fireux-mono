<template>
  <NuxtLink
    :to="card.to"
    class="block rounded-lg bg-[var(--ui-bg)] px-4 py-3 transition-colors hover:bg-[var(--ui-bg-muted)]"
  >
    <div class="flex items-start gap-3">
      <UAvatar :src="card.avatar || undefined" :alt="card.title" size="sm" />

      <div class="min-w-0 flex-1 space-y-2">
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

        <div v-if="card.tagline" class="text-sm text-dimmed line-clamp-2">
          {{ card.tagline }}
        </div>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-dimmed">
          <span v-if="card.shortName" class="truncate">{{ card.shortName }}</span>
          <span v-if="card.role" class="truncate">{{ card.role }}</span>
          <span class="truncate">{{ card.userCount }} users</span>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'

const props = defineProps<{ card: AppCard.Card }>()

const card = toRef(props, 'card')
</script>
