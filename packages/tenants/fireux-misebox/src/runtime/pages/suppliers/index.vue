<!-- packages/tenants/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<!-- packages/tenants/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageBody class="page-index">
      <UPageHeader title="Suppliers" />

      <!-- Current Supplier -->
      <UCard class="index-card">
        <template v-if="current">
          <MoleculesPill v-bind="pillProps(current)" />
          <OrganismsProfilesSupplierCardsCell :supplier="cellProps(current)" />
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

      <!-- Supplier Collection -->
      <UCard class="index-card">
        <template v-if="items.length">
          <div class="entity-grid">
            <OrganismsProfilesSupplierCardsCell
              v-for="(p, index) in items"
              :key="p.id || 'supplier-' + index"
              :supplier="cellProps(p)"
            />
          </div>
        </template>

        <MoleculesNotFound v-else kind="collection" entity="suppliers" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import 'fireux-core/runtime/assets/styles/scss/pages/indexes.scss'
import { computed } from 'vue'
import OrganismsProfilesSupplierCardsCell from '../../components/organisms/profiles/Supplier/Cards/Cell.vue'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier.ts'
import { useSupplierComputed } from '../../composables/firestore/profiles/Supplier/main/useSupplierComputed.ts'
import { useSupplierInterface } from '../../composables/firestore/profiles/Supplier/main/useSupplierInterface.ts'
import { useSupplierCollection } from '../../composables/firestore/profiles/Supplier/main/useSupplierCollection.ts'
import { useSupplierCreate } from '../../composables/firestore/profiles/Supplier/main/useSupplierCreate.ts'

const { profile } = useSupplier()
const { activeProfile } = useSupplierComputed(profile)
const { pillProps, cellProps } = useSupplierInterface(profile)
const { suppliers } = useSupplierCollection()
const { createSupplier } = useSupplierCreate()

const current = activeProfile
const items = computed(() => suppliers.value ?? [])

const creating = createSupplier.state

const onCreate = async () => {
  await createSupplier()
}
</script>
