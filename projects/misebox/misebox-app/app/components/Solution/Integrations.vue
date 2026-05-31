<template>
  <UCard variant="subtle">
    <template #header>
      <h2 class="text-lg font-semibold text-highlighted">
        Integrations
      </h2>
    </template>

    <div class="space-y-4">
      <p class="text-sm leading-6 text-muted">
        {{ integrations.body }}
      </p>

      <div class="grid gap-3 md:grid-cols-3">
        <div
          v-for="item in integrations.items"
          :key="item.name"
          class="rounded-md border border-default bg-default p-3"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="item.icon" class="size-4 text-primary" />
            <h3 class="text-sm font-semibold text-highlighted">
              {{ item.name }}
            </h3>
          </div>
          <p class="mt-2 text-xs leading-5 text-muted">
            {{ item.body }}
          </p>
          <UButton
            v-if="item.to"
            :to="item.to"
            :target="item.external ? '_blank' : undefined"
            :external="item.external"
            color="neutral"
            variant="ghost"
            size="xs"
            trailing-icon="i-lucide-arrow-up-right"
            class="mt-3"
          >
            {{ item.cta }}
          </UButton>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { MiseboxSolution } from '../../utils/miseboxSolutions'

defineProps<{
  integrations: MiseboxSolution['integrations']
}>()
</script>
