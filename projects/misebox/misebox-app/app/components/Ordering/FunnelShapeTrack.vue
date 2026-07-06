<template>
  <section class="grid gap-4">
    <OrderingObjectShape
      title="starting context + draft"
      :data="track.start"
    />

    <div class="grid gap-4 lg:grid-cols-2">
      <OrderingObjectShape
        title="basket"
        :data="track.basket"
      />

      <OrderingObjectShape
        title="order + allergen"
        :data="track.withAllergen"
      />

      <OrderingObjectShape
        :title="`order + allergen + ${track.modeLabel}`"
        :data="track.withMode"
      />

      <OrderingObjectShape
        :title="`order + allergen + ${track.modeLabel} + submission`"
        :data="track.withSubmission"
      />
    </div>

    <OrderingKitchenReceiving
      :receiving="track.kitchen"
      :title="`order + allergen + ${track.modeLabel} + submission + given`"
    />
  </section>
</template>

<script setup lang="ts">
import type { OrderingFunnelShapeTrack } from '~/utils/orderingFunnelShapes'

defineProps<{
  track: OrderingFunnelShapeTrack
}>()
</script>
