<template>
  <EntityOperatorPanel
    entity-label="Supplier"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity', 'Item', 'Catalogue', 'Ingredient']
const notAligned = []
</script>
