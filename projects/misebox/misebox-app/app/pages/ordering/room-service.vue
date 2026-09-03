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
        <p class="fx-type-headline">Hotel funnel</p>
        <h1 class="fx-type-page-title text-4xl font-black tracking-tight">
          Room service ordering
        </h1>
        <p class="text-muted">
          A delivery-shaped funnel for hotels, aparthotels, serviced apartments,
          and private rooms where destination is a room or guest stay.
        </p>
      </section>

      <OrderingScreenStack
        :steps="[
          'Basket',
          'Allergy check',
          'Room destination',
          'Kitchen timing',
          'Room charge or payment',
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
  channel: 'room_service',
  route: {
    menuId: 'baeren-ringgenberg--food',
    kitchenSlug: 'baeren-ringgenberg',
  },
  orderType: 'room_service',
  modeLabel: 'roomService',
  mode: {
    roomService: {
      room: '204',
    },
  },
  submission: {
    id: 'demo-room-service-order',
    kitchen_id: 'ChIJE-GP3-Kjj0cRzAv0WviwcsY',
    menu_id: 'food',
    order_number: 'R-104',
  },
})

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingRoomServicePage',
})

useSeoMeta({
  title: 'Room Service Ordering · Misebox',
  description:
    'Misebox room service ordering for hotels, guest rooms, serviced apartments, and private room delivery.',
})
</script>
