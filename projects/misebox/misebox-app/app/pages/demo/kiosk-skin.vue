<template>
  <MiseboxShowcaseKiosk
    appearance="pizzeria"
    :kitchen-id="kitchen.id"
    :kitchens="[kitchen]"
    :manifest="manifest"
    :next-order-number="128"
    scope-key="default-kiosk-skin-preview"
  />
</template>

<script setup lang="ts">
const { kitchen, manifest } = await useDefaultKioskSkinPreview()

definePageMeta({
  layout: false,
  name: 'MiseboxDefaultKioskSkinPreviewPage',
})

useSeoMeta({
  title: 'Default Kiosk Skin · Misebox',
  description: 'Interactive preview of the default Misebox Kiosk skin.',
})
</script>
