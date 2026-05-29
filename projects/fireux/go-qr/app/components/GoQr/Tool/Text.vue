<template>
  <p class="text-sm leading-6 text-muted">
    {{ data?.tool.message }}
  </p>
</template>

<script setup lang="ts">
const { data } = await useFetch('/api/tools/text')
</script>
