<template>
  <div class="mx-auto max-w-3xl p-6">
    <UAlert
      color="neutral"
      variant="soft"
      title="Property"
      description="This shared property route is a fallback. App-specific property pages should provide the live guest or console experience."
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Property detail',
  description: 'Shared property route fallback.',
})
</script>
