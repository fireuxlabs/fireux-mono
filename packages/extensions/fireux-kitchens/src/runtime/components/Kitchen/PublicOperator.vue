<template>
  <EntityOperatorPanel
    entity-label="Kitchen"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity']
const notAligned = [
  'Dish',
  'Menu',
  'Recipe',
  'Ingredient',
  'Mise',
  'Order',
  'Team',
  'Station',
]
</script>
