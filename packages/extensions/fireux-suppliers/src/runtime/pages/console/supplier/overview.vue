<template>
  <UDashboardPanel id="console-supplier-overview">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <UAlert
          v-if="!runtime.id"
          color="neutral"
          variant="soft"
          title="No supplier selected"
          description="Select a supplier on /console/supplier before opening the supplier overview."
          :actions="[
            {
              label: 'Go to suppliers',
              to: '/console/supplier',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <div class="flex flex-wrap items-center gap-3">
            <SupplierCardsPill
              v-if="activeSupplierPill"
              v-bind="activeSupplierPill"
              :link="false"
              :show-badges="false"
            />
            <UBadge color="neutral" variant="soft" size="lg">
              {{ modeLabel }} Mode
            </UBadge>
          </div>

          <ConsoleSupplierOverviewDemo v-if="runtimeMode === 'demo'" />
          <ConsoleSupplierOverviewReal v-else-if="runtimeMode === 'live'" />
          <ConsoleSupplierOverviewTest v-else />

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Workspace Actions</div>
            </template>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="activeSupplierPill?.to"
                :to="activeSupplierPill.to"
                color="neutral"
                variant="soft"
                icon="i-lucide-external-link"
              >
                Open public supplier
              </UButton>
              <UButton
                to="/console/supplier"
                color="neutral"
                variant="ghost"
                icon="i-lucide-refresh-cw"
              >
                Switch supplier
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
import { useSupplierConsole } from '../../../composables/fireux/app/supplier-console/useSupplierConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-overview',
    label: 'Overview',
    icon: 'i-lucide-house',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const { runtime, console: consoleState, activeSupplierPill } = useSupplierConsole({
  publishHeader: true,
})
const runtimeMode = consoleState.mode

const modeLabel = computed(() => {
  if (runtimeMode.value === 'live') return 'Real'
  if (runtimeMode.value === 'test') return 'Test'
  return 'Demo'
})
</script>
