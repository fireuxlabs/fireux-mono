<template>
  <EntityOperatorPanel
    entity-label="Portfolio"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity']
const notAligned = ['Document', 'Task', 'Compliance']
</script>
