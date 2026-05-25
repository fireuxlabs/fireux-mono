<template>
  <UDashboardPanel id="console-property-checkout">
    <template #header>
      <LayoutsConsoleNavbar title="Property Checkout" />
    </template>

    <template #body>
      <PropertyInfoEditor page-key="checkout" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PropertyInfoEditor from '../../../components/Console/Properties/InfoEditor.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-checkout',
    label: 'Checkout',
    icon: 'i-lucide-door-open',
    position: 'top',
    requiresSelection: true,
    order: 30,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
