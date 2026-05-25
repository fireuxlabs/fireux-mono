<template>
  <UDashboardPanel id="console-property-emergency">
    <template #header>
      <LayoutsConsoleNavbar title="Property Emergency" />
    </template>

    <template #body>
      <PropertyInfoEditor page-key="emergency" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PropertyInfoEditor from '../../../components/Console/Properties/InfoEditor.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-emergency',
    label: 'Emergency',
    icon: 'i-lucide-siren',
    position: 'top',
    requiresSelection: true,
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
