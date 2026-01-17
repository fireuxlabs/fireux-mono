<template>
  <ClientOnly>
    <UDashboardGroup unit="rem">
      <UDashboardSidebar
        id="core-dev"
        collapsible
        resizable
        class="bg-elevated/25"
      >
        <template #default="{ collapsed }">
          <LayoutsDevNav :collapsed="collapsed ?? false" />
        </template>
      </UDashboardSidebar>

      <div class="w-full h-screen overflow-y-auto p-0 lg:p-4 bg-elevated/50">
        <NuxtPage />
      </div>
    </UDashboardGroup>
  </ClientOnly>
</template>

<script setup lang="ts">
// Dev layout renders the DevNav and the current page; links are read inside DevNav
defineOptions({ name: 'dev' })
</script>
