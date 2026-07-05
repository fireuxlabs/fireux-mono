<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-6xl space-y-6">
      <section>
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Misebox
        </p>
        <h1 class="mt-2 text-4xl font-black tracking-tight text-highlighted sm:text-5xl">
          Ordering
        </h1>
      </section>

      <section class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <UCard :ui="{ body: 'flex h-full flex-col gap-4' }">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-2xl font-black tracking-tight text-highlighted">
                Home Delivery
              </h2>
            </div>
            <UIcon
              name="i-lucide-house"
              class="size-6 text-primary"
            />
          </div>

          <dl class="grid gap-3 text-sm">
            <div class="grid gap-1">
              <dt class="font-bold text-highlighted">
                Modes
              </dt>
              <dd class="flex flex-wrap gap-2">
                <UButton
                  v-for="mode in homeModes"
                  :key="mode.label"
                  :to="mode.to"
                  color="neutral"
                  variant="soft"
                  size="xs"
                >
                  {{ mode.label }}
                </UButton>
              </dd>
            </div>
          </dl>
        </UCard>

        <UCard :ui="{ body: 'flex h-full flex-col gap-4' }">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-2xl font-black tracking-tight text-highlighted">
                On Premises
              </h2>
            </div>
            <UIcon
              name="i-lucide-store"
              class="size-6 text-primary"
            />
          </div>

          <div class="grid gap-3">
            <div
              v-for="surface in premisesSurfaces"
              :key="surface.to"
              class="ordering-row"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <h3 class="font-black text-highlighted">
                    {{ surface.title }}
                  </h3>
                  <p class="text-sm text-muted">
                    {{ surface.description }}
                  </p>
                </div>
                <UIcon
                  :name="surface.icon"
                  class="size-5 text-primary"
                />
              </div>
              <div class="flex flex-wrap gap-2">
                <UButton
                  v-for="mode in surface.modes"
                  :key="mode.label"
                  :to="mode.to"
                  color="neutral"
                  variant="soft"
                  size="xs"
                >
                  {{ mode.label }}
                </UButton>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section>
        <UCard :ui="{ body: 'space-y-4' }">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-black tracking-tight text-highlighted">
              Screen stacks
            </h2>

            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="state in screenStates"
                :key="state"
                :color="screenStateUi[state].color"
                variant="soft"
              >
                {{ screenStateUi[state].label }}
              </UBadge>
            </div>
          </div>

          <div class="grid gap-3">
            <div
              v-for="funnel in funnelScreenStacks"
              :key="funnel.to"
              class="ordering-funnel"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <UButton
                  :to="funnel.to"
                  color="neutral"
                  variant="ghost"
                  trailing-icon="i-lucide-arrow-right"
                  class="px-0 text-base font-black text-highlighted"
                >
                  {{ funnel.label }}
                </UButton>

                <UBadge
                  :color="funnelSummaryColor(funnel)"
                  variant="soft"
                >
                  {{ funnelSummary(funnel) }}
                </UBadge>
              </div>

              <div class="ordering-funnel__screens">
                <UBadge
                  v-for="screen in funnel.screens"
                  :key="`${funnel.to}-${screen.label}`"
                  :color="screenStateUi[screen.state].color"
                  variant="soft"
                  class="ordering-screen-badge"
                >
                  <span>{{ screen.label }}</span>
                  <span class="ordering-screen-badge__state">
                    {{ screenStateUi[screen.state].label }}
                  </span>
                </UBadge>
              </div>
            </div>
          </div>
        </UCard>
      </section>

      <section class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <UCard :ui="{ body: 'space-y-3' }">
          <div class="flex items-start justify-between gap-4">
            <div>
              <UBadge color="neutral" variant="soft">
                Parked
              </UBadge>
              <h2 class="mt-3 text-xl font-black tracking-tight text-highlighted">
                Scheduled & Private
              </h2>
            </div>
            <UIcon
              name="i-lucide-calendar-clock"
              class="size-6 text-primary"
            />
          </div>

          <div class="grid gap-2 sm:grid-cols-2">
            <div
              v-for="system in scheduledSystems"
              :key="system.title"
              class="rounded-lg border border-default bg-default/60 p-3"
            >
              <UButton
                :to="system.to"
                color="neutral"
                variant="ghost"
                trailing-icon="i-lucide-arrow-right"
                class="justify-between px-0 font-black text-highlighted"
              >
                {{ system.title }}
              </UButton>
              <p class="mt-1 text-sm text-muted">
                {{ system.description }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard :ui="{ body: 'space-y-3' }">
          <p class="text-lg font-black text-highlighted">
            Surface decides modes. Mode decides checkout fields. Kitchen receives one normalised order.
          </p>
          <div class="grid gap-2 text-sm text-muted">
            <p>
              <span class="font-bold text-highlighted">dineIn:</span>
              served to table
            </p>
            <p>
              <span class="font-bold text-highlighted">eatIn:</span>
              customer waits and collects tray
            </p>
            <p>
              <span class="font-bold text-highlighted">takeaway:</span>
              customer waits and collects bag
            </p>
          </div>
        </UCard>
      </section>

      <section>
        <UCard :ui="{ body: 'space-y-3' }">
          <p class="text-sm font-bold text-highlighted">
            Dev links
          </p>
          <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <UButton
              v-for="link in devLinks"
              :key="link.to"
              :to="link.to"
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-arrow-right"
              class="justify-between"
            >
              {{ link.label }}
            </UButton>
          </div>
        </UCard>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import type { MenuRouteContext } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-context.model'

const sampleMenuId = 'pizza-snacks-drinks'
const sampleKitchenSlug = 'baeren-ringgenberg'

const sampleContextPath = (context: MenuRouteContext) =>
  context === 'generic'
    ? `/menus/${sampleMenuId}`
    : `/menus/${sampleMenuId}.${context}`

const kitchenSampleContextPath = (context: MenuRouteContext) =>
  context === 'generic'
    ? `/kitchens/${sampleKitchenSlug}/menus/${sampleMenuId}`
    : `/kitchens/${sampleKitchenSlug}/menus/${sampleMenuId}.${context}`

type ModeLink = {
  label: string
  to: string
}
type ScreenState = 'ready' | 'placeholder' | 'missing'
type FunnelScreen = {
  label: string
  state: ScreenState
}
type FunnelScreenStack = {
  label: string
  screens: FunnelScreen[]
  to: string
}

const homeModes: ModeLink[] = [
  {
    label: 'Delivery',
    to: '/ordering/delivery',
  },
  {
    label: 'Collection',
    to: '/ordering/collection',
  },
]

const premisesSurfaces = [
  {
    description: 'Dine-in only. Requires table number.',
    icon: 'i-lucide-qr-code',
    modes: [
      {
        label: 'Dine-in',
        to: '/ordering/dine-in',
      },
    ],
    title: 'Table Ordering',
    to: sampleContextPath('table'),
  },
  {
    description: 'Eat-in and takeaway. Queue / order number.',
    icon: 'i-lucide-panel-top',
    modes: [
      {
        label: 'Eat-in',
        to: '/ordering/take-away',
      },
      {
        label: 'Takeaway',
        to: '/ordering/take-away',
      },
    ],
    title: 'Kiosk Ordering',
    to: sampleContextPath('kiosk'),
  },
]

const scheduledSystems = [
  {
    title: 'Pre-order',
    description: 'Scheduled orders for later service.',
    to: '/ordering/pre-order',
  },
  {
    title: 'Room service',
    description: 'Private-room service for hotels and venues.',
    to: '/ordering/room-service',
  },
]

const screenStates: ScreenState[] = [
  'ready',
  'placeholder',
  'missing',
]
const screenStateUi: Record<ScreenState, {
  color: 'success' | 'warning' | 'error'
  label: string
}> = {
  ready: {
    color: 'success',
    label: 'Ready',
  },
  placeholder: {
    color: 'warning',
    label: 'Placeholder',
  },
  missing: {
    color: 'error',
    label: 'Missing',
  },
}
const funnelScreenStacks: FunnelScreenStack[] = [
  {
    label: 'Delivery',
    screens: [
      { label: 'Basket', state: 'ready' },
      { label: 'Allergy check', state: 'ready' },
      { label: 'Delivery address', state: 'ready' },
      { label: 'Delivery zone', state: 'ready' },
      { label: 'Kitchen and driver timing', state: 'ready' },
      { label: 'Payment', state: 'placeholder' },
      { label: 'Confirmation', state: 'placeholder' },
    ],
    to: '/ordering/delivery',
  },
  {
    label: 'Collection',
    screens: [
      { label: 'Basket', state: 'ready' },
      { label: 'Allergy check', state: 'ready' },
      { label: 'Queue or scheduled time', state: 'ready' },
      { label: 'Kitchen request', state: 'ready' },
      { label: 'Payment', state: 'placeholder' },
      { label: 'Confirmation', state: 'placeholder' },
    ],
    to: '/ordering/collection',
  },
  {
    label: 'Dine-in',
    screens: [
      { label: 'Basket', state: 'ready' },
      { label: 'Allergy check', state: 'ready' },
      { label: 'Table context', state: 'missing' },
      { label: 'Send to kitchen', state: 'ready' },
      { label: 'Tab or payment', state: 'placeholder' },
      { label: 'Confirmation', state: 'placeholder' },
    ],
    to: '/ordering/dine-in',
  },
  {
    label: 'Takeaway',
    screens: [
      { label: 'Basket', state: 'ready' },
      { label: 'Eat-in or takeaway', state: 'ready' },
      { label: 'Allergy check', state: 'ready' },
      { label: 'Queue number', state: 'missing' },
      { label: 'Payment', state: 'placeholder' },
      { label: 'Order called', state: 'missing' },
    ],
    to: '/ordering/take-away',
  },
  {
    label: 'Pre-order',
    screens: [
      { label: 'Basket', state: 'ready' },
      { label: 'Allergy check', state: 'ready' },
      { label: 'Requested time', state: 'missing' },
      { label: 'Kitchen approval', state: 'placeholder' },
      { label: 'Deposit or payment', state: 'missing' },
      { label: 'Confirmation', state: 'placeholder' },
    ],
    to: '/ordering/pre-order',
  },
  {
    label: 'Room service',
    screens: [
      { label: 'Basket', state: 'ready' },
      { label: 'Allergy check', state: 'ready' },
      { label: 'Room destination', state: 'missing' },
      { label: 'Guest details', state: 'missing' },
      { label: 'Room charge or payment', state: 'missing' },
      { label: 'Confirmation', state: 'placeholder' },
    ],
    to: '/ordering/room-service',
  },
  {
    label: 'Catering',
    screens: [
      { label: 'Basket or package', state: 'missing' },
      { label: 'Allergy check', state: 'missing' },
      { label: 'Event details', state: 'missing' },
      { label: 'Quote review', state: 'missing' },
      { label: 'Deposit or payment', state: 'missing' },
      { label: 'Confirmation', state: 'missing' },
    ],
    to: '/ordering/catering',
  },
]

function countScreens(funnel: FunnelScreenStack, state: ScreenState) {
  return funnel.screens.filter((screen) => screen.state === state).length
}

function funnelSummary(funnel: FunnelScreenStack) {
  const missing = countScreens(funnel, 'missing')
  const placeholders = countScreens(funnel, 'placeholder')
  const parts = [
    missing ? `${missing} missing` : '',
    placeholders ? `${placeholders} placeholder${placeholders === 1 ? '' : 's'}` : '',
  ].filter(Boolean)

  return parts.length ? parts.join(' · ') : 'Ready'
}

function funnelSummaryColor(funnel: FunnelScreenStack) {
  if (countScreens(funnel, 'missing')) return 'error'
  if (countScreens(funnel, 'placeholder')) return 'warning'

  return 'success'
}

/*
Future ordering-adjacent ideas, parked until they earn a surface:
- Meal prep: /ordering/meal-prep
- Marketplace order: /ordering/marketplace-order
- Airbnb guest guide: /ordering/airbnb-guest-guide
*/

const devLinks = [
  {
    label: 'General menu',
    to: sampleContextPath('generic'),
  },
  {
    label: 'Home Delivery',
    to: sampleContextPath('home'),
  },
  {
    label: 'Table Ordering',
    to: sampleContextPath('table'),
  },
  {
    label: 'Kiosk Ordering',
    to: sampleContextPath('kiosk'),
  },
  {
    label: 'Kitchen Home Delivery',
    to: kitchenSampleContextPath('home'),
  },
]

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingPage',
})

useSeoMeta({
  title: 'Ordering · Misebox',
  description:
    'Misebox ordering surfaces for home delivery, table ordering, and kiosk ordering workflows.',
})
</script>

<style scoped>
.ordering-row {
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg);
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}

.ordering-row:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 42%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-primary) 5%, var(--ui-bg));
  transform: translateY(-1px);
}

.ordering-funnel {
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem;
  border: 1px solid var(--ui-border);
  border-radius: 0.75rem;
  background: var(--ui-bg);
}

.ordering-funnel__screens {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ordering-screen-badge {
  gap: 0.45rem;
}

.ordering-screen-badge__state {
  opacity: 0.72;
}
</style>
