<template>
  <div class="fx-solutions__grid">
    <UCard
      v-for="solution in solutions"
      :key="solution.slug"
      variant="subtle"
      :ui="{ body: 'fx-solution-card' }"
    >
      <div class="fx-solution-card__lead">
        <div class="fx-solution-card__icon">
          <UIcon :name="solution.icon || 'i-lucide-lightbulb'" class="size-5" />
        </div>
        <div class="fx-solution-card__content">
          <UBadge
            v-if="solution.status"
            color="primary"
            variant="soft"
          >
            {{ statusLabel(solution.status) }}
          </UBadge>
          <h2 class="fx-solution-card__title">
            {{ solution.title }}
          </h2>
          <p class="fx-solution-card__description">
            {{ solution.description }}
          </p>
        </div>
      </div>

      <UButton
        :to="`/solutions/${solution.slug}`"
        color="neutral"
        variant="soft"
        trailing-icon="i-lucide-arrow-right"
        class="fx-solution-card__action"
      >
        Open
      </UButton>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FireuxMetaSolution } from '../../models/system/meta-content.model'

defineProps<{
  solutions: FireuxMetaSolution[]
}>()

function statusLabel(status: string): string {
  switch (status) {
    case 'live':
      return 'Live'
    case 'very-easy':
      return 'Very easy'
    case 'coming-soon':
      return 'Coming soon'
    case 'bridge':
      return 'Bridge'
    case 'planned':
      return 'Planned'
    case 'later':
      return 'Later'
    default:
      return status
  }
}
</script>
