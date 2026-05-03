<template>
  <div class="space-y-6">
    <UCard>
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Orders</div>
        </div>
      </template>

      <OrganismsOrderCollectionManager :orders="orders" />
    </UCard>

    <DevFireuxDebugPanel
      v-if="isDev"
      title="Kitchen orders"
      scope="console"
      :data="debug"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleOrders } from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleOrders'

const { orders, debug } = useKitchenConsoleOrders()
const isDev = import.meta.dev
</script>
