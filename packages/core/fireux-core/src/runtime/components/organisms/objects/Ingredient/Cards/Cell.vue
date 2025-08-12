<script setup lang="ts">
interface IngredientCellProps {
  ingredient: { id: string; name: string }
}
const props = defineProps<IngredientCellProps>()
</script>

<template>
  <div
    class="objects cards cell ingredient-cell"
    :data-id="props.ingredient.id"
  >
    <div class="header">
      <div class="info">
        <div class="title">{{ props.ingredient.name }}</div>
        <div class="subtitle">Ingredient</div>
      </div>
    </div>
  </div>
</template>
