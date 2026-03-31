<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Overview" />
    </template>

    <template #body>
      <section class="space-y-6">
        <div class="text-xs text-dimmed">
          <template v-if="isOperatorOverview">
            Scope:
            <span class="font-medium">{{ scopeLabel }}</span>
          </template>
          <template v-else>
            Mode: <span class="font-medium">{{ runtime.mode }}</span>
            <template v-if="runtime.id">
              · Active supplier:
              <span class="font-mono">{{ runtime.id }}</span>
            </template>
          </template>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">
              {{ isOperatorOverview ? targetListTitle : singleOverviewTitle }}
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-dimmed">{{ selectionHelpText }}</p>

            <div v-if="showSelector && availableSupplierPills.length" class="space-y-2">
              <SupplierCardsPill
                v-for="item in availableSupplierPills"
                :key="item.id"
                v-bind="item"
                :link="false"
                :action="true"
                :show-badges="false"
                class="cursor-pointer"
                @action="selectSupplier(item.id)"
              />
            </div>

            <UAlert
              v-if="isOperatorOverview && !hasActiveSupplier"
              color="neutral"
              variant="soft"
              :title="selectionTitle"
              :description="selectionDescription"
            />

            <UAlert
              v-else-if="activeSelectionDescription"
              color="primary"
              variant="soft"
              :title="activeSelectionTitle"
              :description="activeSelectionDescription"
            />
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleOverviewEntry } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewEntry'
import { useConsoleOverviewLabels } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewLabels'
import { useRuntimeSupplierConsole } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplierConsole'
import SupplierCardsPill from '../../../components/organisms/Supplier/Cards/Pill.vue'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-overview',
    label: 'Overview',
    icon: 'i-lucide-truck',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const {
  runtime,
  ownedSuppliers,
  ownedSupplierPills,
  readOnlyScenarios,
  readOnlySupplierPills,
  activeSupplierPill,
  hasActiveSupplier,
  canSelectMultipleLive,
  showSelector,
  isOperatorOverview,
  ownershipPending,
  setActiveOwnedSupplier,
} = useRuntimeSupplierConsole()

const {
  scopeLabel,
  targetListTitle,
  selectionTitle,
  selectionDescription,
  selectionHelp,
  activeSelectionTitle,
  singleOverviewTitle,
} = useConsoleOverviewLabels({
  singular: 'supplier',
  plural: 'suppliers',
  isReadOnly: computed(() => runtime.isReadOnly.value),
})

const availableSupplierPills = computed(() =>
  runtime.isReadOnly.value ? readOnlySupplierPills.value : ownedSupplierPills.value
)
const selectionHelpText = computed(() => {
  if (isOperatorOverview.value) return selectionHelp.value
  if (showSelector.value) {
    return 'This console is scoped to one active supplier. Switch the active supplier here any time.'
  }
  return 'This console is running as a single-supplier workspace.'
})
const activeSelectionDescription = computed(() => {
  if (activeSupplierPill.value) {
    return `${activeSupplierPill.value.title}${
      activeSupplierPill.value.subtitle ? ` · ${activeSupplierPill.value.subtitle}` : ''
    }`
  }
  return String(runtime.id.value || '').trim()
})

const { ensureOverviewEntry } = useConsoleOverviewEntry({
  runtimeId: runtime.id,
  mode: computed(() => runtime.mode.value),
  ownershipPending,
  liveCount: computed(() => ownedSuppliers.value.length),
  readOnlyCount: computed(() => readOnlyScenarios.value.length),
  singleLiveId: computed(() => String((ownedSuppliers.value[0] as any)?.id || '')),
  singleReadOnlyId: computed(() => String(readOnlyScenarios.value[0]?.id || '')),
  allowMultiLiveSelection: canSelectMultipleLive,
  setActiveTarget: setActiveOwnedSupplier,
  createPath: '/console/supplier/create',
  overviewPath: '/console/supplier/overview',
})

await ensureOverviewEntry()

const selectSupplier = (supplierId: string) => {
  setActiveOwnedSupplier(supplierId)
}
</script>
