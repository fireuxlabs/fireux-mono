<template>
  <EntityOperatorPanel
    entity-label="Supplier"
    title="Supplier console"
    description="Supplier operators manage catalogue items, ingredients, and supplier work from the supplier console."
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity', 'Item', 'Catalogue', 'Ingredient']
const notAligned = []
</script>
