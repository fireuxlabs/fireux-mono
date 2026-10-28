<template>
  <UPage>
    <UPageHeader
      title="Prepare a FireUX starting App"
      description="Prove the assisted Ignition path with the existing read-only Kitchen Menu demo."
    />
    <UPageBody><IgnitionPreview /></UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  requiresAuth: false,
  nav: { hidden: true },
})
useSeoMeta({ title: 'Ignition starting App', robots: 'noindex, nofollow' })
</script>
