<template>
  <section v-if="init" class="space-y-2">
    <pre>ConsolePortfolioIndexTest</pre>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  init?: boolean
}>()
</script>
