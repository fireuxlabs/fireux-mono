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
          Scheduled funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Catering ordering
        </h1>
        <p class="text-muted">
          Event-led ordering where basket, headcount, date, location, quote,
          and deposit need to come together before confirmation.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal fx-list-stack text-muted">
          <li>Basket or package</li>
          <li>Allergy check</li>
          <li>Event details</li>
          <li>Quote review</li>
          <li>Deposit or payment</li>
          <li>Confirmation</li>
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
    menuId: 'la-tapberne-main',
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
    menu_id: 'main',
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
