<template>
  <UDashboardPanel id="console-property-updates">
    <template #header>
      <LayoutsConsoleNavbar title="Property Updates" />
    </template>

    <template #body>
      <PropertyInfoEditor page-key="updates" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PropertyInfoEditor from '../../../components/organisms/Console/Properties/InfoEditor.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-updates',
    label: 'Updates',
    icon: 'i-lucide-megaphone',
    position: 'top',
    requiresSelection: true,
    order: 100,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
