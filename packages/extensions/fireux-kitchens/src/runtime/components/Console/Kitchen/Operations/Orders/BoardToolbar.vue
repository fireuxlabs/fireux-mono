<template>
  <UDashboardToolbar>
    <template #left>
      <ConsoleKitchenOperationsOrdersIncoming />
      <ConsoleKitchenOperationsOrdersComplete />
    </template>
  </UDashboardToolbar>
</template>

<script setup lang="ts">
defineOptions({ name: 'ConsoleKitchenOperationsOrdersBoardToolbar' })
</script>
