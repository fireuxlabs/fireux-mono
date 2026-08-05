<template>
  <PublicSimplePage
    title="Misebox moved"
    description="The FireUX overview of Misebox now lives in the Ecosystems directory."
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

await navigateTo('/ecosystems/misebox', {
  redirectCode: 301,
  replace: true,
})
</script>
