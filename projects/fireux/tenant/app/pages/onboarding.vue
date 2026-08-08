<template>
  <div class="space-y-6 py-12">
    <LandingMissingBrandAssetsFlag />
    <LandingTenantPlaceholderFlag />
    <AppInitializeSystem />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Tenant Onboarding',
  description:
    'Initialize the configured tenant App and verify required configuration.',
})
</script>
