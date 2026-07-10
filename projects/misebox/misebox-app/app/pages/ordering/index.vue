<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-7xl space-y-8">
      <section>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Misebox
        </p>
        <h1 class="mt-2 text-4xl font-black tracking-tight text-highlighted sm:text-5xl">
          Ordering
        </h1>
      </section>

      <section class="grid gap-3">
        <p class="m-0 text-sm font-bold uppercase tracking-[0.18em] text-muted">
          Shared order spine
        </p>

        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="prop in sharedProps"
            :key="prop"
            color="neutral"
            variant="soft"
            class="font-mono"
          >
            {{ prop }}
          </UBadge>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="surface in orderingSurfaces"
          :key="surface.title"
          :class="[
            surface.to && 'cursor-pointer transition hover:ring-primary/30',
          ]"
          :ui="{ body: 'flex h-full flex-col gap-4' }"
          :role="surface.to ? 'link' : undefined"
          :tabindex="surface.to ? 0 : undefined"
          @click="openSurface(surface)"
          @keydown.enter.prevent="openSurface(surface)"
          @keydown.space.prevent="openSurface(surface)"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="m-0 text-base font-black text-highlighted">
                  {{ surface.title }}
                </h2>

                <UBadge
                  v-if="surface.parked"
                  color="neutral"
                  variant="subtle"
                >
                  parked
                </UBadge>
              </div>
            </div>

            <UIcon
              :name="surface.icon"
              class="mt-1 size-5 shrink-0 text-primary"
            />
          </div>

          <p class="text-sm leading-5 text-muted">
            {{ surface.description }}
          </p>

          <div>
            <div class="flex flex-wrap gap-2">
              <UButton
                v-for="mode in surface.modes"
                :key="mode.orderType"
                :trailing-icon="mode.to ? 'i-lucide-arrow-right' : undefined"
                color="neutral"
                size="xs"
                :variant="mode.to ? 'soft' : 'subtle'"
                @click.stop="openMode(mode)"
              >
                {{ mode.label }}
              </UButton>
            </div>
          </div>

          <div>
            <div class="flex flex-wrap gap-1.5">
              <UBadge
                v-for="prop in surface.unsharedProps"
                :key="prop"
                color="primary"
                variant="soft"
                class="font-mono"
              >
                {{ prop }}
              </UBadge>
            </div>
          </div>
        </UCard>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
type OrderingMode = {
  label: string
  orderType: string
  to?: string
}

type OrderingSurface = {
  title: string
  description: string
  icon: string
  modes: OrderingMode[]
  parked?: boolean
  to?: string
  unsharedProps: string[]
}

const sharedProps = [
  'route.menuId',
  'route.kitchenSlug',
  'orderType',
  'basket.items[]',
  'basket.quantity',
  'allergen.checked',
  'submission.id',
  'submission.kitchen_id',
  'submission.menu_id',
  'submission.order_number',
]

const orderingSurfaces: OrderingSurface[] = [
  {
    title: 'Default menu',
    description: 'Readable menu. No funnel is attached until a surface is selected.',
    icon: 'i-lucide-book-open',
    modes: [
      {
        label: 'Browse',
        orderType: 'none',
      },
    ],
    unsharedProps: [
      'none',
    ],
  },
  {
    title: 'From home',
    description: 'Customer starts away from the venue. Delivery is biased; collection can sit beside it.',
    icon: 'i-lucide-house',
    to: '/ordering/delivery',
    modes: [
      {
        label: 'Delivery',
        orderType: 'delivery',
        to: '/ordering/delivery',
      },
      {
        label: 'Collection',
        orderType: 'collection',
        to: '/ordering/collection',
      },
    ],
    unsharedProps: [
      'delivery.ready',
      'delivery.address',
      'delivery.zone',
      'collection.mode',
      'collection.requested_for',
    ],
  },
  {
    title: 'Table QR',
    description: 'Customer is already seated. The table number is carried into the order.',
    icon: 'i-lucide-qr-code',
    to: '/ordering/dine-in',
    modes: [
      {
        label: 'Dine in',
        orderType: 'dine_in',
        to: '/ordering/dine-in',
      },
    ],
    unsharedProps: [
      'table.number',
    ],
  },
  {
    title: 'Kiosk',
    description: 'Shared in-store terminal. Eat in means tray; takeaway means bag.',
    icon: 'i-lucide-tablet',
    to: '/ordering/kiosk',
    modes: [
      {
        label: 'Eat in',
        orderType: 'eat_in',
        to: '/ordering/kiosk',
      },
      {
        label: 'Takeaway',
        orderType: 'takeaway',
        to: '/ordering/kiosk',
      },
    ],
    unsharedProps: [
      'kiosk.mode',
      'kiosk.handoff',
      'kiosk.queueArea',
      'customer.name',
      'payment_method',
    ],
  },
  {
    title: 'Pre-order',
    description: 'Timing-first request. The kitchen confirms before deposit or final preparation.',
    icon: 'i-lucide-calendar-clock',
    to: '/ordering/pre-order',
    modes: [
      {
        label: 'Pre-order',
        orderType: 'pre_order',
        to: '/ordering/pre-order',
      },
    ],
    unsharedProps: [
      'preOrder.requested_for',
      'preOrder.notice_hours',
      'preOrder.party_size',
      'operator.status',
      'payment.deposit',
    ],
  },
  {
    title: 'Room service',
    description: 'Internal delivery to a room inside a hotel, aparthotel, or venue.',
    icon: 'i-lucide-concierge-bell',
    to: '/ordering/room-service',
    modes: [
      {
        label: 'Room service',
        orderType: 'room_service',
        to: '/ordering/room-service',
      },
    ],
    unsharedProps: [
      'roomService.room',
      'customer.name',
    ],
  },
  {
    title: 'Staff POS',
    description: 'Operator enters an in-store order quickly from the menu.',
    icon: 'i-lucide-monitor',
    to: '/ordering/staff-pos',
    modes: [
      {
        label: 'Eat in',
        orderType: 'eat_in',
        to: '/ordering/staff-pos',
      },
      {
        label: 'Takeaway',
        orderType: 'takeaway',
        to: '/ordering/staff-pos',
      },
    ],
    unsharedProps: [
      'operator.id',
      'service.target',
      'payment.method',
    ],
  },
]

function openSurface(surface: OrderingSurface) {
  if (!surface.to) return

  navigateTo(surface.to)
}

function openMode(mode: OrderingMode) {
  if (!mode.to) return

  navigateTo(mode.to)
}

/*
Future ordering-adjacent ideas, held until they earn a page:
- Meal prep: /ordering/meal-prep
- Marketplace order: /ordering/marketplace-order
- Airbnb guest guide: /ordering/airbnb-guest-guide
*/

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingPage',
})

useSeoMeta({
  title: 'Ordering · Misebox',
  description:
    'Misebox ordering surfaces, order types, and unshared funnel props.',
})
</script>
