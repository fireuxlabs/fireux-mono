<!-- Concurrent edit — 2026-07-19 17:02 CEST — Delivery pass: route enabled surfaces to focused configuration. -->
<template>
  <div>
    <UCard v-if="menu">
      <template #header>
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">
              Ordering surfaces
            </h2>
            <p class="text-sm text-dimmed">
              Enable each customer doorway, then open its focused settings when available.
            </p>
          </div>

          <UBadge :color="orderingEnabled ? 'success' : 'neutral'" variant="soft">
            {{ orderingEnabled ? 'Ordering on' : 'Ordering off' }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-4">
        <UAlert
          color="neutral"
          variant="soft"
          icon="i-lucide-book-open"
          title="Browse is the base Menu"
          description="Ordering types add customer doorways to the published Menu. Browse is always separate."
        />

        <div class="grid gap-3 md:grid-cols-2">
          <ConsoleKitchenOperationsMenusOrderingSurface
            v-for="surface in menuOrderSurfaceOptions"
            :key="surface.key"
            :surface="surface"
            :menu-id="menuId"
            :disabled="!canWrite"
            :enabled-types="enabledTypes"
            @toggle="setOrderType"
          />
        </div>
      </div>
    </UCard>

    <MoleculesStateCard
      v-else-if="pending"
      entity="Menu ordering"
      kind="document"
      loading
    />

    <UAlert
      v-else
      color="warning"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Menu ordering unavailable"
      description="This Menu was not found for the currently selected Kitchen."
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useKitchenConsoleMenuOrdering } from '../../../../../composables/console/operations/Menus/useKitchenConsoleMenuOrdering'
import { menuOrderSurfaceOptions } from '../../../../../../menu/utils/menu-console-ordering-surfaces'

const {
  canWrite,
  menu,
  menuId,
  orderingEnabled,
  orderTypeConfigs,
  pending,
  setOrderType,
} = useKitchenConsoleMenuOrdering()
const enabledTypes = computed(() =>
  orderTypeConfigs.value.map(config => config.type)
)
</script>
