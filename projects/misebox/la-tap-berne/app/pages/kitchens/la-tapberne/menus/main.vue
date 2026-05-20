<template>
  <span />
</template>

<script setup lang="ts">
const route = useRoute()

definePageMeta({
  layout: 'default',
})

await navigateTo(
  {
    path: '/menu',
    query: route.query,
  },
  { replace: true }
)
</script>
