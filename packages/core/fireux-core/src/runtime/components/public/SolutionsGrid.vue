<template>
  <div class="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
    <UCard
      v-for="solution in solutions"
      :key="solution.slug"
      variant="subtle"
      :ui="{ body: 'relative flex h-full min-w-0 flex-col gap-4 pr-14' }"
    >
      <div class="flex min-w-0 items-start gap-3">
        <div class="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <UIcon :name="solution.icon || 'i-lucide-lightbulb'" class="size-5" />
        </div>
        <div class="grid min-w-0 gap-1">
          <h2 class="m-0 text-lg font-semibold leading-snug text-highlighted">
            {{ solution.title }}
          </h2>
          <UBadge
            :label="`/solutions/${solution.slug}`"
            color="neutral"
            variant="soft"
            size="sm"
            class="w-fit"
          />
          <p class="m-0 text-sm leading-6 text-muted">
            {{ solution.description }}
          </p>
        </div>
      </div>

      <UButton
        :to="`/solutions/${solution.slug}`"
        :aria-label="`View ${solution.title}`"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-right"
        class="absolute right-4 top-4"
      />
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FireuxMetaSolution } from '../../models/system/meta-content.model'

defineProps<{
  solutions: FireuxMetaSolution[]
}>()
</script>
