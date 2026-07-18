<template>
  <UCard :ui="{ body: 'fx-card-body-stack' }">
    <h2 class="fx-type-card-heading">
      Screen stack
    </h2>
    <ol class="list-decimal fx-list-stack text-muted">
      <li v-for="step in steps" :key="step">
        {{ step }}
      </li>
    </ol>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  steps: readonly string[]
}>()
</script>
