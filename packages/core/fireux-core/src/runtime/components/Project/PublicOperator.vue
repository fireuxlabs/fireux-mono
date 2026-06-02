<template>
  <EntityOperatorPanel
    entity-label="Project"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity', 'App', 'Ecosystem']
const notAligned = []
</script>
