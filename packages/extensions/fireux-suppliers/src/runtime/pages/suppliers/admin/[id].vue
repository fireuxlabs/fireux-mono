<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <div class="supplier-console">
        <div class="flex justify-end">
          <UButton
            :icon="viewIcon"
            size="sm"
            variant="ghost"
            color="neutral"
            :aria-pressed="view === 'profile'"
            @click="toggleView"
          />
        </div>

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

        <MoleculesProfilesAdminCreateCard
          v-else-if="!resolvedCoreSupplier"
          title="Supplier not available"
          description="This supplier record hasn’t been created yet."
          :button-label="supplierCreateCta"
          :loading="isCreating"
          :error="createError"
          @create="createSupplier"
        />

        <ClientOnly v-else>
          <div v-if="view === 'profile'" class="supplier-console__section">
            <SupplierCardsProfile
              v-if="supplierCard"
              :card="supplierCard"
            />
          </div>

          <div v-else class="supplier-console__section">
            <SupplierEditCore :supplier="resolvedCoreSupplier" />

            <SupplierEditApp
              v-if="resolvedAppSupplier"
              :supplier="resolvedAppSupplier"
            />
          </div>
        </ClientOnly>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useConsoleProfileView } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleProfileView'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSupplierInterface } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierEnsure } from '../../../composables/fireux/firestore/supplier/mutations/useSupplierEnsure'
import { useSupplierRecord } from '../../../composables/fireux/firestore/supplier/fetch/useSupplierRecord'

const supplierCreateCta = 'Create your supplier workspace record to appear in listings.'
definePageMeta({
  layout: 'default',
  name: 'SuppliersAdminEditPage',
  requiresAuth: true,
})

const route = useRoute()

const userId = computed(() => {
  const raw = Array.isArray(route.params.id)
    ? route.params.id[0]
    : route.params.id
  return String(raw ?? '').trim() || null
})

const userRefs = useUserFetch(userId)
const { coreSupplier, appSupplier, pending } = useSupplierRecord(userId)

const { pill: makeCard } = useSupplierInterface(
  {
    coreSupplier,
    appSupplier,
  },
  userRefs.user
)

const isSupplierLoading = computed(
  () => pending.value || coreSupplier.value === undefined
)
const resolvedCoreSupplier = computed(() => coreSupplier.value ?? null)
const resolvedAppSupplier = computed(() => appSupplier.value ?? null)
const supplierCard = computed(() => makeCard(resolvedCoreSupplier.value))
const pageTitle = computed(() =>
  supplierCard.value?.title
    ? `Admin · ${supplierCard.value.title}`
    : userId.value
      ? `Admin · Supplier · ${userId.value}`
      : 'Admin · Supplier'
)
const pageDescription = computed(
  () => 'Review the public supplier record and edit the underlying supplier documents.'
)

const { ensure } = useSupplierEnsure()
const isCreating = ref(false)
const createError = ref<string | null>(null)

const createSupplier = async () => {
  if (isCreating.value || !userId.value) return
  isCreating.value = true
  createError.value = null

  try {
    await ensure(userId.value)
  } catch (error) {
    createError.value = (error as Error)?.message || 'Failed to create supplier record.'
  } finally {
    isCreating.value = false
  }
}

const { view, viewIcon, toggleView } = useConsoleProfileView()
</script>
