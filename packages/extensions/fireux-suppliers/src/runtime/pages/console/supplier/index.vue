<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier">
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
import { computed, ref, watch, watchEffect } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useSupplierCollection } from '../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'
import { useSupplierCreate } from '../../../composables/fireux/firestore/supplier/mutations/useSupplierCreate'
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
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const modeOptions = [
  { value: 'demo', label: 'Demo' },
  { value: 'live', label: 'Real' },
  { value: 'test', label: 'Test' },
] as const

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestSupplierSuffix = (value: unknown): string =>
  normalizeString(value).replace(/\s+test supplier$/i, '').trim()

const { runtime, scenarios } = useRuntimeSupplierConsole()
const supplierSelection = useRuntimeSupplierSelection()
const { uid, currentUser, isAuthenticated, hasAuthState } = useAuth()
const { ensureSupplier } = useSupplierCreate({ test: true })
const { interface: toSupplierCard } = useSupplierInterface()
const { coreSuppliers: liveSuppliers } = useSupplierCollection()
const { coreSuppliers: testSuppliers } = useSupplierCollection({ collectionPath: 'test-suppliers' })
const selectedMode = supplierSelection.mode

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
    avatarUrl: normalizeString(imageUrl) || pill.avatarUrl,
    title:
      selectedMode.value === 'test'
        ? normalizeString(currentUser.value?.displayName) ||
          stripTestSupplierSuffix(target?.supplier_organization_name) ||
          stripTestSupplierSuffix((target as any)?.name) ||
          'Your'
        : pill.title,
    subtitle:
      selectedMode.value === 'test'
        ? 'Test Supplier'
        : pill.subtitle,
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

const ownedTestSuppliers = computed(() => {
  const currentUid = normalizeString(uid.value)
  if (!currentUid) return []
  return testSuppliers.value.filter((entry) => normalizeString(entry?.id) === currentUid)
})

const testSupplierPills = computed(() =>
  ownedTestSuppliers.value
    .map((entry) => buildSupplierPill(entry as Supplier))
    .filter((entry): entry is SupplierPill => Boolean(entry))
)

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

const consoleHeader = useState<{ component: string; props: Record<string, unknown> } | null>(
  'console-header-pill',
  () => null
)

watchEffect(() => {
  consoleHeader.value = activeSupplierPill.value
    ? {
        component: 'SupplierCardsPill',
        props: {
          ...activeSupplierPill.value,
          link: false,
          showBadges: false,
        },
      }
    : null
})

if (import.meta.client) {
  const ensuringTestSupplier = ref(false)
  const ensuredTestSupplierUid = ref('')

  watch(
    [selectedMode, hasAuthState, isAuthenticated, uid],
    async ([mode, authReady, authenticated, currentUid]) => {
      const resolvedUid = normalizeString(currentUid)
      if (mode !== 'test') return
      if (!authReady || !authenticated || !resolvedUid) return
      if (ensuringTestSupplier.value) return
      if (ensuredTestSupplierUid.value === resolvedUid) return

      ensuringTestSupplier.value = true
      try {
        await ensureSupplier({
          mode: 'public',
          existingRootId: resolvedUid,
        })
        ensuredTestSupplierUid.value = resolvedUid
      } finally {
        ensuringTestSupplier.value = false
      }
    },
    { immediate: true }
  )
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
