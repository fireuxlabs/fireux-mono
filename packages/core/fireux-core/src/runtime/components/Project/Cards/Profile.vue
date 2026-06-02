<template>
  <UCard>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <UAvatar
        :src="card.imageUrl || undefined"
        :alt="card.title"
        icon="i-lucide-folders"
        size="3xl"
      />

      <div class="min-w-0 flex-1 space-y-3">
        <div class="space-y-1">
          <div class="text-xs uppercase tracking-[0.16em] text-toned">
            Project
          </div>
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ card.title }}
          </h2>
          <p v-if="card.subtitle" class="max-w-3xl text-sm text-toned">
            {{ card.subtitle }}
          </p>
        </div>

        <div v-if="card.badges.length" class="flex flex-wrap gap-2">
          <UBadge
            v-for="badge in card.badges"
            :key="badge"
            color="neutral"
            variant="soft"
          >
            {{ badge }}
          </UBadge>
        </div>

        <p v-if="card.meta && card.meta !== card.subtitle" class="text-sm text-muted">
          {{ card.meta }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProjectInterfaceCard } from '../../../composables/fireux/firestore/core/project/utils/view/useProjectInterface'

defineProps<{
  card: ProjectInterfaceCard
}>()
</script>
