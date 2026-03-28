<!-- FILE: packages/extensions/fireux-suppliers/src/runtime/pages/dashboard/supplier/manage.vue -->
<template>
  <UDashboardPanel id="console-supplier-manage">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle">
        <template #right>
          <UButton
            :icon="viewIcon"
            size="sm"
            variant="ghost"
            color="neutral"
            :aria-pressed="view === 'profile'"
            @click="toggleView"
          />
        </template>
      </LayoutsConsoleNavbar>
    </template>

    <template #body>
      <div class="supplier-console">
        <div class="supplier-console__pills">
          <SupplierCardsPill
            v-if="supplierCard"
            v-bind="supplierCard"
            :link="Boolean(supplierCard.to)"
            class="block"
          />
        </div>

        <UPageCard v-if="isSupplierLoading" variant="subtle">
          <p class="text-sm text-dimmed">Loading supplier…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!resolvedCoreSupplier"
          title="Supplier not available"
          description="Your supplier record hasn’t been created yet."
          variant="subtle"
        >
          <UButton
            :label="supplierCreateCta"
            color="neutral"
            :loading="isCreating"
            @click="createSupplier"
          />

          <p v-if="createError" class="mt-3 text-sm text-dimmed">
            {{ createError }}
          </p>
        </UPageCard>

        <ClientOnly v-else>
          <div v-if="view === 'profile'" class="supplier-console__section">
            <SupplierCardsProfile
              v-if="supplierCard"
              :card="supplierCard"
            />
          </div>

          <div v-else class="supplier-console__section">
            <SupplierEditCore
              :supplier="resolvedCoreSupplier"
            />

            <SupplierEditApp
              v-if="resolvedAppSupplier"
              :supplier="resolvedAppSupplier"
            />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useConsoleProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleProfileView'
import { computed, ref } from 'vue'
import { useSupplier } from '../../../composables/fireux/firestore/supplier/useSupplier'
import { useSupplierEnsure } from '../../../composables/fireux/firestore/supplier/mutations/useSupplierEnsure'

const supplierCreateCta = 'Create your supplier workspace record to appear in listings.'
const supplierNavIcon = 'i-lucide-package'
const navTitle = 'Manage Supplier'

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-suppliers'] },
    key: 'console-supplier-manage',
    label: 'Manage supplier',
    icon: supplierNavIcon,
    desktop: false,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})

const { coreSupplier, appSupplier, interface: supplierCardFromProfile } = useSupplier()

const { ensure } = useSupplierEnsure()
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createSupplier = async () => {
  if (isCreating.value) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure()
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create supplier record.'
  } finally {
    isCreating.value = false
  }
}

const isSupplierLoading = computed(() => coreSupplier.value === undefined)
const resolvedCoreSupplier = computed(() => coreSupplier.value ?? null)
const resolvedAppSupplier = computed(() => appSupplier.value ?? null)
const supplierCard = computed(() => supplierCardFromProfile(resolvedCoreSupplier.value))

const { view, viewIcon, toggleView } = useConsoleProfileView()
</script>
