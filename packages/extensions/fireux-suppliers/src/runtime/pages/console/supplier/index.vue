<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier Overview" />
    </template>

    <template #body>
      <section class="space-y-4">
        <UAlert
          v-if="activeSupplierPill"
          color="primary"
          variant="soft"
          :title="activeSupplierPill.title"
          :description="activeSupplierPill.subtitle || ''"
        />

        <UAlert
          v-else-if="showSelector"
          color="neutral"
          variant="soft"
          title="Select a demo supplier"
        />

        <UAlert
          v-else
          color="neutral"
          variant="soft"
          title="No demo suppliers"
        />

        <div v-if="showSelector" class="space-y-2">
          <SupplierCardsPill
            v-for="item in supplierPills"
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

const normalizeString = (value: unknown): string => String(value || '').trim()

const { runtime, scenarios, setActiveSupplier } = useRuntimeSupplierConsole()
const { interface: toSupplierCard } = useSupplierInterface()

type SupplierPill = NonNullable<ReturnType<typeof toSupplierCard>>

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

const supplierPills = computed(() =>
  scenarios.value
    .map((entry) => buildSupplierPill(entry.supplier as Supplier, entry.image_url))
    .filter((entry): entry is SupplierPill => Boolean(entry))
)

const activeSupplierPill = computed(() =>
  supplierPills.value.find((item) => item.id === runtime.id.value) ??
  buildSupplierPill(
    runtime.supplier.value as Supplier | null,
    runtime.scenario.value?.image_url
  )
)

const showSelector = computed(() => scenarios.value.length > 1)
const supplierHeaderPill = useState<ConsoleHeaderPill | null>(
  'console-header-pill-supplier',
  () => null
)

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
    if (scenarios.value.length !== 1) return
    const scenarioId = String(scenarios.value[0]?.id || '').trim()
    if (!scenarioId) return
    setActiveSupplier(scenarioId)
  })
}

const selectSupplier = (supplierId: string) => {
  setActiveSupplier(supplierId)
}
</script>
