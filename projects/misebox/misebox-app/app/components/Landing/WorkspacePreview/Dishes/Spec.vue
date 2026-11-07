<template>
  <UCard as="article" aria-label="Dish Spec preview">
    <div>
      <div>
        <p class="fx-type-caption">Spec</p>
        <h3 class="fx-type-card-heading">{{ dish.name }}</h3>
      </div>
      <UBadge v-if="dish.spec.station" color="neutral" variant="soft">
        {{ dish.spec.station }}
      </UBadge>
    </div>

    <p class="fx-type-caption">
      {{ dish.spec.summary || 'No production spec is available.' }}
    </p>
    <ol v-if="dish.spec.assembly.length" class="fx-list-stack">
      <li v-for="(step, index) in dish.spec.assembly" :key="step">
        <span>{{ Number(index) + 1 }}.</span>
        <span>{{ step }}</span>
      </li>
    </ol>
  </UCard>
</template>

<script setup lang="ts">
import type { ProductDemoDish } from './types'

defineProps<{
  dish: ProductDemoDish
}>()
</script>
