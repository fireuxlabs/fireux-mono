<template>
  <EntityOperatorPanel
    entity-label="Kitchen"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity', 'Recipe', 'Ingredient']
const notAligned = [
  'Dish',
  'Menu',
  'Supplier',
  'Mise',
  'Order',
  'Team',
  'Station',
]
</script>
