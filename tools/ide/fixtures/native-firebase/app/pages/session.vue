<script setup lang="ts">
if (import.meta.server)
  useResponseHeader('Cache-Control').value = 'private, no-store'
const { data } = await useFetch('/api/session')
</script>

<template>
  <h1>{{ data?.uid ?? 'signed out' }}</h1>
</template>
