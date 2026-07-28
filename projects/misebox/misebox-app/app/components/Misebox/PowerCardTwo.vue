<template>
  <div class="misebox-power-card-two">
    <div class="misebox-power-card-two__cards">
      <IngredientCardsPill
        v-for="ingredient in ingredients"
        :key="ingredient.slug"
        v-bind="ingredient"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  ingredients: {
    slug: string
    to: string
    title: string
    subtitle: string
    imageUrl: string
  }[]
}>()
</script>

<style scoped>
.misebox-power-card-two {
  display: grid;
  width: min(100%, 16rem);
  min-width: 0;
}

.misebox-power-card-two__cards {
  display: grid;
  min-width: 0;
  gap: var(--spacing);
}
</style>
