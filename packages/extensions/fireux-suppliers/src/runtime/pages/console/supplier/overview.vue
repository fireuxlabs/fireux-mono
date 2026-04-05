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

          <UCard>
            <template #header>
              <div class="text-sm font-semibold">Workspace Summary</div>
            </template>

            <div class="grid gap-3 sm:grid-cols-4">
              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Mode</div>
                <div class="text-sm font-medium">{{ modeLabel }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Source</div>
                <div class="text-sm font-medium">{{ sourceLabel }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Supplier Id</div>
                <div class="font-mono text-sm">{{ runtime.id }}</div>
              </div>

              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Is Premium</div>
                <div class="text-sm font-medium">{{ isPremium ? 'true' : 'false' }}</div>
              </div>
            </div>
          </UCard>

          <UCard v-if="showDemoPremiumPreviewToggle">
            <div class="flex items-center justify-between gap-4">
              <div class="space-y-1">
                <div class="text-sm font-semibold">Preview Premium Real Summary</div>
                <p class="text-sm text-dimmed">
                  Show what premium real supplier collection insights can look like.
                </p>
              </div>

              <USwitch v-model="showPremiumPreview" />
            </div>
          </UCard>

          <UCard v-if="showPremiumCollectionSummary">
            <template #header>
              <div class="text-sm font-semibold">Premium Collection Summary</div>
            </template>

            <div class="space-y-1">
              <div class="text-xs uppercase tracking-[0.16em] text-toned">Total Suppliers</div>
              <div class="text-sm font-medium">{{ liveSupplierCount }}</div>
            </div>
          </UCard>

          <UCard v-else-if="showDemoPremiumCollectionPreview">
            <template #header>
              <div class="text-sm font-semibold">Premium Real Preview</div>
            </template>

            <div class="space-y-3">
              <div class="space-y-1">
                <div class="text-xs uppercase tracking-[0.16em] text-toned">Total Suppliers</div>
                <div class="text-sm font-medium">{{ demoSupplierCount }}</div>
              </div>

              <p class="text-sm text-dimmed">
                Preview only. Premium real mode can surface live collection summaries like this.
              </p>
            </div>
          </UCard>

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
              <UButton to="/console/supplier" color="neutral" variant="ghost" icon="i-lucide-refresh-cw">
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
import { useState } from '#imports'
import { computed, ref, watchEffect } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { Supplier } from '../../../models/supplier/Supplier.model'
import { useRuntimeSupplierConsole } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplierConsole'
import { useRuntimeSupplier } from '../../../composables/fireux/app/supplier-console/useRuntimeSupplier'
import { useRuntimeSupplierSelection } from '../../../composables/fireux/app/supplier-console/state'
import { useSupplierCollection } from '../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'
import { useSupplierInterface } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

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

const normalizeString = (value: unknown): string => String(value || '').trim()
const stripTestSupplierSuffix = (value: unknown): string =>
  normalizeString(value).replace(/\s+test supplier$/i, '').trim()
const { scenarios } = useRuntimeSupplierConsole()
const runtime = useRuntimeSupplier()
const supplierSelection = useRuntimeSupplierSelection()
const { currentUser } = useAuth()
const { isPremium } = useUser()
const { coreSuppliers: liveSuppliers } = useSupplierCollection()
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
    avatarUrl: normalizeString(imageUrl) || pill.avatarUrl,
    title:
      supplierSelection.mode.value === 'test'
        ? normalizeString(currentUser.value?.displayName) ||
          stripTestSupplierSuffix(target?.supplier_organization_name) ||
          stripTestSupplierSuffix((target as any)?.name) ||
          'Your'
        : pill.title,
    subtitle:
      supplierSelection.mode.value === 'test'
        ? 'Test Supplier'
        : pill.subtitle,
  }
}

const activeSupplierPill = computed(() =>
  buildSupplierPill(
    runtime.supplier.value as Supplier | null,
    runtime.scenario.value?.image_url
  )
)

const modeLabel = computed(() => {
  if (supplierSelection.mode.value === 'live') return 'Real'
  if (supplierSelection.mode.value === 'test') return 'Test'
  return 'Demo'
})

const sourceLabel = computed(() => {
  if (supplierSelection.mode.value === 'live') return 'Firestore production data'
  if (supplierSelection.mode.value === 'test') return 'Firestore test data'
  return 'Curated demo scenario'
})
const showPremiumPreview = ref(false)
const demoSupplierCount = computed(() => scenarios.value.length)
const liveSupplierCount = computed(() => liveSuppliers.value.length)
const showPremiumCollectionSummary = computed(() =>
  supplierSelection.mode.value === 'live' && isPremium.value
)
const showDemoPremiumPreviewToggle = computed(() =>
  supplierSelection.mode.value === 'demo' && !isPremium.value
)
const showDemoPremiumCollectionPreview = computed(() =>
  supplierSelection.mode.value === 'demo' &&
  (isPremium.value || showPremiumPreview.value)
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
</script>
