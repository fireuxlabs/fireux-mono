<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-5xl space-y-6">
      <UButton
        to="/ordering"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Ordering
      </UButton>

      <section class="space-y-3">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Delivery funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Delivery ordering
        </h1>
        <p class="text-muted">
          Customer orders from home, confirms address coverage, agrees the
          delivery handoff, then pays once the kitchen timing is clear.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal space-y-2 pl-5 text-muted">
          <li>Basket</li>
          <li>Allergy check</li>
          <li>Delivery address</li>
          <li>Delivery zone</li>
          <li>Kitchen timing</li>
          <li>Review</li>
          <li>Payment</li>
        </ol>
      </UCard>

      <OrderingFunnelShapeTrack :track="shapeTrack" />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { createOrderingFunnelShapeTrack } from '~/utils/orderingFunnelShapes'

const shapeTrack = createOrderingFunnelShapeTrack({
  channel: 'menu',
  route: {
    menuId: 'pizza-snacks-drinks',
    kitchenSlug: 'baeren-ringgenberg',
  },
  orderType: 'delivery',
  modeLabel: 'delivery',
  mode: {
    delivery: {
      ready: true,
      address: {
        input: 'Interlakenstrasse 20, 3852 Ringgenberg',
        postal_code: '3852',
      },
      zone: {
        name: 'Ringgenberg',
        fee_chf: 0,
      },
    },
  },
  submission: {
    id: 'demo-delivery-order',
    kitchen_id: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
    menu_id: 'pizza-snacks-drinks',
    order_number: 'D-104',
  },
})

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingDeliveryPage',
})

useSeoMeta({
  title: 'Delivery Ordering · Misebox',
  description:
    'Misebox delivery ordering for home orders, address coverage, delivery zones, kitchen timing, and online payment.',
})
</script>
