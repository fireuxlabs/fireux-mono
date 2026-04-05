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

          <ConsoleKitchenOverviewDemo v-if="runtimeMode === 'demo'" />
          <ConsoleKitchenOverviewReal v-else-if="runtimeMode === 'live'" />
          <ConsoleKitchenOverviewTest v-else />

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Kitchen Areas</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton
                to="/console/kitchen/menu"
                color="neutral"
                variant="soft"
                icon="i-lucide-book-open"
              >
                Menu
              </UButton>
              <UButton
                to="/console/kitchen/recipes"
                color="neutral"
                variant="soft"
                icon="i-lucide-notebook-pen"
              >
                Recipes
              </UButton>
              <UButton
                to="/console/kitchen/ingredients"
                color="neutral"
                variant="soft"
                icon="i-lucide-carrot"
              >
                Ingredients
              </UButton>
              <UButton
                to="/console/kitchen/orders"
                color="neutral"
                variant="soft"
                icon="i-lucide-clipboard-list"
              >
                Orders
              </UButton>
              <UButton
                to="/console/kitchen/team"
                color="neutral"
                variant="soft"
                icon="i-lucide-users"
              >
                Team
              </UButton>
              <UButton
                to="/console/kitchen"
                color="neutral"
                variant="ghost"
                icon="i-lucide-refresh-cw"
              >
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
import { computed } from 'vue'
import { useRuntimeKitchenConsole } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchenConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, console, activeKitchenPill } = useRuntimeKitchenConsole({
  publishHeader: true,
})
const runtimeMode = console.mode

const modeLabel = computed(() => {
  if (runtimeMode.value === 'live') return 'Real'
  if (runtimeMode.value === 'test') return 'Test'
  return 'Demo'
})
</script>
