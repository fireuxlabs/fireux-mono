<template>
  <div
    class="objects cards cell ingredient-cell"
    :data-id="ingredient?.id"
  >
    <div class="header">
      <div class="info">
  <div class="title">{{ ingredient?.name }}</div>
        <div class="subtitle">Ingredient</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ingredient } from '../../../../../models/objects/Ingredient.model'

defineProps<{
  ingredient?: Partial<Ingredient>
}>()
</script>
