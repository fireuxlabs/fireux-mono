<template>
  <UPage>
    <UPageHeader
      title="Prepare your Ecosystem"
      description="An Ecosystem and its main App, using shared FireUX foundations."
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
