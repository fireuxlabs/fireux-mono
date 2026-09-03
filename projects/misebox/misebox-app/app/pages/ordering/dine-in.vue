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
        <p class="fx-type-headline">On-premise funnel</p>
        <h1 class="fx-type-page-title text-4xl font-black tracking-tight">
          Dine-in ordering
        </h1>
        <p class="text-muted">
          Table, bar, and counter ordering where the customer is already in the
          venue and the kitchen needs clear context before fulfilment.
        </p>
      </section>

      <OrderingScreenStack
        :steps="[
          'Basket',
          'Allergy check',
          'Table or service context',
          'Send to kitchen',
          'Tab or payment',
          'Confirmation',
        ]"
      />

      <OrderingFunnelShapeTrack :track="shapeTrack" />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { createOrderingFunnelShapeTrack } from '~/utils/orderingFunnelShapes'

const shapeTrack = createOrderingFunnelShapeTrack({
  channel: 'table_qr',
  route: {
    menuId: 'baeren-ringgenberg--food',
    kitchenSlug: 'baeren-ringgenberg',
  },
  orderType: 'dine_in',
  modeLabel: 'table',
  mode: {
    table: {
      number: 'Table 12',
    },
  },
  submission: {
    id: 'demo-table-order',
    kitchen_id: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
    menu_id: 'food',
    order_number: 'T-104',
  },
})

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingDineInPage',
})

useSeoMeta({
  title: 'Dine-in Ordering · Misebox',
  description:
    'Misebox dine-in ordering for tables, bars, counters, tabs, and in-venue kitchen fulfilment.',
})
</script>
