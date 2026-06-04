<template>
  <EntityOperatorPanel
    entity-label="Portfolio"
    title="Portfolio console"
    description="Portfolio operators manage documents, tasks, compliance, and private portfolio work from the portfolio console."
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity', 'Document', 'Task', 'Compliance']
const notAligned = ['Client', 'Property', 'Unit']
</script>
