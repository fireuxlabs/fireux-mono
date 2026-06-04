<template>
  <EntityOperatorPanel
    entity-label="Project"
    title="Project console"
    description="Project operators manage apps, ecosystem links, and project work from the project console."
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
const aligned = ['Identity', 'App', 'Ecosystem']
const notAligned = []
</script>
