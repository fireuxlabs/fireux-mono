<template>
  <UCard class="space-y-4">
    <div class="flex items-start gap-3">
      <div class="shrink-0">
        <div v-if="card.wordmark || card.logo" class="w-28 space-y-1">
          <img
            v-if="card.wordmark"
            :src="card.wordmark"
            :alt="`${card.title} wordmark`"
            class="h-6 w-full object-contain object-left"
            loading="lazy"
          />
          <img
            v-if="card.logo"
            :src="card.logo"
            :alt="`${card.title} logo`"
            class="h-10 w-full object-contain object-left"
            loading="lazy"
          />
        </div>
        <UAvatar v-else :src="card.avatar || undefined" :alt="card.title" size="sm" />
      </div>

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

        <div class="space-y-1">
          <div class="text-sm">
            <span v-if="card.description">{{ card.description }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
          <div class="text-sm text-dimmed">
            <span v-if="card.role">{{ card.role }} • {{ card.status }} • {{ card.shortName }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AppCard } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
defineProps<{
  card: AppCard.Card
}>()
</script>
