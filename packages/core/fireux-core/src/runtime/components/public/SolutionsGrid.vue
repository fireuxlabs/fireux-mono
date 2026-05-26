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
          <h2 class="text-lg font-semibold text-highlighted">
            {{ solution.title }}
          </h2>
          <p class="text-sm leading-6 text-muted">
            {{ solution.description }}
          </p>
        </div>
      </div>

      <UButton
        :to="solution.cta?.to || `/solutions/${solution.slug}`"
        :target="solution.cta?.external ? '_blank' : undefined"
        color="neutral"
        variant="soft"
        trailing-icon="i-lucide-arrow-right"
        class="mt-auto w-fit"
      >
        {{ solution.cta?.label || 'Open' }}
      </UButton>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FireuxMetaSolution } from '../../models/system/meta-content.model'

defineProps<{
  solutions: FireuxMetaSolution[]
}>()
</script>
