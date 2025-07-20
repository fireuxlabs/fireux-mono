<template>
  <pre>{{ post }}</pre>
</template>

<script setup lang="ts">

defineProps({
  post: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
/* No styles for now */
</style>
