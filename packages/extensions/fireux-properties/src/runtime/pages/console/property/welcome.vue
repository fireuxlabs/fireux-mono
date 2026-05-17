<template>
  <UDashboardPanel id="console-property-welcome">
    <template #header>
      <LayoutsConsoleNavbar title="Property Welcome" />
    </template>

    <template #body>
      <PropertyInfoEditor page-key="welcome" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import PropertyInfoEditor from '../../../components/organisms/Console/Properties/InfoEditor.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-properties'] },
    key: 'console-property-welcome',
    label: 'Welcome',
    icon: 'i-lucide-hand-heart',
    position: 'top',
    requiresSelection: true,
    order: 10,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
