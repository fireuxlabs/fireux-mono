<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <NuxtPage />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'console',
  requiresAuth: true,
})
</script>
