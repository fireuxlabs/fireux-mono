<script setup lang="ts">
const route = useRoute()

await navigateTo(
  {
    path: '/workspace/kitchen/prep/stations',
    query: route.query,
    hash: route.hash,
  },
  { redirectCode: 301, replace: true }
)
</script>

<template>
  <div />
</template>
