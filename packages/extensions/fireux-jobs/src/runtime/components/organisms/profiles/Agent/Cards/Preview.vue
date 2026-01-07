<template>
  <UCard class="space-y-4">
    <div class="flex items-start gap-3">
      <UAvatar :src="avatar || undefined" :alt="title" size="sm" />

      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="truncate font-medium">{{ title }}</div>
            <div v-if="showSubtitle && subtitle" class="truncate text-sm text-dimmed">{{ subtitle }}</div>
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
            <span v-if="prop || line1">{{ prop || line1 }}</span>
            <span v-else class="text-dimmed italic">missing</span>
          </div>
          <div class="text-sm text-dimmed">
            <span v-if="line2">{{ line2 }}</span>
            <span v-else class="italic">missing</span>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AgentCard } from '../../../../../composables/fireux/firestore/profiles/Agent/useAgent'

withDefaults(
  defineProps<
    Pick<AgentCard.Card, 'avatar' | 'title' | 'subtitle' | 'badges' | 'line1' | 'line2'> & {
      prop?: string
      showSubtitle?: boolean
    }
  >(),
  {
    showSubtitle: true,
  }
)
</script>
