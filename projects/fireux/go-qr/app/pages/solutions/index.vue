<template>
  <UPage>
    <UPageBody>
      <FireLandingSolutions
        variant="hub"
        title="What do you need a QR code for?"
        subtitle="Pick the thing people should open, save, join, or contact after they scan."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  nav: {
    key: 'solutions',
    label: 'Solutions',
    icon: 'i-lucide-lightbulb',
    order: 28,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['default', 'landing'],
    visibility: {
      appRoles: ['global', 'standalone'],
    },
  },
})

useSeoMeta({
  title: 'Solutions - Go QR',
  description: 'Choose a Go QR primitive.',
})
</script>
