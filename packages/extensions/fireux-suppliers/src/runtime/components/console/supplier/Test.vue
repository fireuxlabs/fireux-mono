<template>
  <section class="space-y-4">
    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activeSupplierPill)"
      :has-options="testSupplierPills.length > 0"
      select-title="Select a test supplier"
      empty-title="No test suppliers"
    >
      <template #selected>
        <UAlert
          color="primary"
          variant="soft"
          :title="activeSupplierPill?.title || ''"
          :description="activeSupplierPill?.subtitle || ''"
        />
      </template>
    </ConsoleRootSelectionStatus>

    <div v-if="testSupplierPills.length" class="space-y-2">
      <SupplierCardsPill
        v-for="item in testSupplierPills"
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

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestSupplierSuffix = (value: unknown): string =>
  normalizeString(value).replace(/\s+test supplier$/i, '').trim()

const { runtime } = useRuntimeSupplierConsole()
const supplierSelection = useRuntimeSupplierSelection()
const { uid, currentUser, isAuthenticated, hasAuthState } = useAuth()
const { ensureSupplier } = useSupplierCreate({ test: true })
const { interface: toSupplierCard } = useSupplierInterface()
const { coreSuppliers: testSuppliers } = useSupplierCollection({ collectionPath: 'test-suppliers' })

type SupplierPill = NonNullable<ReturnType<typeof toSupplierCard>>

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
      normalizeString(currentUser.value?.displayName) ||
      stripTestSupplierSuffix(target?.supplier_organization_name) ||
      stripTestSupplierSuffix((target as any)?.name) ||
      'Your',
    subtitle: 'Test Supplier',
  }
}

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

const activeSupplierPill = computed(() =>
  testSupplierPills.value.find((item) => item.id === runtime.id.value) ??
  buildSupplierPill(runtime.supplier.value as Supplier | null, runtime.scenario.value?.image_url)
)

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
    [hasAuthState, isAuthenticated, uid],
    async ([authReady, authenticated, currentUid]) => {
      const resolvedUid = normalizeString(currentUid)
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
    mode: 'test',
  })
}
</script>
