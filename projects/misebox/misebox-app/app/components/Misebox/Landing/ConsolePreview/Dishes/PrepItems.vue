<template>
  <article
    class="min-h-[24rem] rounded-xl border border-default bg-default p-4 shadow-sm sm:p-5"
    aria-label="Dish Prep items preview"
  >
    <p class="text-xs font-semibold uppercase tracking-wide text-primary">Prep items</p>
    <h3 class="mt-1 text-lg font-semibold text-highlighted">{{ dish.name }}</h3>

    <div v-if="dish.prepItems.length" class="mt-5 grid gap-2">
      <div
        v-for="item in dish.prepItems"
        :key="item.id"
        class="flex items-start justify-between gap-3 rounded-lg bg-elevated/40 p-3"
      >
        <span>
          <strong class="block text-sm text-highlighted">{{ item.name }}</strong>
          <span class="text-xs text-muted">{{ item.station }}</span>
        </span>
        <UBadge color="neutral" variant="soft" size="sm">{{ item.yield }}</UBadge>
      </div>
    </div>
    <p v-else class="mt-5 text-sm text-muted">No prep items.</p>
  </article>
</template>

<script setup lang="ts">
import type { ProductDemoDish } from './types'

defineProps<{
  dish: ProductDemoDish
}>()
</script>
