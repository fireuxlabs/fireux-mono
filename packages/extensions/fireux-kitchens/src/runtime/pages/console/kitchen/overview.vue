<template>
  <UDashboardPanel id="console-kitchen-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before opening the kitchen overview."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <div class="flex flex-wrap items-center gap-3">
            <KitchenCardsPill
              v-if="activeKitchenPill"
              v-bind="activeKitchenPill"
              :link="false"
              :show-badges="false"
            />
            <UBadge color="neutral" variant="soft" size="lg">
              {{ modeLabel }} Mode
            </UBadge>
          </div>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Workspace Summary</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-3">
              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Mode</div>
                <div class="text-sm font-medium">{{ modeLabel }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Source</div>
                <div class="text-sm font-medium">{{ sourceLabel }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Kitchen Id</div>
                <div class="font-mono text-sm">{{ runtime.id }}</div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Kitchen Areas</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton to="/console/kitchen/menu" color="neutral" variant="soft" icon="i-lucide-book-open">
                Menu
              </UButton>
              <UButton to="/console/kitchen/recipes" color="neutral" variant="soft" icon="i-lucide-notebook-pen">
                Recipes
              </UButton>
              <UButton to="/console/kitchen/ingredients" color="neutral" variant="soft" icon="i-lucide-carrot">
                Ingredients
              </UButton>
              <UButton to="/console/kitchen/orders" color="neutral" variant="soft" icon="i-lucide-clipboard-list">
                Orders
              </UButton>
              <UButton to="/console/kitchen/team" color="neutral" variant="soft" icon="i-lucide-users">
                Team
              </UButton>
              <UButton to="/console/kitchen" color="neutral" variant="ghost" icon="i-lucide-refresh-cw">
                Switch kitchen
              </UButton>
            </div>
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useState } from '#imports'
import { computed, watchEffect } from 'vue'
import type { Kitchen } from '../../../models/kitchen.model'
import { useRuntimeKitchen } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchen'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    order: 15,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useRuntimeKitchen()
const kitchenSelection = useRuntimeKitchenSelection()
const { interface: toKitchenCard } = useKitchenInterface()

const activeKitchenPill = computed(() =>
  toKitchenCard(runtime.kitchen.value as Kitchen | null)
)

const modeLabel = computed(() => {
  if (kitchenSelection.mode.value === 'live') return 'Real'
  if (kitchenSelection.mode.value === 'test') return 'Test'
  return 'Demo'
})

const sourceLabel = computed(() => {
  if (kitchenSelection.mode.value === 'live') return 'Firestore production data'
  if (kitchenSelection.mode.value === 'test') return 'Firestore test data'
  return 'Curated demo scenario'
})

const consoleHeader = useState<{ component: string; props: Record<string, unknown> } | null>(
  'console-header-pill',
  () => null
)

watchEffect(() => {
  consoleHeader.value = activeKitchenPill.value
    ? {
        component: 'KitchenCardsPill',
        props: {
          ...activeKitchenPill.value,
          link: false,
          showBadges: false,
        },
      }
    : null
})
</script>
