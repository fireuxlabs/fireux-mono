<template>
  <div class="mx-auto max-w-3xl p-6">
    <UAlert
      color="neutral"
      variant="soft"
      title="Property detail is not wired yet"
      description="The live portfolio seam is now being normalized first. Property detail can be reintroduced later on top of the simplified portfolio runtime."
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'Property detail',
  description: 'Property detail is temporarily parked while the live portfolio seam is normalized.',
})
</script>
