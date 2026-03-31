<template>
  <div class="space-y-6 py-12">
    <MissingBrandAssetsFlag />
    <TenantPlaceholderFlag />
    <AppCreateSystem />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Tenant Onboarding',
  description: 'Initialize the tenant app and verify required configuration.',
})
</script>
