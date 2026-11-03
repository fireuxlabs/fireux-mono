<template>
  <UPage>
    <UPageHeader
      title="Menu Hosting"
      description="Put your menu online for free. Upload a PDF or image, preview it, and get your link and QR."
    />
    <UPageBody><MenuDocument /></UPageBody>
  </UPage>
</template>
<script setup lang="ts">
definePageMeta({
  title: 'Menu Hosting',
  layout: 'default',
  nav: {
    key: 'menu-express-product',
    label: 'Menu Hosting',
    icon: 'i-lucide-qr-code',
    order: 20,
    position: 'top',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
  },
})
useSeoMeta({
  title: 'Free Menu Hosting & QR Code · Misebox',
  description:
    'Upload your PDF or menu image, publish it online for free and download its QR. Replace your menu later without changing the link or QR.',
  robots: 'index, follow',
})
</script>
