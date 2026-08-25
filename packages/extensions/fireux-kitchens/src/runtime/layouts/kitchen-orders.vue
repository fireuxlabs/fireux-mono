<template>
  <UDashboardPanel
    id="kitchen-orders"
    :ui="{ body: 'kitchen-orders-layout__body' }"
  >
    <template #header>
      <UDashboardNavbar title="Orders" :toggle="false">
        <template #leading>
          <NuxtLink to="/" aria-label="Home">
            <AppBrandWordmark size="card" alt="Misebox" />
          </NuxtLink>
        </template>

        <template #right>
          <WorkspaceKitchenCapabilityContextInfo operation="orders" />
          <div id="kitchen-orders-actions" />
          <UButton
            to="/"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            aria-label="Close orders"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <NuxtPage />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
defineOptions({ name: 'KitchenOrdersLayout' })
</script>

<style scoped>
:deep(.kitchen-orders-layout__body) {
  padding-top: 0;
}
</style>
