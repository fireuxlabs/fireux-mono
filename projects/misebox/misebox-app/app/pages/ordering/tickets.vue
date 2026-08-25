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
          to="/workspace/kitchen/orders"
          color="neutral"
          variant="ghost"
          icon="i-lucide-chef-hat"
        >
          Kitchen orders
        </UButton>
      </div>

      <section class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
        <div class="space-y-3">
          <p class="fx-type-headline m-0">
            Kitchen destination
          </p>
          <h1 class="fx-type-page-title m-0 text-4xl font-black tracking-tight sm:text-5xl">
            Kitchen execution tickets
          </h1>
          <p class="m-0 max-w-3xl text-base leading-7 text-muted">
            Automatic orders start in Queue, then the same stored status moves
            every ticket through Pass and Recent.
          </p>
        </div>

        <div class="rounded-lg border border-primary/30 bg-default p-4 shadow-sm">
          <p class="fx-type-label m-0">
            Execution contract
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-sm font-bold text-highlighted">
            <UBadge color="primary" variant="soft">
              Queue
            </UBadge>
            <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
            <UBadge color="neutral" variant="soft" class="font-mono">
              mark_ready
            </UBadge>
            <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
            <UBadge color="primary" variant="soft">
              Pass
            </UBadge>
            <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
            <UBadge color="neutral" variant="soft" class="font-mono">
              complete
            </UBadge>
            <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
            <UBadge color="primary" variant="soft">
              Recent
            </UBadge>
          </div>
          <p class="mb-0 mt-3 text-xs leading-5 text-muted">
            Queue, Pass, and Recent are derived views. The order stores only its
            canonical lifecycle status.
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
                <p class="fx-type-label m-0">
                  {{ ticket.surface }} · {{ ticket.kitchen }}
                </p>
                <h2 class="m-0 mt-1 text-xl font-black text-highlighted">
                  {{ ticket.title }}
                </h2>
              </div>

              <UBadge color="primary" variant="soft">
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
            <WorkspaceKitchenOrdersTicketPresentation :order="ticket.order" />
          </div>

          <p class="m-0 flex items-center gap-2 text-xs font-semibold text-primary">
            <UIcon :name="boardStageIcon(ticket.order)" class="size-4 shrink-0" />
            {{ boardStageCopy(ticket.order) }}
          </p>
        </article>
      </section>

      <section class="rounded-lg border border-default bg-default p-5 shadow-sm">
        <h2 class="m-0 text-base font-black text-highlighted">
          An ordering choice resolves before a ticket exists
        </h2>
        <p class="mb-0 mt-2 text-sm leading-6 text-muted">
          Browse creates no order. Home options only groups Delivery and
          Collection; each has its own surface and canonical order type.
        </p>

        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="entry in surfaceResolutions"
            :key="entry.surface"
            class="rounded-md border border-default bg-muted/40 p-3"
          >
            <p class="m-0 text-sm font-bold text-highlighted">
              {{ entry.surface }}
            </p>
            <UBadge color="neutral" variant="soft" class="mt-2 font-mono">
              {{ entry.result }}
            </UBadge>
            <p class="mb-0 mt-2 text-xs leading-5 text-muted">
              {{ entry.description }}
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-lg border border-default bg-elevated/70 p-5">
        <h2 class="m-0 text-base font-black text-highlighted">
          Incoming remains the intake gate
        </h2>
        <p class="mb-0 mt-2 text-sm leading-6 text-muted">
          Collection, delivery, pre-order and room service begin in Incoming
          because the kitchen must accept them. Once accepted, they join this
          same Queue to Pass to Recent loop. No second lifecycle is created for
          those order types or for Staff POS.
        </p>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import {
  deriveKitchenOrderBoardStage,
  KitchenOrderDefaults,
  resolveKitchenOrderIntakeStatus,
  type KitchenOrder,
} from 'fireux-kitchens/runtime/kitchen/utils/order'

type AutomaticTicket = {
  description: string
  handoff: string
  kitchen: string
  order: KitchenOrder
  origins: string[]
  surface: string
  title: string
}

const surfaceResolutions = [
  {
    surface: 'Browse',
    result: 'no KitchenOrder',
    description: 'The published menu remains readable without starting a funnel.',
  },
  {
    surface: 'Home options',
    result: 'delivery | collection',
    description: 'A grouping of two separate surfaces; Home is not submitted or routed.',
  },
  {
    surface: 'Kiosk',
    result: 'eat_in | takeaway',
    description: 'One kiosk surface sets the preparation, handoff, and tax flag.',
  },
  {
    surface: 'Pre-order',
    result: 'pre_order',
    description: 'The timing-first surface submits its own canonical order type.',
  },
  {
    surface: 'Room service',
    result: 'room_service',
    description: 'The room destination travels with the room-service ticket.',
  },
] as const

const { data: productDemo } = await useMiseboxProductDemo()
const deanosTakeawayTicket = productDemo.value?.workspace.orders.find(
  (order: KitchenOrder) =>
    order.order_type === 'takeaway' && order.status === 'ready'
)
if (!deanosTakeawayTicket) {
  throw new Error('The Deanos Demo takeaway ticket is unavailable.')
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
      ...KitchenOrderDefaults,
      id: 'ticket-table-12',
      kitchen_id: 'garden-room',
      menu_id: 'garden-room-main',
      order_number: 'T-012',
      status: resolveKitchenOrderIntakeStatus({
        orderType: 'dine_in',
        paymentPending: false,
      }),
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
      ...KitchenOrderDefaults,
      id: 'ticket-kiosk-eat-in',
      kitchen_id: 'garden-room',
      menu_id: 'garden-room-main',
      order_number: 'A105',
      status: 'ready',
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
    order: deanosTakeawayTicket,
  },
] satisfies AutomaticTicket[]

function boardStageLabel(order: KitchenOrder) {
  const stage = deriveKitchenOrderBoardStage(order)

  if (stage === 'queue') return 'Queue'
  if (stage === 'pass') return 'Pass'
  if (stage === 'recent') return 'Recent'

  return stage
}

function boardStageCopy(order: KitchenOrder) {
  const stage = deriveKitchenOrderBoardStage(order)
  if (stage === 'queue') return 'Accepted. The kitchen owns preparation.'
  if (stage === 'pass') return 'Ready for the fulfilment handoff.'
  if (stage === 'recent') return 'Handoff complete.'

  return 'Outside the execution loop.'
}

function boardStageIcon(order: KitchenOrder) {
  const stage = deriveKitchenOrderBoardStage(order)
  if (stage === 'queue') return 'i-lucide-list-ordered'
  if (stage === 'pass') return 'i-lucide-bell-ring'

  return 'i-lucide-circle-check'
}

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingTicketsPage',
})

useSeoMeta({
  title: 'Kitchen Execution Tickets · Misebox',
  description:
    'Kitchen tickets moving through the canonical Queue, Pass, and Recent execution loop.',
})
</script>
