<template>
  <EntityIndexCta
    title="Menus"
    description="Browse live menus, or create a simple menu QR when you need one."
    family="domain-managed"
    :actions="actions"
  />
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Browse',
    cta: 'See live menus',
    to: '#live-menus',
    icon: 'i-lucide-book-open-check',
  },
  {
    label: 'Create',
    cta: 'Create menu QR',
    to: '/solutions/qr-menu',
    icon: 'i-lucide-qr-code',
  },
  {
    label: 'Upload',
    cta: 'Upload menu',
    to: '/solutions/qr-menu',
    icon: 'i-lucide-file-up',
  },
] as const
</script>
