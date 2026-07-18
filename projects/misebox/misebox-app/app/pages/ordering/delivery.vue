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
        <p class="fx-type-headline">
          Delivery funnel
        </p>
        <h1 class="fx-type-page-title text-4xl font-black tracking-tight">
          Delivery ordering
        </h1>
        <p class="text-muted">
          Customer orders from home, confirms address coverage, agrees the
          delivery handoff, then pays once the kitchen timing is clear.
        </p>
      </section>

      <OrderingScreenStack
        :steps="[
          'Basket',
          'Allergy check',
          'Delivery address',
          'Delivery zone',
          'Kitchen timing',
          'Review',
          'Payment',
        ]"
      />

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
