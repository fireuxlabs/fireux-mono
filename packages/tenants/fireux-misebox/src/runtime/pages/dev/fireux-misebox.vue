<template>
  <UPage>
    <UPageHeader
      title="Misebox Profiles"
      description="Inspect chef and supplier profiles with the same surfaces used in runtime."
    />

    <UPageBody class="space-y-10">
      <section class="space-y-4">
        <header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Chef
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Mirrors the main Chefs page and resolves data without extra
            fallbacks.
          </p>
        </header>

        <OrganismsProfilesChefSectionsSingle
          :core-profile="chefCoreProfile"
          :app-profile="chefAppProfile"
          :pill="chefPill"
        />

        <DevJsonPanel v-if="chefJson" :data="chefJson" />

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Global chefs
              </h3>
              <UBadge variant="soft">{{ chefGlobalCount }} total</UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Pulled directly from the shared chefs collection.
            </p>
          </template>

          <div
            v-if="chefGlobalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesChefCardsPill
              v-for="pill in chefGlobalPills"
              :key="chefPillKey(pill)"
              :chef="pill"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No global chefs found.
          </p>

          <template #footer>
            <DevJsonPanel v-if="chefGlobalJson.length" :data="chefGlobalJson" />
          </template>
        </UCard>

        <UCard v-if="isTenant && hasChefLocalCollection">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant chefs
              </h3>
              <UBadge variant="soft">{{ chefLocalCount }} total</UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Scoped to the active tenant application.
            </p>
          </template>

          <div
            v-if="chefLocalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesChefCardsPill
              v-for="pill in chefLocalPills"
              :key="chefPillKey(pill)"
              :chef="pill"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No tenant-scoped chefs found.
          </p>

          <template #footer>
            <DevJsonPanel v-if="chefLocalJson.length" :data="chefLocalJson" />
          </template>
        </UCard>
        <UCard v-else-if="isTenant">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant chefs
              </h3>
              <UBadge variant="soft">0 total</UBadge>
            </div>
          </template>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Tenant-overridden collection is not available in this runtime.
          </p>
        </UCard>
      </section>

      <section class="space-y-4">
        <header>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Supplier
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Reflects the active supplier profile with the same surface used in
            the app.
          </p>
        </header>

        <OrganismsProfilesSupplierSectionsSingle
          :core-profile="supplierCoreProfile"
          :app-profile="supplierAppProfile"
          :pill="supplierPill"
        />

        <DevJsonPanel v-if="supplierJson" :data="supplierJson" />

        <UCard>
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Global suppliers
              </h3>
              <UBadge variant="soft">{{ supplierGlobalCount }} total</UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Suppliers available across the shared directory.
            </p>
          </template>

          <div
            v-if="supplierGlobalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesSupplierCardsPill
              v-for="pill in supplierGlobalPills"
              :key="supplierPillKey(pill)"
              :supplier="pill"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No global suppliers found.
          </p>

          <template #footer>
            <DevJsonPanel
              v-if="supplierGlobalJson.length"
              :data="supplierGlobalJson"
            />
          </template>
        </UCard>

        <UCard v-if="isTenant && hasSupplierLocalCollection">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant suppliers
              </h3>
              <UBadge variant="soft">{{ supplierLocalCount }} total</UBadge>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Supplier overrides scoped to the active tenant.
            </p>
          </template>

          <div
            v-if="supplierLocalPills.length"
            class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            <OrganismsProfilesSupplierCardsPill
              v-for="pill in supplierLocalPills"
              :key="supplierPillKey(pill)"
              :supplier="pill"
            />
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
            No tenant-scoped suppliers found.
          </p>

          <template #footer>
            <DevJsonPanel
              v-if="supplierLocalJson.length"
              :data="supplierLocalJson"
            />
          </template>
        </UCard>
        <UCard v-else-if="isTenant">
          <template #header>
            <div class="flex items-center justify-between gap-2">
              <h3
                class="text-base font-semibold text-gray-900 dark:text-gray-100"
              >
                Tenant suppliers
              </h3>
              <UBadge variant="soft">0 total</UBadge>
            </div>
          </template>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Tenant supplier collection is not available in this runtime.
          </p>
        </UCard>
      </section>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed, unref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useChef } from '../../composables/firestore/profiles/Chef/useChef.ts'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier.ts'
import { useChefCollection } from '../../composables/firestore/profiles/Chef/main/useChefCollection.ts'
import { useSupplierCollection } from '../../composables/firestore/profiles/Supplier/main/useSupplierCollection.ts'
import {
  resolveChefPill,
  resolveChefPillKey,
} from '../../composables/firestore/profiles/Chef/main/useChefInterface.ts'
import {
  resolveSupplierPill,
  resolveSupplierPillKey,
} from '../../composables/firestore/profiles/Supplier/main/useSupplierInterface.ts'
import type { ChefProfile, ChefCard } from '../../models/profiles/Chef.model.ts'
import type {
  SupplierProfile,
  SupplierCard,
} from '../../models/profiles/Supplier.model.ts'

definePageMeta({
  layout: 'dev',
  alias: ['/dev/fireux-misebox', '/dev/fireux-misebox-tennant'],
  nav: {
    key: 'dev-tenant-misebox',
    label: 'Misebox (Tenant)',
    icon: 'i-lucide-utensils-crossed',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})

const {
  coreProfile: chefCoreProfile,
  appProfile: chefAppProfile,
  pill: chefPill,
} = useChef()

const {
  coreProfile: supplierCoreProfile,
  appProfile: supplierAppProfile,
  pill: supplierPill,
} = useSupplier()

const chefJson = computed(() => {
  const core = unref(chefCoreProfile)
  const app = unref(chefAppProfile)
  if (!core && !app) return null
  return {
    coreProfile: core,
    appProfile: app,
  }
})

const supplierJson = computed(() => {
  const core = unref(supplierCoreProfile)
  const app = unref(supplierAppProfile)
  if (!core && !app) return null
  return {
    coreProfile: core,
    appProfile: app,
  }
})

const { isTenant } = useFireUXConfig()

const { globalChefs, localChefs, rawGlobalChefs, rawLocalChefs } =
  useChefCollection()

const chefGlobalPills = computed<ChefCard.Pill[]>(() =>
  (globalChefs.value ?? []).map((profile: ChefProfile) =>
    resolveChefPill(profile)
  )
)

const chefGlobalCount = computed(() => chefGlobalPills.value.length)

const chefGlobalJson = computed(() => rawGlobalChefs.value ?? [])

const hasChefLocalCollection = computed(() => Boolean(localChefs))

const chefLocalPills = computed<ChefCard.Pill[]>(() => {
  if (!localChefs) return []
  return (localChefs.value ?? []).map((profile: ChefProfile) =>
    resolveChefPill(profile)
  )
})

const chefLocalCount = computed(() => chefLocalPills.value.length)

const chefLocalJson = computed(() =>
  localChefs && rawLocalChefs ? rawLocalChefs.value ?? [] : []
)

const chefPillKey = resolveChefPillKey

const {
  globalSuppliers,
  localSuppliers,
  rawGlobalSuppliers,
  rawLocalSuppliers,
} = useSupplierCollection()

const supplierGlobalPills = computed<SupplierCard.Pill[]>(() =>
  (globalSuppliers.value ?? []).map((profile: SupplierProfile) =>
    resolveSupplierPill(profile)
  )
)

const supplierGlobalCount = computed(() => supplierGlobalPills.value.length)

const supplierGlobalJson = computed(() => rawGlobalSuppliers.value ?? [])

const hasSupplierLocalCollection = computed(() => Boolean(localSuppliers))

const supplierLocalPills = computed<SupplierCard.Pill[]>(() => {
  if (!localSuppliers) return []
  return (localSuppliers.value ?? []).map((profile: SupplierProfile) =>
    resolveSupplierPill(profile)
  )
})

const supplierLocalCount = computed(() => supplierLocalPills.value.length)

const supplierLocalJson = computed(() =>
  localSuppliers && rawLocalSuppliers ? rawLocalSuppliers.value ?? [] : []
)

const supplierPillKey = resolveSupplierPillKey
</script>
