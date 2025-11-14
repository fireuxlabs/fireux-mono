<!-- packages/tenants/fireux-misebox/src/runtime/pages/dashboard/supplier-profile.vue -->
<template>
  <LayoutsDashboardEditStructure
    title="Supplier Profile"
    description="Share your supplier details with the Misebox marketplace."
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
      <p class="fallback">error</p>
    </UCard>
  </LayoutsDashboardEditStructure>
</template>

<script setup lang="ts">
declare function definePageMeta(meta: any): void
import { computed } from 'vue'
import type {
  Supplier,
  SupplierProfile,
} from '../../models/profiles/Supplier.model'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier'
import { useSupplierInterface } from '../../composables/firestore/profiles/Supplier/main/useSupplierInterface'

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
const { pillProps, cellProps, profileProps } = useSupplierInterface(profile)

const coreSupplier = computed<SupplierProfile | null>(
  () =>
    (profile.coreProfile.value as SupplierProfile | null | undefined) ?? null
)
const appSupplier = computed<SupplierProfile | null>(
  () => (profile.appProfile.value as SupplierProfile | null | undefined) ?? null
)

const mergedSupplier = computed<SupplierProfile | null>(() => {
  const core = coreSupplier.value
  const overlay = appSupplier.value
  if (!core && !overlay) return null
  const merged: SupplierProfile = {} as SupplierProfile
  if (core) Object.assign(merged, core)
  if (overlay) Object.assign(merged, overlay)
  return merged
})

const hasSupplierProfile = computed(() => Boolean(mergedSupplier.value))

const currentSupplierPill = computed(() =>
  hasSupplierProfile.value ? pillProps(mergedSupplier.value ?? undefined) : null
)
const currentSupplierCell = computed(() =>
  hasSupplierProfile.value ? cellProps(mergedSupplier.value ?? undefined) : null
)
const currentSupplierProfileCard = computed(() =>
  hasSupplierProfile.value
    ? profileProps(mergedSupplier.value ?? undefined)
    : null
)

const supplierRecord = computed<Supplier | null>(() => {
  const merged = mergedSupplier.value
  if (!merged) return null
  const displayName =
    merged.display_name ?? merged.title ?? merged.subtitle ?? 'Supplier'
  return {
    id: merged.id ?? '',
    display_name: displayName,
    avatar: merged.avatar ?? merged.avatar_url ?? undefined,
    core: coreSupplier.value,
    app: appSupplier.value ?? null,
  }
})
</script>

<style scoped>
.fallback {
  margin: 0;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.875rem;
}
</style>
