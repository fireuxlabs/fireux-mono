<!-- packages/tenants/fireux-misebox/src/runtime/pages/dashboard/supplier-profile.vue -->
<template>
  <LayoutsDashboardEditStructure
    title="Supplier Profile"
    description="Share your supplier details with the Misebox marketplace."
    :hero="hero"
    :dev-data="supplierRecord"
  >
    <UPageCard
      v-if="currentSupplierProfileCard && supplierRecord"
      variant="subtle"
    >
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <OrganismsProfilesSupplierCardsPill
              v-if="currentSupplierPill"
              :supplier="currentSupplierPill"
            />
            <OrganismsProfilesSupplierCardsCell
              v-if="currentSupplierCell"
              :supplier="currentSupplierCell"
            />
          </div>

          <OrganismsProfilesSupplierCardsProfile
            :supplier="currentSupplierProfileCard"
          />
        </div>

        <MiseProfilesSupplierEdit :supplier="supplierRecord" />
      </div>
    </UPageCard>

    <UCard v-else>
      <div class="empty-state">
        <UIcon name="i-lucide-package" class="empty-icon" />
        <h3 class="empty-title">Introduce your supplier brand</h3>
        <p class="empty-copy">
          Create a supplier profile so teams can discover your offerings in
          Misebox.
        </p>
        <UButton color="primary" :loading="creating" @click="onEnsure">
          Create Supplier Profile
        </UButton>
      </div>
    </UCard>
  </LayoutsDashboardEditStructure>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { computed } from 'vue'
import type { Supplier } from '../../models/profiles/Supplier.model'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier'
import { useSupplierComputed } from '../../composables/firestore/profiles/Supplier/main/useSupplierComputed'
import { useSupplierInterface } from '../../composables/firestore/profiles/Supplier/main/useSupplierInterface'
import { useSupplierCreate } from '../../composables/firestore/profiles/Supplier/main/useSupplierCreate'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-supplier-profile',
    label: 'Supplier Profile',
    icon: 'i-lucide-package',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: 'supplier',
  },
  requiresAuth: true,
})

const { profile } = useSupplier()
const { coreProfile, appProfile, activeProfile } = useSupplierComputed(profile)
const { pillProps, cellProps, profileProps } = useSupplierInterface(profile)
const { createSupplier } = useSupplierCreate()

const currentSupplier = activeProfile
const currentSupplierPill = computed(() =>
  currentSupplier.value ? pillProps(currentSupplier.value) : null
)
const currentSupplierCell = computed(() =>
  currentSupplier.value ? cellProps(currentSupplier.value) : null
)
const currentSupplierProfileCard = computed(() =>
  currentSupplier.value ? profileProps(currentSupplier.value) : null
)

const supplierRecord = computed<Supplier | null>(() => {
  const active = currentSupplier.value
  if (!active) return null
  const displayName =
    active.display_name ?? active.title ?? active.subtitle ?? 'Supplier'
  return {
    id: active.id,
    display_name: displayName,
    avatar: active.avatar ?? active.avatar_url ?? undefined,
    core: coreProfile.value,
    app: (appProfile.value as any) ?? null,
  }
})

const hero = computed(() => {
  const cell = currentSupplierCell.value
  if (!cell) return null
  const pill = currentSupplierPill.value
  return {
    pillComponent: pill ? 'OrganismsProfilesSupplierCardsPill' : undefined,
    pillProps: pill ? { supplier: pill } : null,
    pillClass: null,
    cellComponent: 'OrganismsProfilesSupplierCardsCell',
    cellProps: { supplier: cell },
  }
})

const creating = createSupplier.state
const onEnsure = async () => {
  await createSupplier()
}
</script>

<style scoped>
.empty-state {
  display: grid;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  text-align: center;
  justify-items: center;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  color: var(--ui-text-300, rgba(148, 163, 184, 0.9));
}

.empty-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.empty-copy {
  margin: 0;
  color: var(--ui-text-500, rgba(100, 116, 139, 0.95));
  max-width: 26rem;
}
</style>
