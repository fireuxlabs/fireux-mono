<template>
  <article
    class="min-h-[20rem] overflow-hidden rounded-xl border border-default bg-default shadow-sm"
  >
    <div class="flex min-w-0 flex-col p-4 sm:p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="fx-type-caption">Dish</p>
          <h3 class="mt-1 fx-type-card-heading">{{ dish.name }}</h3>
          <p v-if="dish.priceLabel" class="mt-1 fx-type-caption">
            {{ dish.priceLabel }}
          </p>
        </div>
        <UBadge v-if="dish.spec.station" color="neutral" variant="soft">
          {{ dish.spec.station }}
        </UBadge>
      </div>

      <div v-if="dish.spec.id" class="mt-5">
        <p class="fx-type-caption">Build spec</p>
        <p class="mt-2 fx-type-caption">{{ dish.spec.summary }}</p>

        <h4 class="mt-4 fx-type-card-heading">Assembly</h4>
        <ol class="mt-2 grid gap-1.5">
          <li
            v-for="(step, index) in dish.spec.assembly"
            :key="step"
            class="flex gap-2"
          >
            <span>{{ Number(index) + 1 }}.</span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { ProductDemoDish } from './types'

defineProps<{
  dish: ProductDemoDish
}>()
</script>
