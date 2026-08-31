<template>
  <UCard>
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="space-y-1">
        <h2 class="font-semibold text-highlighted">Kiosks</h2>
        <p class="text-sm leading-6 text-dimmed">
          Activate trusted tablets, open their live ordering Menu, and revoke
          devices that should no longer take orders.
        </p>
      </div>
      <UButton
        to="/workspace/kitchen/orders/kiosks"
        icon="i-lucide-monitor-smartphone"
        label="Manage kiosks"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineOptions({ name: 'WorkspaceKitchenOrdersKioskDoorway' })
</script>
