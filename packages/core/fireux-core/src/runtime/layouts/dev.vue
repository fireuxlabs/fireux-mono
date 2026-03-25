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

      <div class="w-full h-screen overflow-y-auto bg-elevated/50">
        <div class="min-h-full p-0 lg:p-4">
          <NuxtPage />
        </div>
      </div>
    </UDashboardGroup>
  </ClientOnly>
</template>

<script setup lang="ts">
// Dev layout renders the DevNav and the current page; links are read inside DevNav
defineOptions({ name: 'dev' })
</script>
