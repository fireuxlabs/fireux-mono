<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Property unavailable',
  description: 'Property page unavailable.',
})

throw createError({
  statusCode: 404,
  statusMessage: 'Property page unavailable',
})
</script>
