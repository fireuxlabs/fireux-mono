<template>
  <main class="min-h-screen bg-muted/30 py-10">
    <UContainer class="max-w-7xl space-y-8">
      <section>
        <p class="fx-type-headline">
          Misebox
        </p>
        <h1 class="fx-type-page-title mt-2 text-4xl font-black tracking-tight sm:text-5xl">
          Ordering
        </h1>
        <p class="mb-0 mt-3 max-w-3xl text-base leading-7 text-muted">
          A menu surface decides where the customer starts. Groups only organise
          related surfaces; the selected order type is stored on the KitchenOrder.
        </p>
      </section>

      <section class="grid gap-3">
        <p class="fx-type-label m-0">
          Canonical KitchenOrder
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

      <section class="grid gap-3 border-y border-default py-5">
        <p class="fx-type-label m-0">
          Intake decision
        </p>

        <div class="grid gap-3 md:grid-cols-3">
          <div
            v-for="step in intakeSteps"
            :key="step.status"
            class="flex min-w-0 items-center justify-between gap-3 border-l-2 border-primary/40 pl-3"
          >
            <span class="text-sm font-semibold text-highlighted">
              {{ step.condition }}
            </span>
            <UBadge color="neutral" variant="soft" class="shrink-0 font-mono">
              {{ step.status }}
            </UBadge>
          </div>
        </div>
      </section>

      <BrandingServingCarton />

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
                  v-if="surface.channel"
                  color="neutral"
                  variant="subtle"
                  class="font-mono"
                >
                  {{ surface.channel }}
                </UBadge>

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

          <code
            v-if="surface.publicPath"
            class="w-fit break-all rounded-sm bg-muted px-2 py-1 text-xs font-bold text-muted"
          >
            {{ surface.publicPath }}
          </code>

          <div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="mode in surface.modes"
                :key="mode.label"
                class="flex items-center gap-1.5"
              >
                <UButton
                  :trailing-icon="mode.to ? 'i-lucide-arrow-right' : undefined"
                  color="neutral"
                  size="xs"
                  :variant="mode.to ? 'soft' : 'subtle'"
                  @click.stop="openMode(mode)"
                >
                  {{ mode.label }}
                </UButton>

                <UBadge
                  v-if="mode.orderType"
                  :color="modeInitialStatus(mode) === 'accepted' ? 'success' : 'warning'"
                  variant="soft"
                  class="font-mono"
                >
                  {{ modeInitialStatus(mode) }}
                </UBadge>

                <code
                  v-if="mode.publicPath"
                  class="break-all rounded-sm bg-muted px-1.5 py-0.5 text-xs font-bold text-muted"
                >
                  {{ mode.publicPath }}
                </code>
              </div>
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
import {
  resolveKitchenOrderIntakeStatus,
  type KitchenOrderInitialStatus,
} from 'fireux-kitchens/runtime/kitchen/models/order.model'
import {
  intakeSteps,
  orderingSurfaces,
  sharedProps,
  type OrderingMode,
  type OrderingSurface,
} from '@/content/ordering-surfaces'

function openSurface(surface: OrderingSurface) {
  if (!surface.to) return

  navigateTo(surface.to)
}

function openMode(mode: OrderingMode) {
  if (!mode.to) return

  navigateTo(mode.to)
}

function modeInitialStatus(mode: OrderingMode): KitchenOrderInitialStatus | '' {
  if (!mode.orderType) return ''

  return resolveKitchenOrderIntakeStatus({
    orderType: mode.orderType,
    paymentPending: false,
  })
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
