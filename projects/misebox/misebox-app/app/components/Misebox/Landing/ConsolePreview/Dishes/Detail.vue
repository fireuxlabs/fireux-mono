<template>
  <article
    class="grid min-h-[24rem] overflow-hidden rounded-xl border border-default bg-default shadow-sm sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
  >
    <div class="min-h-48 bg-elevated">
      <img
        v-if="dish.imageUrl"
        :src="dish.imageUrl"
        :alt="dish.name"
        class="size-full object-cover"
      >
      <div
        v-else
        class="flex size-full items-center justify-center text-muted"
        aria-hidden="true"
      >
        <UIcon name="i-lucide-utensils" class="size-10" />
      </div>
    </div>

    <div class="flex min-w-0 flex-col p-4 sm:p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary">Dish</p>
          <h3 class="mt-1 text-xl font-semibold text-highlighted">{{ dish.name }}</h3>
          <p class="mt-1 text-sm text-muted">
            {{ [dish.kind, dish.priceLabel].filter(Boolean).join(' · ') }}
          </p>
        </div>
        <UBadge v-if="dish.spec.station" color="neutral" variant="soft">
          {{ dish.spec.station }}
        </UBadge>
      </div>

      <div v-if="dish.spec.id" class="mt-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-primary">Build spec</p>
        <p class="mt-2 text-sm text-toned">{{ dish.spec.summary }}</p>

        <h4 class="mt-4 text-sm font-semibold text-highlighted">Assembly</h4>
        <ol class="mt-2 grid gap-1.5">
          <li
            v-for="(step, index) in dish.spec.assembly"
            :key="step"
            class="flex gap-2 text-xs text-toned"
          >
            <span class="font-semibold text-primary">{{ Number(index) + 1 }}.</span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </div>

      <MiseboxLandingConsolePreviewDishesDetailSections
        :dish="dish"
        @select="$emit('select-section', $event)"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { DishChildPage, ProductDemoDish } from './types'

defineProps<{
  dish: ProductDemoDish
}>()

defineEmits<{
  (event: 'select-section', page: Exclude<DishChildPage, 'detail'>): void
}>()
</script>
