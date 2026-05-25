<template>
  <UDashboardPanel id="console-property-check-in">
    <template #header>
      <LayoutsConsoleNavbar title="Property Check-in" />
    </template>

    <template #body>
      <PropertyInfoEditor page-key="check-in" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PropertyInfoEditor from '../../../components/Console/Properties/InfoEditor.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-check-in',
    label: 'Check-in',
    icon: 'i-lucide-key-round',
    position: 'top',
    requiresSelection: true,
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
