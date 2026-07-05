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

      <section class="grid gap-4 lg:grid-cols-3">
        <UCard
          v-for="surface in orderingSurfaces"
          :key="surface.context"
          :ui="{ body: 'flex h-full flex-col gap-4' }"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <UBadge color="primary" variant="soft">
                {{ surface.number }}
              </UBadge>
              <h2 class="mt-3 text-2xl font-black tracking-tight text-highlighted">
                {{ surface.title }}
              </h2>
            </div>
            <UIcon
              :name="surface.icon"
              class="size-6 text-primary"
            />
          </div>

          <dl class="grid gap-3 text-sm">
            <div class="grid gap-1">
              <dt class="font-bold text-highlighted">
                Modes
              </dt>
              <dd class="text-muted">
                {{ surface.modes }}
              </dd>
            </div>
            <div class="grid gap-1">
              <dt class="font-bold text-highlighted">
                Bias
              </dt>
              <dd class="text-muted">
                {{ surface.bias }}
              </dd>
            </div>
            <div class="grid gap-1">
              <dt class="font-bold text-highlighted">
                Needs
              </dt>
              <dd class="text-muted">
                {{ surface.needs }}
              </dd>
            </div>
          </dl>

          <code class="block rounded-md bg-muted px-3 py-2 text-xs font-bold text-highlighted">
            {{ surface.path }}
          </code>

          <UButton
            :to="surface.to"
            color="neutral"
            variant="soft"
            trailing-icon="i-lucide-arrow-right"
            class="mt-auto justify-center"
          >
            Open sample
          </UButton>
        </UCard>
      </section>

      <section class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
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

        <UCard :ui="{ body: 'space-y-3' }">
          <p class="text-sm font-bold text-highlighted">
            Dev links
          </p>
          <div class="grid gap-2 sm:grid-cols-2">
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
import {
  menuContextProfile,
  type MenuContextProfile,
} from 'fireux-kitchens/runtime/utils/menu-context'
import { menuOrderTypeLabel } from 'fireux-kitchens/runtime/utils/menu-ordering-ui'

const sampleMenuId = 'pizza-snacks-drinks'
const sampleKitchenSlug = 'baeren-ringgenberg'

type OrderingSurfaceCard = {
  bias: string
  context: MenuRouteContext
  icon: string
  needs: string
  number: string
  title: string
}

const surfaceSource = [
  {
    bias: 'Delivery',
    context: 'home',
    icon: 'i-lucide-house',
    needs: 'address, delivery zone, collection time',
    number: '1.',
    title: 'Home Delivery',
  },
  {
    bias: 'Table service',
    context: 'table',
    icon: 'i-lucide-qr-code',
    needs: 'table number carried in the URL and order',
    number: '2.',
    title: 'Table Ordering',
  },
  {
    bias: 'Queue workflow',
    context: 'kiosk',
    icon: 'i-lucide-panel-top',
    needs: 'order number, fulfilment queue, collection area',
    number: '3.',
    title: 'Kiosk Ordering',
  },
] as const satisfies readonly OrderingSurfaceCard[]

const sampleContextPath = (context: MenuRouteContext) =>
  context === 'generic'
    ? `/menus/${sampleMenuId}`
    : `/menus/${sampleMenuId}.${context}`

const kitchenSampleContextPath = (context: MenuRouteContext) =>
  context === 'generic'
    ? `/kitchens/${sampleKitchenSlug}/menus/${sampleMenuId}`
    : `/kitchens/${sampleKitchenSlug}/menus/${sampleMenuId}.${context}`

const systemLabels = (profile: MenuContextProfile) =>
  profile.visibleOrderTypes.map((type) => menuOrderTypeLabel(type)).join(', ')

const orderingSurfaces = surfaceSource.map((surface) => {
  const profile = menuContextProfile(surface.context)

  return {
    ...surface,
    modes: systemLabels(profile),
    path: `/menus/{menuId}.${surface.context}`,
    to: sampleContextPath(surface.context),
  }
})

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
