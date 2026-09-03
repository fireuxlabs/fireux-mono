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
        <p class="fx-type-headline">Scheduled funnel</p>
        <h1 class="fx-type-page-title text-4xl font-black tracking-tight">
          Catering ordering
        </h1>
        <p class="text-muted">
          Event-led ordering where basket, headcount, date, location, quote, and
          deposit need to come together before confirmation.
        </p>
      </section>

      <OrderingScreenStack
        :steps="[
          'Basket or package',
          'Allergy check',
          'Event details',
          'Quote review',
          'Deposit or payment',
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
  channel: 'menu',
  route: {
    menuId: 'la-tapberne--food',
    kitchenSlug: 'la-tapberne',
  },
  orderType: 'pre_order',
  modeLabel: 'catering',
  mode: {
    preOrder: {
      requested_for: '2026-08-12T19:00:00+02:00',
      notice_hours: 72,
    },
    catering: {
      eventDate: '2026-08-12',
      location: 'Private event room',
      partySize: 24,
    },
  },
  submission: {
    id: 'demo-catering-order',
    kitchen_id: 'ChIJ08WSgYSjj0cRD6oE3RwUFk0',
    menu_id: 'food',
    order_number: 'C-204',
  },
})

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingCateringPage',
})

useSeoMeta({
  title: 'Catering Ordering · Misebox',
  description:
    'Misebox catering ordering for events, group menus, quotes, deposits, and kitchen acceptance.',
})
</script>
