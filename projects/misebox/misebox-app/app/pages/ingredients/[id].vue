<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string
</script>

<template>
  <div class="page ingredient-detail-page">
    <IngredientProfile />
    <div style="margin-top: 2rem">
      <IngredientEdit />
    </div>
  </div>
</template>
