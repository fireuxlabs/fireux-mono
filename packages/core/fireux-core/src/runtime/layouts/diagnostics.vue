<template>
  <ClientOnly>
    <UDashboardGroup unit="rem">
      <UDashboardSidebar id="core-diagnostics" collapsible resizable>
        <template #default="{ collapsed }">
          <FireLayoutsDiagnosticsNav :collapsed="collapsed ?? false" />
        </template>
      </UDashboardSidebar>

      <UDashboardPanel id="core-diagnostics-content">
        <template #body><slot /></template>
      </UDashboardPanel>
    </UDashboardGroup>
  </ClientOnly>
</template>

<script setup lang="ts">
// Diagnostics navigation and the current inspection page.
defineOptions({ name: 'diagnostics' })
</script>
