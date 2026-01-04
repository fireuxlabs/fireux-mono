<template>
  <NuxtLink
    :to="card.to"
    class="block rounded-lg border border-[var(--ui-border)] px-4 py-3 transition-colors hover:bg-[var(--ui-bg-muted)]"
  >
    <div class="flex items-start gap-3">
      <UAvatar :src="card.avatar || undefined" :alt="card.title" size="sm" />

      <div class="min-w-0 flex-1 space-y-1">
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
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
defineProps<{
  card: AppCard.Card
}>()
</script>
