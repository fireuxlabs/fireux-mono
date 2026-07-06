<template>
  <section class="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
    <div class="space-y-3">
      <h2 class="text-lg font-black text-highlighted">
        Kitchen receiving
      </h2>

      <ConsoleKitchenOperationsOrdersCardsTicket
        :order="receiving.order"
        status-action-label="Accept"
        status-action-aria-label="Accept incoming order"
      />
    </div>

    <OrderingObjectShape
      :title="title"
      :data="receiving.shape"
    />
  </section>
</template>

<script setup lang="ts">
import type { OrderingKitchenReceiving } from '~/utils/orderingFunnelShapes'

defineProps<{
  receiving: OrderingKitchenReceiving
  title: string
}>()
</script>
