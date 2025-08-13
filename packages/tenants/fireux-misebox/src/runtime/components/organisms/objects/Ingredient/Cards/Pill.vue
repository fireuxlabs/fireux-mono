<template>
  <UCard class="objects cards cell pill">
    <div class="header">
      <div class="icon small">🥬</div>
      <div class="info">
        <h4 v-if="ingredient?.name" class="title">
          {{ ingredient.name }}
        </h4>
        <p v-if="ingredient?.category" class="subtitle">
          {{ ingredient.category }}
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Ingredient } from '../../../../../models/objects/Ingredient.model'

defineProps<{
  ingredient?: Partial<Ingredient>
}>()
</script>
