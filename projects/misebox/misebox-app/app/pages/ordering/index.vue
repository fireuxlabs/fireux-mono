<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-6xl space-y-8">
      <section class="space-y-4">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Misebox ordering
        </p>
        <h1 class="max-w-3xl text-4xl font-black tracking-tight text-highlighted sm:text-5xl">
          Ordering
        </h1>
      </section>

      <section class="space-y-4">
        <div class="space-y-2">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Where customers order from
          </p>
          <h2 class="max-w-3xl text-3xl font-black tracking-tight text-highlighted">
            Menus shaped around the guest's situation.
          </h2>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <UCard
            v-for="place in customerPlaces"
            :key="place.context"
            :ui="{ body: 'flex h-full flex-col gap-4' }"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-2">
                <UBadge color="primary" variant="soft">
                  {{ place.number }}
                </UBadge>
                <h3 class="text-2xl font-black tracking-tight text-highlighted">
                  {{ place.title }}
                </h3>
              </div>
              <UIcon
                :name="place.icon"
                class="size-6 text-primary"
              />
            </div>

            <p class="text-sm text-muted">
              {{ place.description }}
            </p>

            <div class="grid gap-2 text-sm">
              <p>
                <span class="font-bold text-highlighted">Starts on:</span>
                <span class="text-muted">{{ place.defaultSystem }}</span>
              </p>
              <p>
                <span class="font-bold text-highlighted">Can offer:</span>
                <span class="text-muted">{{ place.visibleSystems }}</span>
              </p>
            </div>
          </UCard>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-3">
        <UCard
          v-for="surface in surfaceStack"
          :key="surface.title"
          :ui="{ body: 'space-y-3' }"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-2">
              <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                {{ surface.family }}
              </p>
              <h2 class="text-xl font-black tracking-tight text-highlighted">
                {{ surface.title }}
              </h2>
            </div>
            <UIcon
              :name="surface.icon"
              class="size-6 text-primary"
            />
          </div>

          <p class="text-sm text-muted">
            {{ surface.description }}
          </p>
          <code class="block rounded-md bg-muted px-3 py-2 text-xs font-bold text-highlighted">
            {{ surface.path }}
          </code>
        </UCard>
      </section>

      <section class="space-y-4">
        <div class="space-y-2">
          <p class="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Menu context surfaces
          </p>
          <h2 class="text-3xl font-black tracking-tight text-highlighted">
            One menu, different guest situations.
          </h2>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <UCard
            v-for="context in menuContexts"
            :key="context.context"
            :ui="{ body: 'flex h-full flex-col gap-4' }"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <UBadge color="primary" variant="soft">
                    {{ context.badge }}
                  </UBadge>
                  <UBadge color="neutral" variant="soft">
                    {{ context.locked ? 'locked' : 'switchable' }}
                  </UBadge>
                </div>
                <h3 class="text-xl font-black tracking-tight text-highlighted">
                  {{ context.title }}
                </h3>
              </div>
              <UIcon
                :name="context.icon"
                class="size-6 text-primary"
              />
            </div>

            <p class="text-sm text-muted">
              {{ context.description }}
            </p>

            <dl class="grid gap-3 text-sm">
              <div class="grid gap-1">
                <dt class="font-bold text-highlighted">
                  Route
                </dt>
                <dd>
                  <code class="rounded-md bg-muted px-2 py-1 text-xs font-bold text-highlighted">
                    {{ context.routePattern }}
                  </code>
                </dd>
              </div>
              <div class="grid gap-1">
                <dt class="font-bold text-highlighted">
                  Visible systems
                </dt>
                <dd class="text-muted">
                  {{ context.visibleSystems }}
                </dd>
              </div>
              <div class="grid gap-1">
                <dt class="font-bold text-highlighted">
                  Starts on
                </dt>
                <dd class="text-muted">
                  {{ context.defaultSystem }}
                </dd>
              </div>
            </dl>

            <UButton
              :to="context.to"
              color="neutral"
              variant="soft"
              trailing-icon="i-lucide-arrow-right"
              class="mt-auto justify-center"
            >
              Open sample
            </UButton>
          </UCard>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <UCard :ui="{ body: 'space-y-4' }">
          <div class="space-y-2">
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Decision stack
            </p>
            <h2 class="text-2xl font-black tracking-tight text-highlighted">
              What decides what
            </h2>
          </div>
          <ol class="grid gap-3 text-sm text-muted">
            <li
              v-for="decision in decisionStack"
              :key="decision.title"
              class="rounded-lg border border-default bg-default/60 p-3"
            >
              <p class="font-bold text-highlighted">
                {{ decision.title }}
              </p>
              <p>{{ decision.description }}</p>
            </li>
          </ol>
        </UCard>

        <UCard :ui="{ body: 'space-y-4' }">
          <div class="space-y-2">
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Funnel systems
            </p>
            <h2 class="text-2xl font-black tracking-tight text-highlighted">
              Order flows we expose
            </h2>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <NuxtLink
              v-for="system in orderingSystems"
              :key="system.to"
              :to="system.to"
              class="rounded-lg border border-default bg-default/60 p-3 transition hover:border-primary/40 hover:bg-default"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                    {{ system.family }}
                  </p>
                  <h3 class="font-black text-highlighted">
                    {{ system.title }}
                  </h3>
                </div>
                <UIcon
                  :name="system.icon"
                  class="size-5 text-muted"
                />
              </div>
              <p class="mt-2 text-sm text-muted">
                {{ system.description }}
              </p>
            </NuxtLink>
          </div>
        </UCard>
      </section>

      <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <UCard
          v-for="example in routeExamples"
          :key="example.to"
          :ui="{ body: 'space-y-3' }"
        >
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {{ example.family }}
          </p>
          <h2 class="text-xl font-bold text-highlighted">
            {{ example.title }}
          </h2>
          <p class="text-sm text-muted">
            {{ example.description }}
          </p>
          <code class="block rounded-md bg-muted px-3 py-2 text-xs font-bold text-highlighted">
            {{ example.path }}
          </code>
          <UButton
            :to="example.to"
            color="neutral"
            variant="ghost"
            trailing-icon="i-lucide-arrow-right"
          >
            Open
          </UButton>
        </UCard>
      </section>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  menuContextProfile,
  type MenuContextProfile,
} from 'fireux-kitchens/runtime/utils/menu-context'
import type { MenuRouteContext } from 'fireux-kitchens/runtime/models/kitchen/menu/menu-context.model'
import { menuOrderTypeLabel } from 'fireux-kitchens/runtime/utils/menu-ordering-ui'

const sampleMenuId = 'pizza-snacks-drinks'
const sampleKitchenSlug = 'baeren-ringgenberg'

type MenuContextSurface = {
  badge: string
  context: MenuRouteContext
  description: string
  icon: string
  routePattern: string
  title: string
}

const surfaceStack = [
  {
    description: 'Customer-facing menu route. It manifests the menu, theme, ordering policy, and optional route context.',
    family: 'Customer',
    icon: 'i-lucide-qr-code',
    path: '/menus/{menuId}[.{context}]',
    title: 'Root menu',
  },
  {
    description: 'Customer-facing menu route when the kitchen is already known from a directory or venue page.',
    family: 'Customer',
    icon: 'i-lucide-store',
    path: '/kitchens/{kitchenSlug}/menus/{menuId}[.{context}]',
    title: 'Kitchen menu',
  },
  {
    description: 'Operator surface. It enables order types and edits the menu; it does not choose the guest context.',
    family: 'Console',
    icon: 'i-lucide-sliders-horizontal',
    path: '/console/kitchen/menus/{menuId}',
    title: 'Menu editor',
  },
]

const menuContextSource: MenuContextSurface[] = [
  {
    badge: 'home',
    context: 'from_home',
    description: 'Remote guests usually want delivery first, with collection as the secondary switch.',
    icon: 'i-lucide-house',
    routePattern: '/menus/{menuId}.from_home',
    title: '1. From home',
  },
  {
    badge: 'venue',
    context: 'in_store',
    description: 'Guests already inside the venue can order for dine-in service without delivery or collection choices.',
    icon: 'i-lucide-store',
    routePattern: '/menus/{menuId}.in_store',
    title: '2. In store',
  },
  {
    badge: 'table',
    context: 'from_table',
    description: 'Table QR links are dine-in only and can later carry a table number into the order.',
    icon: 'i-lucide-utensils',
    routePattern: '/menus/{menuId}.from_table',
    title: '3. At the table',
  },
  {
    badge: 'kiosk',
    context: 'kiosk',
    description: 'Kiosk guests choose eat in or take away, then wait in the queue until their order is called.',
    icon: 'i-lucide-panel-top',
    routePattern: '/menus/{menuId}.kiosk',
    title: '4. At a kiosk',
  },
  {
    badge: 'room',
    context: 'from_room',
    description: 'Hotel room links start in room service and hide unrelated restaurant choices.',
    icon: 'i-lucide-bed',
    routePattern: '/menus/{menuId}.from_room',
    title: '5. From a room',
  },
  {
    badge: 'default',
    context: 'generic',
    description: 'Open the full menu surface. Guests can choose from every enabled order type.',
    icon: 'i-lucide-list-tree',
    routePattern: '/menus/{menuId}',
    title: 'General menu',
  },
  {
    badge: 'system',
    context: 'delivery',
    description: 'Single-system links go straight into one ordering system.',
    icon: 'i-lucide-bike',
    routePattern: '/menus/{menuId}.delivery',
    title: 'Delivery only',
  },
  {
    badge: 'system',
    context: 'collection',
    description: 'Collection-only links are useful for remote pickup campaigns or pickup QR codes.',
    icon: 'i-lucide-shopping-bag',
    routePattern: '/menus/{menuId}.collection',
    title: 'Collection only',
  },
  {
    badge: 'system',
    context: 'pre_order',
    description: 'Pre-order links focus guests on scheduled orders without the normal service choices.',
    icon: 'i-lucide-calendar-clock',
    routePattern: '/menus/{menuId}.pre_order',
    title: 'Pre-order only',
  },
  {
    badge: 'system',
    context: 'room_service',
    description: 'Room-service system links are the explicit room service version of a room context.',
    icon: 'i-lucide-bed',
    routePattern: '/menus/{menuId}.room_service',
    title: 'Room service only',
  },
]

const systemLabels = (profile: MenuContextProfile) =>
  profile.visibleOrderTypes.map((type) => menuOrderTypeLabel(type)).join(', ')

const sampleContextPath = (context: MenuRouteContext) =>
  context === 'generic'
    ? `/menus/${sampleMenuId}`
    : `/menus/${sampleMenuId}.${context}`

const kitchenSampleContextPath = (context: MenuRouteContext) =>
  context === 'generic'
    ? `/kitchens/${sampleKitchenSlug}/menus/${sampleMenuId}`
    : `/kitchens/${sampleKitchenSlug}/menus/${sampleMenuId}.${context}`

const menuContexts = computed(() =>
  menuContextSource.map((surface) => {
    const profile = menuContextProfile(surface.context)

    return {
      ...surface,
      defaultSystem: profile.defaultOrderType
        ? menuOrderTypeLabel(profile.defaultOrderType)
        : 'Menu',
      locked: profile.locked,
      to: sampleContextPath(surface.context),
      visibleSystems: systemLabels(profile),
    }
  })
)

const customerPlaces = computed(() =>
  menuContextSource.slice(0, 5).map((surface, index) => {
    const profile = menuContextProfile(surface.context)

    return {
      ...surface,
      defaultSystem: profile.defaultOrderType
        ? menuOrderTypeLabel(profile.defaultOrderType)
        : 'Menu',
      number: `${index + 1}.`,
      visibleSystems: systemLabels(profile),
    }
  })
)

const decisionStack = [
  {
    description: 'The kitchen menu stores enabled order types such as dine-in, take-away, collection, delivery, pre-order, and room service.',
    title: 'Menu ordering config',
  },
  {
    description: 'The route suffix, such as .from_home or .kiosk, chooses the guest situation and the default system.',
    title: 'Menu route context',
  },
  {
    description: 'The funnel renders the basket, allergy check, handoff details, payment, and confirmation for the selected order type.',
    title: 'Order funnel',
  },
]

const orderingSystems = [
  {
    description: 'Basket, allergy check, delivery zone, kitchen timing, driver tender, payment.',
    family: 'Delivery',
    icon: 'i-lucide-bike',
    title: 'Delivery',
    to: '/ordering/delivery',
  },
  {
    description: 'Basket, allergy check, schedule, kitchen acceptance, deposit or payment.',
    family: 'Scheduled',
    icon: 'i-lucide-calendar-clock',
    title: 'Pre-order',
    to: '/ordering/pre-order',
  },
  {
    description: 'Basket, allergy check, pickup rendezvous, kitchen timing, payment.',
    family: 'Pickup',
    icon: 'i-lucide-shopping-bag',
    title: 'Collection',
    to: '/ordering/collection',
  },
  {
    description: 'Basket, allergy check, table context, send to kitchen, tab or payment.',
    family: 'On-premise',
    icon: 'i-lucide-utensils',
    title: 'Dine-in',
    to: '/ordering/dine-in',
  },
  {
    description: 'Kiosk queue ordering where guests choose eat in or a bag and wait for their number.',
    family: 'Queue',
    icon: 'i-lucide-receipt-text',
    title: 'Take away',
    to: '/ordering/take-away',
  },
  {
    description: 'Basket, allergy check, room destination, kitchen timing, room charge or payment.',
    family: 'Hotel',
    icon: 'i-lucide-bed',
    title: 'Room service',
    to: '/ordering/room-service',
  },
  {
    description: 'Basket or package, event details, quote review, deposit, confirmation.',
    family: 'Scheduled',
    icon: 'i-lucide-party-popper',
    title: 'Catering',
    to: '/ordering/catering',
  },
  {
    description: 'Recurring meals, prep bundles, diet notes, delivery or pickup scheduling.',
    family: 'Recurring',
    icon: 'i-lucide-package-check',
    title: 'Meal prep',
    to: '/ordering/meal-prep',
  },
  {
    description: 'Misebox-style external channel ordering with kitchen and driver coordination.',
    family: 'Marketplace',
    icon: 'i-lucide-store',
    title: 'Marketplace order',
    to: '/ordering/marketplace-order',
  },
  {
    description: 'Bueno Host-style guest guide with local food offers and private chef options.',
    family: 'Guest stay',
    icon: 'i-lucide-house-plus',
    title: 'Airbnb guest guide',
    to: '/ordering/airbnb-guest-guide',
  },
]

const routeExamples = [
  {
    description: 'The same sample menu in its general customer surface.',
    family: 'Root menu',
    path: `/menus/${sampleMenuId}`,
    title: 'General sample',
    to: sampleContextPath('generic'),
  },
  {
    description: 'The same sample menu with delivery-first from-home context.',
    family: 'Root menu',
    path: `/menus/${sampleMenuId}.from_home`,
    title: 'From-home sample',
    to: sampleContextPath('from_home'),
  },
  {
    description: 'The same sample menu through the explicit kitchen menu route.',
    family: 'Kitchen menu',
    path: `/kitchens/${sampleKitchenSlug}/menus/${sampleMenuId}.from_home`,
    title: 'Kitchen-scoped sample',
    to: kitchenSampleContextPath('from_home'),
  },
]

definePageMeta({
  layout: 'landing',
  name: 'MiseboxOrderingPage',
})

useSeoMeta({
  title: 'Ordering Surfaces · Misebox',
  description:
    'See how Misebox menu surfaces, ordering contexts, and customer funnels fit together.',
})
</script>
