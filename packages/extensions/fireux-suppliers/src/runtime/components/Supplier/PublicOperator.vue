<template>
  <EntityOperatorPanel
    entity-label="Supplier"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity']
const notAligned = ['Item', 'Catalogue', 'Ingredient']
</script>
