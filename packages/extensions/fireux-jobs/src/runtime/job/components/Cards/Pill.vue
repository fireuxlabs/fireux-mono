<!-- Concurrent edit — 2026-07-21 12:26 CEST — Neutral Jobs migration seam: replace the domain-specific subtitle prop. -->
<template>
  <FireActionSurface
    :to="link && to ? to : undefined"
    :action="action"
    class="pill"
    @activate="emit('action')"
  >
    <div class="flex min-w-0 items-start gap-2">
      <UAvatar
        v-if="imageUrl"
        :src="imageUrl || undefined"
        :alt="title || ''"
        size="sm"
      />

      <div class="min-w-0 flex-1 space-y-1">
        <p class="truncate text-sm font-medium text-highlighted">
          {{ title }}
        </p>
        <p v-if="showSubtitle && subtitle" class="truncate text-xs text-toned">
          {{ subtitle }}
        </p>
        <div v-if="showBadges && badges.length" class="flex flex-wrap items-center gap-1">
          <UBadge v-for="badge in badges" :key="badge" variant="soft" color="neutral" size="xs">
            {{ badge }}
          </UBadge>
        </div>
      </div>
    </div>
</FireActionSurface>
</template>

<script setup lang="ts">

import type { JobCard } from '../../composables/firestore/utils/view/useJobInterface'

type Props = Pick<JobCard.Card, 'to' | 'title' | 'subtitle'> & {
  imageUrl?: string
  badges?: string[]
  showSubtitle?: boolean
  showBadges?: boolean
  link?: boolean
  action?: boolean
}

const emit = defineEmits<{ (event: 'action'): void }>()

withDefaults(defineProps<Props>(), {
  imageUrl: '',
  subtitle: '',
  badges: () => [],
  showSubtitle: true,
  showBadges: true,
  link: false,
  action: false,
})

</script>
