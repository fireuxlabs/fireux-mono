<template>
  <UCard
    v-if="items?.length"
    variant="subtle"
  >
    <template #header>
      <h2 class="text-lg font-semibold text-highlighted">
        Instructions
      </h2>
    </template>

    <div class="grid gap-3 md:grid-cols-3">
      <div
        v-for="item in items"
        :key="item.title"
        class="rounded-md border border-default bg-default p-4"
      >
        <UIcon :name="item.icon" class="mb-3 size-5 text-primary" />
        <h3 class="text-sm font-semibold text-highlighted">
          {{ item.title }}
        </h3>
        <p class="mt-2 text-sm leading-6 text-muted">
          {{ item.body }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { GoQrSolutionInstruction } from '../utils/goQrSolutions'

defineProps<{
  items?: GoQrSolutionInstruction[]
}>()
</script>
