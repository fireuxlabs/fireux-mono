<!-- packages/tenants/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<!-- packages/tenants/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Suppliers"
      description="Track your supplier profile and explore the supplier roster available to this runtime."
    />

    <UPageBody class="space-y-6">
      <!-- Current supplier profile -->
      <UCard>
        <template #header><h2>Your Supplier Profile</h2></template>

        <template v-if="current">
          <div class="space-y-4">
            <MiseProfilesSupplierCardsPill
              :supplier="pillProps(current)"
              class="max-w-md"
            />
            <OrganismsProfilesSupplierCardsCell
              :supplier="cellProps(current)"
            />
          </div>
        </template>

        <template v-else>
          <UPageCTA title="Create your Supplier profile to appear in listings.">
            <template #links>
              <UButton color="primary" :loading="creating" @click="onCreate">
                Create Supplier Profile
              </UButton>
            </template>
          </UPageCTA>
        </template>
      </UCard>

      <!-- Supplier directory -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2>Supplier Directory</h2>
            <UBadge variant="soft">{{ totalSuppliers }} total</UBadge>
          </div>
        </template>

        <div
          v-if="directoryPills.length"
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <MiseProfilesSupplierCardsPill
            v-for="pill in directoryPills"
            :key="pill.title + (pill.subtitle || '')"
            :supplier="pill"
          />
        </div>
        <p v-else class="text-sm opacity-70">
          No suppliers found in this environment.
        </p>
      </UCard>

      <!-- Raw snapshots -->
      <UCard>
        <template #header><h2>Raw Snapshots</h2></template>
        <div class="grid gap-4 text-xs md:grid-cols-2">
          <div>
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Core Profile
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{
              profile.coreProfile?.value
            }}</pre>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase opacity-60">
              App Overlay
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{
              profile.appProfile?.value
            }}</pre>
          </div>
          <div class="md:col-span-2">
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Roster (merged)
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{ roster }}</pre>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Global Store
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{ globalSuppliers }}</pre>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase opacity-60">
              Tenant Overlays
            </h3>
            <pre class="mt-2 whitespace-pre-wrap">{{ localSuppliers }}</pre>
          </div>
        </div>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier.ts'
import { useSupplierComputed } from '../../composables/firestore/profiles/Supplier/main/useSupplierComputed.ts'
import { useSupplierInterface } from '../../composables/firestore/profiles/Supplier/main/useSupplierInterface.ts'
import { useSupplierCollection } from '../../composables/firestore/profiles/Supplier/main/useSupplierCollection.ts'
import { useSupplierCreate } from '../../composables/firestore/profiles/Supplier/main/useSupplierCreate.ts'

const { profile } = useSupplier()
const { activeProfile } = useSupplierComputed(profile)
const { pillProps, cellProps } = useSupplierInterface(profile)
const { suppliers, global, local } = useSupplierCollection()
const { createSupplier } = useSupplierCreate()

const current = activeProfile

const roster = computed(() => suppliers.value ?? [])
const directoryPills = computed(() =>
  roster.value.map((entry) => pillProps(entry))
)
const totalSuppliers = computed(() => directoryPills.value.length)

const globalSuppliers = computed(() => global?.value ?? [])
const localSuppliers = computed(() => local?.value ?? [])

const creating = createSupplier.state

const onCreate = async () => {
  await createSupplier()
}
</script>
