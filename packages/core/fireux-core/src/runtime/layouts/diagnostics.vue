<template>
  <ClientOnly>
    <UDashboardGroup unit="rem">
      <UDashboardSidebar id="core-diagnostics" collapsible resizable>
        <template #default="{ collapsed }">
          <FireLayoutsDiagnosticsNav :collapsed="collapsed ?? false" />
        </template>
      </UDashboardSidebar>

      <div class="w-full h-screen overflow-y-auto">
        <div class="min-h-full p-0 lg:p-4">
          <slot />
        </div>
      </div>
    </UDashboardGroup>
  </ClientOnly>
</template>

<script setup lang="ts">
// Diagnostics navigation and the current inspection page.
defineOptions({ name: 'diagnostics' })
</script>
