<template>
  <div class="grid gap-4 md:grid-cols-2">
    <UCard
      v-for="solution in solutions"
      :key="solution.slug"
      variant="subtle"
      :ui="{ body: 'flex h-full flex-col gap-4' }"
    >
      <div class="flex items-start gap-3">
        <div class="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <UIcon :name="solution.icon || 'i-lucide-lightbulb'" class="size-5" />
        </div>
        <div class="space-y-1">
          <UBadge
            v-if="solution.status"
            color="primary"
            variant="soft"
          >
            {{ statusLabel(solution.status) }}
          </UBadge>
          <h2 class="text-lg font-semibold text-highlighted">
            {{ solution.title }}
          </h2>
          <p class="text-sm leading-6 text-muted">
            {{ solution.description }}
          </p>
        </div>
      </div>

      <UButton
        :to="`/solutions/${solution.slug}`"
        color="neutral"
        variant="soft"
        trailing-icon="i-lucide-arrow-right"
        class="mt-auto w-fit"
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
