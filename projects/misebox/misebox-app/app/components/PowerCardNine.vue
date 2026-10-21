<template>
  <div class="misebox-power-card-nine">
    <KitchenPrepAndProductionIngredientsCardsCell
      v-bind="ingredient"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  ingredient: {
    id: string
    to: string
    title: string
    imageUrl: string
  }
}>()
</script>

<style scoped>
.misebox-power-card-nine {
  width: min(18rem, calc(100vw - 2rem));
}
</style>
