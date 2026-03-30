<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Bringli Supplier Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          <template v-if="isOperatorOverview">
            Scope:
            <span class="font-medium">{{ scopeLabel }}</span>
            <template v-if="activeSupplier">
              · Active supplier:
              <span class="font-mono">{{ activeSupplier.id }}</span>
            </template>
          </template>
          <template v-else>
            Mode: <span class="font-medium">{{ runtime.mode }}</span>
            · Supplier: <span class="font-mono">{{ runtime.id }}</span>
          </template>
        </div>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">{{ isOperatorOverview ? scopeLabel : singleOverviewTitle }}</div>
          </template>

          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="item in overview"
              :key="item.key"
              class="rounded border border-default p-3"
            >
              <div class="text-xs text-dimmed">{{ item.label }}</div>
              <div class="text-lg font-semibold">{{ item.count }}</div>
            </div>
          </div>
        </UCard>

        <UCard v-if="isOperatorOverview">
          <template #header>
            <div class="text-sm font-semibold">{{ targetListTitle }}</div>
          </template>

          <div class="space-y-3">
            <div v-if="availableSupplierPills.length" class="space-y-2">
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

            <p class="text-sm text-dimmed">{{ selectionHelp }}</p>

            <UAlert
              v-if="!hasActiveSupplier"
              color="neutral"
              variant="soft"
              :title="selectionTitle"
              :description="selectionDescription"
            />
            <UAlert
              v-else-if="activeSupplierPill"
              color="primary"
              variant="soft"
              :title="activeSelectionTitle"
              :description="`${activeSupplierPill.title}${activeSupplierPill.subtitle ? ` · ${activeSupplierPill.subtitle}` : ''}`"
            />
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Quick actions</div>
          </template>

          <UAlert
            v-if="isOperatorOverview && !hasActiveSupplier"
            color="neutral"
            variant="soft"
            :title="quickActionsTitle"
            :description="quickActionsDescription"
          />

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="link in actionLinks"
              :key="link.key"
              :to="link.to"
              variant="soft"
              :icon="link.icon"
              block
            >
              {{ link.label }}
            </UButton>
          </div>
        </UCard>

        <DevJson
          v-if="isDev"
          title="Supplier Runtime (JSON)"
          context="projects/bringli/bringli-app · /console/supplier/overview"
          :data="runtimeSnapshot"
          :default-open="false"
        />
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConsoleOverviewEntry } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewEntry'
import { useConsoleOverviewLabels } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewLabels'
import { useRuntimeSupplierConsole } from 'fireux-suppliers/runtime/composables/fireux/app/supplier-console/useRuntimeSupplierConsole'
import SupplierCardsPill from 'fireux-suppliers/runtime/components/organisms/Supplier/Cards/Pill.vue'

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
  overview,
  stats,
  actions,
  ownedSuppliers,
  ownedSupplierPills,
  readOnlyScenarios,
  readOnlySupplierPills,
  activeSupplier,
  activeSupplierPill,
  hasActiveSupplier,
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
  quickActionsTitle,
  quickActionsDescription,
  singleOverviewTitle,
} = useConsoleOverviewLabels({
  singular: 'supplier',
  plural: 'suppliers',
  isReadOnly: computed(() => runtime.isReadOnly.value),
})

const isDev = import.meta.dev
const actionLinks = computed(() => [
  {
    key: 'workspace',
    to: actions.openWorkspaceTo,
    icon: 'i-lucide-layout-dashboard',
    label: 'Supplier workspace',
  },
  {
    key: 'browse',
    to: actions.browseSuppliersTo,
    icon: 'i-lucide-truck',
    label: 'Browse suppliers',
  },
])
const availableSupplierPills = computed(() =>
  runtime.isReadOnly.value ? readOnlySupplierPills.value : ownedSupplierPills.value
)

const { ensureOverviewEntry } = useConsoleOverviewEntry({
  runtimeId: runtime.id,
  mode: computed(() => runtime.mode.value),
  ownershipPending,
  liveCount: computed(() => ownedSuppliers.value.length),
  readOnlyCount: computed(() => readOnlyScenarios.value.length),
  singleLiveId: computed(() => String((ownedSuppliers.value[0] as any)?.id || '')),
  singleReadOnlyId: computed(() => String(readOnlyScenarios.value[0]?.id || '')),
  setActiveTarget: setActiveOwnedSupplier,
  createPath: '/console/supplier/create',
  overviewPath: '/console/supplier/overview',
})

await ensureOverviewEntry()

const selectSupplier = (supplierId: string) => {
  setActiveOwnedSupplier(supplierId)
}

const runtimeSnapshot = computed(() => ({
  id: runtime.id.value,
  mode: runtime.mode.value,
  isReadOnly: runtime.isReadOnly.value,
  documentCollectionPath: runtime.documentCollectionPath.value,
  collectionPath: runtime.collectionPath.value,
  pending: runtime.pending.value,
  isLoading: runtime.isLoading.value,
  isReady: runtime.isReady.value,
  doc: runtime.doc.value,
  data: runtime.data.value,
  stats: stats.value,
  overview: overview.value,
  actionLinks: actionLinks.value,
  ownedSuppliers: ownedSuppliers.value,
  readOnlyScenarios: readOnlyScenarios.value,
  isOperatorOverview: isOperatorOverview.value,
  hasActiveSupplier: hasActiveSupplier.value,
}))
</script>
