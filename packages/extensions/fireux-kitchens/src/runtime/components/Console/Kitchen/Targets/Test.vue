<template>
  <section v-if="init" class="space-y-2">
    <pre>ConsoleKitchenTargetsTest</pre>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  init?: boolean
}>()
</script>
