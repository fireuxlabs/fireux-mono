<template>
  <UPage>
    <UPageHeader
      title="Menu Express"
      description="Send us your menu. We prepare it, you review it, then receive your public menu and QR."
    />
    <UPageBody><MenuExpressIntake /></UPageBody>
  </UPage>
</template>
<script setup lang="ts">
definePageMeta({ title: 'Menu Express', layout: 'default' })
useSeoMeta({ title: 'Menu Express · Misebox', robots: 'noindex, nofollow' })
</script>
