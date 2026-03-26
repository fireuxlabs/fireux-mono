<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
})

await navigateTo('/console/projects', { replace: true })
</script>
