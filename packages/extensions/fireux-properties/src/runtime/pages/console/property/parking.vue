<template>
  <UDashboardPanel id="console-property-parking">
    <template #header>
      <LayoutsConsoleNavbar title="Property Parking" />
    </template>

    <template #body>
      <PropertyInfoEditor page-key="parking" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PropertyInfoEditor from '../../../components/organisms/Console/Properties/InfoEditor.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-parking',
    label: 'Parking',
    icon: 'i-lucide-car',
    position: 'top',
    requiresSelection: true,
    order: 80,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
