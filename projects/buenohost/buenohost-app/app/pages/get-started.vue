<template>
  <PublicSimplePage
    title="Get Started"
    description="Create a QR-ready stay companion for guests."
    back-label="BuenoHost"
  >
    <section class="space-y-4">
      <ol class="list-decimal fx-list-stack text-muted">
        <li>Choose a property or stay experience.</li>
        <li>Add the information guests need before and during the stay.</li>
        <li>Share the public guide with a QR code.</li>
      </ol>
    </section>

    <template #actions>
      <UButton
        to="/"
        icon="i-lucide-qr-code"
        size="lg"
      >
        View BuenoHost
      </UButton>
    </template>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'get-started',
    label: 'Get Started',
    icon: 'i-lucide-rocket',
    order: 10,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Get Started - BuenoHost',
  description: 'Start with BuenoHost by creating a QR-ready stay companion for guests.',
})
</script>
