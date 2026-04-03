<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Overview">
        <template #right>
          <UButton
            v-if="runtime.id"
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            @click="clearSelection"
          >
            Clear
          </UButton>
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <section class="space-y-4">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[11px] font-semibold uppercase tracking-[0.16em] text-toned">
            Mode
          </span>

          <div class="inline-flex items-center gap-1 rounded-lg border border-default bg-default/60 p-1">
            <UButton
              v-for="option in modeOptions"
              :key="option.value"
              size="xs"
              :color="selectedMode === option.value ? 'primary' : 'neutral'"
              :variant="selectedMode === option.value ? 'solid' : 'ghost'"
              :aria-pressed="selectedMode === option.value"
              @click="selectMode(option.value)"
            >
              {{ option.label }}
            </UButton>
          </div>
        </div>

        <UAlert
          v-if="activeSupplierPill"
          color="primary"
          variant="soft"
          :title="activeSupplierPill.title"
          :description="activeSupplierPill.subtitle || ''"
        />

        <UAlert
          v-else-if="availableSupplierPills.length"
          color="neutral"
          variant="soft"
          :title="selectTitle"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          :title="emptyTitle"
        />

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
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useState } from '#imports'
import { computed, onScopeDispose, watchEffect } from 'vue'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useSupplierCollection } from '../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'
import { useRuntimeSupplierSelection } from '../../../composables/fireux/app/supplier-console/state'
import { useSupplierInterface } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useRuntimeSupplierConsole } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplierConsole'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier',
    label: 'Supplier',
    icon: 'i-lucide-truck',
    order: 40,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

type ConsoleHeaderPill = {
  component: string
  props: Record<string, unknown>
}

const modeOptions = [
  { value: 'read-only', label: 'Demo' },
  { value: 'live', label: 'Real' },
  { value: 'test', label: 'Test' },
] as const

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime, scenarios } = useRuntimeSupplierConsole()
const supplierSelection = useRuntimeSupplierSelection()
const { interface: toSupplierCard } = useSupplierInterface()
const { coreSuppliers: liveSuppliers } = useSupplierCollection()
const { coreSuppliers: testSuppliers } = useSupplierCollection({ collectionPath: 'test-suppliers' })

type SupplierPill = NonNullable<ReturnType<typeof toSupplierCard>>
type ConsoleMode = (typeof modeOptions)[number]['value']

const buildSupplierPill = (
  target?: Supplier | null,
  imageUrl?: unknown
): SupplierPill | null => {
  const pill = toSupplierCard(target as Supplier | null)
  if (!pill) return null

  return {
    ...pill,
    avatarUrl: pill.avatarUrl || normalizeString(imageUrl),
  }
}

const demoSupplierPills = computed(() =>
  scenarios.value
    .map((entry) => buildSupplierPill(entry.supplier as Supplier, entry.image_url))
    .filter((entry): entry is SupplierPill => Boolean(entry))
)

const liveSupplierPills = computed(() =>
  liveSuppliers.value
    .map((entry) => buildSupplierPill(entry as Supplier))
    .filter((entry): entry is SupplierPill => Boolean(entry))
)

const testSupplierPills = computed(() =>
  testSuppliers.value
    .map((entry) => buildSupplierPill(entry as Supplier))
    .filter((entry): entry is SupplierPill => Boolean(entry))
)

const selectedMode = supplierSelection.mode
const availableSupplierPills = computed(() => {
  if (selectedMode.value === 'live') return liveSupplierPills.value
  if (selectedMode.value === 'test') return testSupplierPills.value
  return demoSupplierPills.value
})

const activeSupplierPill = computed(() =>
  availableSupplierPills.value.find((item) => item.id === runtime.id.value) ??
  buildSupplierPill(
    runtime.supplier.value as Supplier | null,
    runtime.scenario.value?.image_url
  )
)

const supplierHeaderPill = useState<ConsoleHeaderPill | null>(
  'console-header-pill-supplier',
  () => null
)
const selectTitle = computed(() => {
  if (selectedMode.value === 'live') return 'Select a real supplier'
  if (selectedMode.value === 'test') return 'Select a test supplier'
  return 'Select a demo supplier'
})
const emptyTitle = computed(() => {
  if (selectedMode.value === 'live') return 'No real suppliers'
  if (selectedMode.value === 'test') return 'No test suppliers'
  return 'No demo suppliers'
})

watchEffect(() => {
  const pill = activeSupplierPill.value

  supplierHeaderPill.value = pill
    ? {
        component: 'SupplierCardsPill',
        props: {
          ...pill,
          link: false,
          showBadges: false,
        },
      }
    : null
})

onScopeDispose(() => {
  supplierHeaderPill.value = null
})

if (import.meta.client) {
  watchEffect(() => {
    if (runtime.id.value) return
    if (availableSupplierPills.value.length !== 1) return
    selectSupplier(String(availableSupplierPills.value[0]?.id || ''))
  })
}

const selectSupplier = (supplierId: string) => {
  const resolvedId = normalizeString(supplierId)
  if (!resolvedId) return
  supplierSelection.setRuntimeSupplier({
    supplierId: resolvedId,
    mode: selectedMode.value,
  })
}

const selectMode = (mode: ConsoleMode) => {
  supplierSelection.setRuntimeSupplier({
    selectedId: '',
    mode,
  })
}

const clearSelection = () => {
  supplierSelection.setRuntimeSupplier({
    selectedId: '',
    mode: selectedMode.value,
  })
}
</script>
