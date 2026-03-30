<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Console" />
    </template>

    <template #body>
      <section class="space-y-8">
        <div class="text-xs text-dimmed">
          <template v-if="isOperatorOverview">
            Scope:
            <span class="font-medium">
              {{ runtime.isReadOnly ? 'All read-only suppliers' : 'All owned suppliers' }}
            </span>
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

        <UAlert color="primary" variant="soft" title="Hello world" />

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">
              {{ isOperatorOverview ? 'All owned suppliers' : 'Supplier runtime' }}
            </div>
          </template>

          <div
            v-if="isOperatorOverview"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <div
              v-for="item in overview"
              :key="item.key"
              class="rounded border border-default p-3"
            >
              <div class="text-xs text-dimmed">{{ item.label }}</div>
              <div class="text-lg font-semibold">{{ item.count }}</div>
            </div>
          </div>

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Supplier ID</div>
              <div class="text-lg font-semibold">{{ runtime.id || 'unset' }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Root Path</div>
              <div class="text-sm font-mono break-all">{{ runtime.documentCollectionPath }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Console Path</div>
              <div class="text-sm font-mono break-all">{{ runtime.collectionPath }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Status</div>
              <div class="text-lg font-semibold">{{ stats.pending ? 'Loading' : 'Ready' }}</div>
            </div>
          </div>
        </UCard>

        <UCard v-if="isOperatorOverview">
          <template #header>
            <div class="text-sm font-semibold">
              {{ runtime.isReadOnly ? 'Read-only suppliers' : 'Owned suppliers' }}
            </div>
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

            <p class="text-sm text-dimmed">
              Overview totals above include all {{ runtime.isReadOnly ? 'read-only' : 'owned' }} suppliers. Select one here when you want the supplier workspace to focus on a specific supplier.
            </p>

            <UAlert
              v-if="!hasActiveSupplier"
              color="neutral"
              variant="soft"
              title="Select a supplier for workspace routes"
              :description="`Choose one ${runtime.isReadOnly ? 'read-only' : 'owned'} supplier above before opening deeper supplier routes.`"
            />
            <UAlert
              v-else-if="activeSupplierPill"
              color="primary"
              variant="soft"
              title="Active supplier selected"
              :description="`${activeSupplierPill.title}${activeSupplierPill.subtitle ? ` · ${activeSupplierPill.subtitle}` : ''}`"
            />
          </div>
        </UCard>

        <UCard v-else>
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Root supplier</div>
              <div class="text-lg font-semibold">{{ stats.hasRootSupplier ? 'yes' : 'no' }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">App console</div>
              <div class="text-lg font-semibold">{{ stats.hasAppConsole ? 'yes' : 'no' }}</div>
            </div>
            <div class="rounded border border-default p-3">
              <div class="text-xs text-dimmed">Known suppliers</div>
              <div class="text-lg font-semibold">{{ stats.suppliers }}</div>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <div class="text-sm font-semibold">Actions</div>
          </template>

          <UAlert
            v-if="isOperatorOverview && !hasActiveSupplier"
            color="neutral"
            variant="soft"
            title="Pick an active supplier first"
            :description="`The overview is showing all ${runtime.isReadOnly ? 'read-only' : 'owned'} suppliers. Select one above to enable the supplier workspace.`"
          />

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton :to="actions.openWorkspaceTo" variant="soft" icon="i-lucide-layout-dashboard" block>
              Supplier workspace
            </UButton>
            <UButton :to="actions.browseSuppliersTo" variant="soft" icon="i-lucide-truck" block>
              Browse suppliers
            </UButton>
          </div>
        </UCard>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { computed } from 'vue'
import { useConsoleOverviewEntry } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleOverviewEntry'
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
</script>
