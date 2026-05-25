<template>
  <UDashboardPanel id="console-property-local-guide">
    <template #header>
      <LayoutsConsoleNavbar title="Property Local Guide" />
    </template>

    <template #body>
      <PropertyInfoEditor page-key="local-guide" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PropertyInfoEditor from '../../../components/Console/Properties/InfoEditor.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-local-guide',
    label: 'Local Guide',
    icon: 'i-lucide-map-pin',
    position: 'top',
    requiresSelection: true,
    order: 90,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
