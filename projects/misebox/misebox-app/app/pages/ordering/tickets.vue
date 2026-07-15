<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-7xl space-y-8">
      <div class="flex flex-wrap gap-2">
        <UButton
          to="/ordering"
          color="neutral"
          variant="soft"
          icon="i-lucide-arrow-left"
        >
          Ordering
        </UButton>

        <UButton
          to="/console/kitchen/orders"
          color="neutral"
          variant="ghost"
          icon="i-lucide-chef-hat"
        >
          Kitchen orders
        </UButton>
      </div>

      <section class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div class="space-y-3">
          <p class="m-0 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Kitchen destination
          </p>
          <h1 class="m-0 text-4xl font-black tracking-tight text-highlighted sm:text-5xl">
            Automatically accepted tickets
          </h1>
          <p class="m-0 max-w-3xl text-base leading-7 text-muted">
            These customer orders skip the kitchen acceptance step. They are
            created as accepted orders and go directly to Queue.
          </p>
        </div>

        <div class="rounded-lg border border-primary/30 bg-default p-4 shadow-sm">
          <p class="m-0 text-xs font-bold uppercase tracking-[0.18em] text-muted">
            Intake contract
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-highlighted">
            <UBadge color="neutral" variant="soft">
              Customer submits
            </UBadge>
            <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
            <UBadge color="neutral" variant="soft" class="font-mono">
              status: accepted
            </UBadge>
            <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
            <UBadge color="primary" variant="soft">
              Queue
            </UBadge>
          </div>
          <p class="mb-0 mt-3 text-xs leading-5 text-muted">
            No Accept or Reject decision is required at intake. The kitchen still
            prepares and completes the ticket afterwards.
          </p>
        </div>
      </section>

      <section class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="ticket in automaticTickets"
          :key="ticket.order.id"
          class="flex flex-col gap-4 rounded-lg border border-default bg-default p-5 shadow-sm"
        >
          <header class="space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="m-0 text-xs font-bold uppercase tracking-[0.16em] text-muted">
                  {{ ticket.surface }} · {{ ticket.kitchen }}
                </p>
                <h2 class="m-0 mt-1 text-xl font-black text-highlighted">
                  {{ ticket.title }}
                </h2>
              </div>

              <UBadge color="success" variant="soft">
                {{ boardStageLabel(ticket.order) }}
              </UBadge>
            </div>

            <p class="m-0 min-h-12 text-sm leading-6 text-muted">
              {{ ticket.description }}
            </p>

            <div class="flex flex-wrap gap-1.5">
              <UBadge
                v-for="origin in ticket.origins"
                :key="origin"
                color="neutral"
                variant="subtle"
                class="font-mono"
              >
                {{ origin }}
              </UBadge>
              <UBadge color="neutral" variant="subtle" class="font-mono">
                {{ ticket.order.order_type }}
              </UBadge>
              <UBadge color="neutral" variant="subtle">
                {{ ticket.handoff }}
              </UBadge>
            </div>
          </header>

          <div class="flex flex-1 justify-center">
            <ConsoleKitchenOperationsOrdersCardsTicket :order="ticket.order" />
          </div>

          <p class="m-0 flex items-center gap-2 text-xs font-semibold text-success">
            <UIcon name="i-lucide-circle-check" class="size-4 shrink-0" />
            No separate acceptance required
          </p>
        </article>
      </section>

      <section class="rounded-lg border border-default bg-elevated/70 p-5">
        <h2 class="m-0 text-base font-black text-highlighted">
          Deliberately not included yet
        </h2>
        <p class="mb-0 mt-2 text-sm leading-6 text-muted">
          Collection, delivery, pre-order and room service begin in Incoming
          because the kitchen must accept them. Staff POS is shown as an origin
          above, but it does not need duplicate tickets because its resulting
          dine-in, eat-in and takeaway shapes are the same. Prep Yard currently
          has no menu or dishes, so this page does not invent an order for it.
        </p>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import {
  deriveKitchenOrderBoardStage,
  KitchenOrderModel,
  resolveKitchenOrderIntakeStatus,
  type KitchenOrder,
} from 'fireux-kitchens/runtime/models/kitchen/order.model'

type AutomaticOrderType = 'dine_in' | 'eat_in' | 'takeaway'

type AutomaticTicket = {
  description: string
  handoff: string
  kitchen: string
  order: KitchenOrder
  origins: string[]
  surface: string
  title: string
}

const automaticTickets = [
  {
    surface: 'Table QR',
    kitchen: 'Garden Room',
    title: 'Dine in',
    description:
      'The guest is already seated, so the table number travels with the order.',
    handoff: 'table service',
    origins: ['table_qr', 'staff_pos'],
    order: {
      ...KitchenOrderModel,
      id: 'ticket-table-12',
      kitchen_id: 'garden-room',
      menu_id: 'garden-room-main',
      order_number: 'T-012',
      status: automaticStatus('dine_in'),
      order_type: 'dine_in',
      channel: 'table_qr',
      table: {
        number: '12',
      },
      fulfilment_match: {
        type: 'table',
        reference: '12',
        handoff: 'table_service',
      },
      items: [
        {
          id: 'table-garden-tartine',
          dish_id: 'garden-tartine',
          label: 'Garden Tartine',
          quantity: 1,
          checked: false,
        },
        {
          id: 'table-herb-chicken-supper',
          dish_id: 'herb-chicken-supper',
          label: 'Herb Chicken Supper',
          quantity: 2,
          checked: false,
        },
      ],
      payment: {
        required: false,
        status: 'not_required',
        currency_code: 'CHF',
      },
    },
  },
  {
    surface: 'Kiosk',
    kitchen: 'Garden Room',
    title: 'Eat in',
    description:
      'The kiosk gives the kitchen a counter reference and prepares the order for a tray.',
    handoff: 'tray',
    origins: ['kiosk', 'staff_pos'],
    order: {
      ...KitchenOrderModel,
      id: 'ticket-kiosk-eat-in',
      kitchen_id: 'garden-room',
      menu_id: 'garden-room-main',
      order_number: 'A105',
      status: automaticStatus('eat_in'),
      order_type: 'eat_in',
      channel: 'kiosk',
      fulfilment_match: {
        type: 'counter',
        reference: 'A105',
        handoff: 'tray',
      },
      customer: {
        name: 'Amina',
      },
      items: [
        {
          id: 'eat-in-herb-chicken-supper',
          dish_id: 'herb-chicken-supper',
          label: 'Herb Chicken Supper',
          add_ons: [
            {
              id: 'extra-herb-butter',
              label: 'Extra herb butter',
            },
          ],
          quantity: 1,
          checked: false,
        },
        {
          id: 'eat-in-garden-tartine',
          dish_id: 'garden-tartine',
          label: 'Garden Tartine',
          quantity: 1,
          checked: false,
        },
      ],
      payment: {
        required: true,
        status: 'paid',
        method: 'online_card',
        amount_chf: 41,
        currency_code: 'CHF',
      },
    },
  },
  {
    surface: 'Kiosk',
    kitchen: 'Deanos',
    title: 'Takeaway',
    description:
      'The customer orders for collection at the counter, with a bag as the handoff.',
    handoff: 'bag',
    origins: ['kiosk', 'staff_pos'],
    order: {
      ...KitchenOrderModel,
      id: 'ticket-kiosk-takeaway',
      kitchen_id: 'deanos',
      menu_id: 'deanos-main',
      order_number: 'B106',
      status: automaticStatus('takeaway'),
      order_type: 'takeaway',
      channel: 'kiosk',
      fulfilment_match: {
        type: 'counter',
        reference: 'B106',
        handoff: 'bag',
      },
      customer: {
        name: 'Luca',
      },
      items: [
        {
          id: 'takeaway-deanos-classic',
          dish_id: 'deanos-classic',
          label: 'Deanos Classic',
          variant_id: 'no-pickles',
          variant_label: 'No pickles',
          quantity: 1,
          checked: false,
        },
        {
          id: 'takeaway-skin-on-fries',
          dish_id: 'skin-on-fries',
          label: 'Skin-On Fries',
          quantity: 1,
          checked: false,
        },
        {
          id: 'takeaway-garlic-herb-dip',
          dish_id: 'garlic-herb-dip',
          label: 'Garlic & Herb Dip',
          quantity: 1,
          checked: false,
        },
      ],
      payment: {
        required: true,
        status: 'paid',
        method: 'online_card',
        amount_chf: 29,
        currency_code: 'CHF',
      },
    },
  },
] satisfies AutomaticTicket[]

function automaticStatus(orderType: AutomaticOrderType) {
  return resolveKitchenOrderIntakeStatus({
    orderType,
    paymentPending: false,
  })
}

function boardStageLabel(order: KitchenOrder) {
  const stage = deriveKitchenOrderBoardStage(order)

  return stage === 'queue' ? 'Queue' : stage
}

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingTicketsPage',
})

useSeoMeta({
  title: 'Automatically Accepted Tickets · Misebox',
  description:
    'Kitchen ticket shapes that skip acceptance and go directly to the order queue.',
})
</script>
