<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsProfilesSupplierCTA />
      <OrganismsProfilesSupplierCollectionManager :cards="cards" :total="total" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { useSupplierCollection } from '../../composables/fireux/firestore/profiles/Supplier/main/useSupplierCollection'
import { useSupplier } from '../../composables/fireux/firestore/profiles/Supplier/useSupplier'
import type { SupplierCore } from '../../models/profiles/Supplier/Supplier.model'

definePageMeta({
  nav: {
    key: 'suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    order: 50,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Suppliers',
  description: 'Supplier profiles resolved for this runtime.',
  layout: 'default',
  name: 'SuppliersIndexPage',
})

const pageTitle = 'Suppliers'
const pageDescription =
  'Inspect your supplier profile and browse suppliers resolved for this runtime.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { globalSuppliers, localSuppliers } = useSupplierCollection()
const { card: makeCard } = useSupplier()

const cards = computed(() => {
  const globalCards = (globalSuppliers.value ?? [])
    .map((entry) => makeCard(entry as SupplierCore, (entry as any)?.user ?? null))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  const localCards = (localSuppliers.value ?? [])
    .map((entry) => makeCard(entry as SupplierCore, (entry as any)?.user ?? null))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
  return [...localCards, ...globalCards]
})

const total = computed(() => cards.value.length)
</script>
