<template>
  <UCard as="article">
    <div class="pagebody">
      <div>
        <div>
          <p class="fx-type-caption">Dish</p>
          <h3 class="fx-type-card-heading">{{ dish.name }}</h3>
          <p v-if="dish.priceLabel" class="fx-type-caption">
            {{ dish.priceLabel }}
          </p>
        </div>
        <UBadge v-if="dish.spec.station" color="neutral" variant="soft">
          {{ dish.spec.station }}
        </UBadge>
      </div>

      <div v-if="dish.spec.id">
        <p class="fx-type-caption">Build spec</p>
        <p class="fx-type-caption">{{ dish.spec.summary }}</p>

        <h4 class="fx-type-card-heading">Assembly</h4>
        <ol class="fx-list-stack">
          <li v-for="(step, index) in dish.spec.assembly" :key="step">
            <span>{{ Number(index) + 1 }}.</span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProductDemoDish } from './types'

defineProps<{
  dish: ProductDemoDish
}>()
</script>
