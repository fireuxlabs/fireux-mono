<template>
  <article
    class="min-h-[24rem] rounded-xl border border-default bg-default p-4 shadow-sm sm:p-5"
    aria-label="Dish Spec preview"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">Spec</p>
        <h3 class="mt-1 text-lg font-semibold text-highlighted">{{ dish.name }}</h3>
      </div>
      <UBadge v-if="dish.spec.station" color="neutral" variant="soft">
        {{ dish.spec.station }}
      </UBadge>
    </div>

    <p class="mt-5 text-sm text-toned">
      {{ dish.spec.summary || 'No production spec is available.' }}
    </p>
    <ol v-if="dish.spec.assembly.length" class="mt-4 grid gap-2">
      <li
        v-for="(step, index) in dish.spec.assembly"
        :key="step"
        class="flex gap-2 text-sm text-toned"
      >
        <span class="font-semibold text-primary">{{ Number(index) + 1 }}.</span>
        <span>{{ step }}</span>
      </li>
    </ol>
  </article>
</template>

<script setup lang="ts">
import type { ProductDemoDish } from './types'

defineProps<{
  dish: ProductDemoDish
}>()
</script>
