<template>
  <div />
</template>
<script setup lang="ts">
definePageMeta({ layout: false, pageTransition: false, requiresAuth: false })
const route = useRoute()
await navigateTo(
  { path: '/', query: route.query, hash: route.hash },
  { redirectCode: 301, replace: true }
)
</script>
