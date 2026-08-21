<template>
  <UCard>
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
      <UAvatar
        :src="card.imageUrl || undefined"
        :alt="card.title"
        icon="i-lucide-briefcase-business"
        size="3xl"
      />

      <div class="min-w-0 flex-1 space-y-3">
        <div class="space-y-1">
          <div class="fx-type-label">Portfolio</div>
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ card.title }}
          </h2>
          <p v-if="card.subtitle" class="max-w-3xl text-sm text-toned">
            {{ card.subtitle }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <UBadge v-if="card.status" color="neutral" variant="soft">
            {{ card.status }}
          </UBadge>
          <UBadge
            v-for="badge in card.badges"
            :key="badge"
            color="neutral"
            variant="soft"
          >
            {{ badge }}
          </UBadge>
        </div>

        <dl class="grid gap-3 text-sm sm:grid-cols-2">
          <div v-if="card.ownerLabel" class="space-y-1">
            <dt class="fx-type-label">Owner</dt>
            <dd class="text-default">{{ card.ownerLabel }}</dd>
          </div>
          <div v-if="card.regionLabel" class="space-y-1">
            <dt class="fx-type-label">Region</dt>
            <dd class="text-default">{{ card.regionLabel }}</dd>
          </div>
        </dl>

        <p v-if="card.summary" class="text-sm text-muted">
          {{ card.summary }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PortfolioCard } from '../../composables/firestore/utils/view/usePortfolioInterface'

defineProps<{
  card: PortfolioCard.Card
}>()
</script>
