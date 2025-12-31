<template>
  <UPage>
    <UPageHeader
      title="Misebox Profiles"
      description="Inspect chef and supplier profiles with the same surfaces used in runtime."
    />

    <UPageBody class="space-y-10">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-3">
            <div class="flex flex-col gap-1">
              <h2 class="text-base font-semibold">Images</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Preview common assets (core/ecosystem/app) in the running
                runtime.
              </p>
            </div>
            <UButton
              size="sm"
              to="/dev/images"
              icon="i-lucide-arrow-up-right"
            >
              Open images
            </UButton>
          </div>
        </template>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="space-y-2">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
              Ecosystem
            </p>
            <div class="flex items-center gap-3">
              <img
                class="h-10 w-10 rounded-lg border"
                src="/img/ecosystem/logo.png"
                alt="Ecosystem logo"
              />
              <img
                class="h-10 w-10 rounded-lg border"
                src="/img/ecosystem/avatar.png"
                alt="Ecosystem avatar"
              />
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
              App
            </p>
            <div class="flex items-center gap-3">
              <img
                class="h-10 w-10 rounded-lg border"
                src="/img/app/logo.png"
                alt="App logo"
              />
              <img
                class="h-10 w-10 rounded-lg border"
                src="/img/app/pwa/icon-192.png"
                alt="PWA icon 192"
              />
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
              Core
            </p>
            <div class="flex items-center gap-3">
              <img
                class="h-10 w-10 rounded-lg border"
                src="/img/core/brand/logo.png"
                alt="FireUX logo"
              />
              <img
                class="h-10 w-10 rounded-lg border bg-slate-900 p-1"
                src="/img/core/auth/sign-in-light.svg"
                alt="Auth illustration"
              />
            </div>
          </div>
        </div>
      </UCard>

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

        <div v-if="chefHasProfile" class="space-y-6">
          <UCard>
            <template #header>
              <h2>Chef profile</h2>
            </template>

            <div class="space-y-4">
              <OrganismsProfilesChefCardsCell v-if="chefCard" :chef="chefCard" />
              <OrganismsProfilesChefCardsPill v-if="chefCard" :chef="chefCard" />
            </div>
          </UCard>
        </div>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          No chef profile loaded.
        </p>

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
              v-for="card in chefGlobalPills"
              :key="chefPillKey(card)"
              :chef="card"
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
              v-for="card in chefLocalPills"
              :key="chefPillKey(card)"
              :chef="card"
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

        <div v-if="supplierHasProfile" class="space-y-6">
          <UCard>
            <template #header>
              <h2>Supplier profile</h2>
            </template>

            <div class="space-y-4">
              <OrganismsProfilesSupplierCardsCell
                v-if="supplierCard"
                :supplier="supplierCard"
              />
              <OrganismsProfilesSupplierCardsPill
                v-if="supplierCard"
                :supplier="supplierCard"
              />
            </div>
          </UCard>
        </div>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          No supplier profile loaded.
        </p>

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
              v-for="card in supplierGlobalPills"
              :key="supplierPillKey(card)"
              :supplier="card"
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
              v-for="card in supplierLocalPills"
              :key="supplierPillKey(card)"
              :supplier="card"
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
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { useChef } from '../../composables/fireux/firestore/profiles/Chef/useChef.ts'
import { useSupplier } from '../../composables/fireux/firestore/profiles/Supplier/useSupplier.ts'
import { useChefCollection } from '../../composables/fireux/firestore/profiles/Chef/main/useChefCollection.ts'
import { useSupplierCollection } from '../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection.ts'
import type { ChefCard } from '../../composables/fireux/firestore/profiles/Chef/main/useChefInterface.ts'
import type { SupplierCard } from '../../composables/fireux/firestore/profiles/Supplier/main/useSupplierInterface.ts'

definePageMeta({
  layout: 'dev',
  alias: [
    '/dev/fireux-misebox',
    '/dev/fireux-misebox-tenant',
  ],
  nav: {
    key: 'dev-tenant-misebox',
    label: 'Misebox',
    icon: 'i-lucide-utensils-crossed',
    desktop: true,
    group: 'misebox',
    layouts: ['dev'],
  },
})

const {
  coreProfile: chefCoreProfile,
  appProfile: chefAppProfile,
  card: resolveChefCard,
} = useChef()

const {
  coreProfile: supplierCoreProfile,
  appProfile: supplierAppProfile,
  card: resolveSupplierCard,
} = useSupplier()

const chefCard = computed<ChefCard.Card | null>(() => {
  const core = unref(chefCoreProfile)
  return core ? resolveChefCard(core as any) : null
})

const supplierCard = computed<SupplierCard.Card | null>(() => {
  const core = unref(supplierCoreProfile)
  return core ? resolveSupplierCard(core as any) : null
})

const chefHasProfile = computed(() => Boolean(unref(chefCoreProfile)))
const supplierHasProfile = computed(() => Boolean(unref(supplierCoreProfile)))

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

const chefGlobalPills = computed<ChefCard.Card[]>(() =>
  (globalChefs.value ?? []).map((profile) => resolveChefCard(profile as any))
)

const chefGlobalCount = computed(() => chefGlobalPills.value.length)

const chefGlobalJson = computed(() => rawGlobalChefs.value ?? [])

const hasChefLocalCollection = computed(() => Boolean(localChefs))

const chefLocalPills = computed<ChefCard.Card[]>(() => {
  if (!localChefs) return []
  return (localChefs.value ?? []).map((profile) => resolveChefCard(profile as any))
})

const chefLocalCount = computed(() => chefLocalPills.value.length)

const chefLocalJson = computed(() =>
  localChefs && rawLocalChefs ? rawLocalChefs.value ?? [] : []
)

const chefPillKey = (card: ChefCard.Card) =>
  card.id || card.to || card.title || 'chef'

const {
  globalSuppliers,
  localSuppliers,
  rawGlobalSuppliers,
  rawLocalSuppliers,
} = useSupplierCollection()

const supplierGlobalPills = computed<SupplierCard.Card[]>(() =>
  (globalSuppliers.value ?? []).map((profile) =>
    resolveSupplierCard(profile as any)
  )
)

const supplierGlobalCount = computed(() => supplierGlobalPills.value.length)

const supplierGlobalJson = computed(() => rawGlobalSuppliers.value ?? [])

const hasSupplierLocalCollection = computed(() => Boolean(localSuppliers))

const supplierLocalPills = computed<SupplierCard.Card[]>(() => {
  if (!localSuppliers) return []
  return (localSuppliers.value ?? []).map((profile) =>
    resolveSupplierCard(profile as any)
  )
})

const supplierLocalCount = computed(() => supplierLocalPills.value.length)

const supplierLocalJson = computed(() =>
  localSuppliers && rawLocalSuppliers ? rawLocalSuppliers.value ?? [] : []
)

const supplierPillKey = (card: SupplierCard.Card) =>
  card.id || card.to || card.title || 'supplier'
</script>
