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
          Queue funnel
        </p>
        <h1 class="text-4xl font-black tracking-tight text-highlighted">
          Take-away ordering
        </h1>
        <p class="text-muted">
          Kiosk and counter ordering where guests choose eat in or take away,
          join the queue, then collect a tray or paper bag when called.
        </p>
      </section>

      <UCard :ui="{ body: 'space-y-4' }">
        <h2 class="text-2xl font-black tracking-tight">
          Screen stack
        </h2>
        <ol class="list-decimal space-y-2 pl-5 text-muted">
          <li>Basket</li>
          <li>Eat in or take away</li>
          <li>Allergy check</li>
          <li>Queue number</li>
          <li>Payment</li>
          <li>Order called</li>
        </ol>
      </UCard>

      <OrderingFunnelShapeTrack :track="shapeTrack" />
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { createOrderingFunnelShapeTrack } from '~/utils/orderingFunnelShapes'

const shapeTrack = createOrderingFunnelShapeTrack({
  route: {
    menuId: 'pizza-snacks-drinks',
    kitchenSlug: 'baeren-ringgenberg',
  },
  orderType: 'takeaway',
  modeLabel: 'kiosk',
  mode: {
    kiosk: {
      mode: 'takeaway',
      handoff: 'bag',
      queueArea: 'Pickup counter',
    },
  },
  submission: {
    id: 'demo-kiosk-order',
    kitchen_id: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
    menu_id: 'pizza-snacks-drinks',
    order_number: 'K-104',
  },
})

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingTakeAwayPage',
})

useSeoMeta({
  title: 'Take-away Ordering · Misebox',
  description:
    'Misebox take-away ordering for kiosks, queue numbers, eat-in trays, and paper bag pickup.',
})
</script>
