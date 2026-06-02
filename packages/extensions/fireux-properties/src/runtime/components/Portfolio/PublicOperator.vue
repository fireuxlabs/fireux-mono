<template>
  <EntityOperatorPanel
    entity-label="Portfolio"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity', 'Document', 'Task', 'Compliance']
const notAligned = ['Client', 'Property', 'Unit']
</script>
