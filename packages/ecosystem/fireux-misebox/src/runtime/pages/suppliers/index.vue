<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="space-y-6">
      <OrganismsProfileSectionsSingle :title="currentProfileTitle">
        <template v-if="hasProfile">
          <OrganismsProfilesSupplierCardsCell v-if="cell" :supplier="cell" />
          <OrganismsProfilesSupplierCardsPill v-if="pill" :supplier="pill" />
        </template>
        <OrganismsProfilesSupplierCTA v-else />
      </OrganismsProfileSectionsSingle>

      <OrganismsProfilesSupplierSectionsGlobalCollection />
      <OrganismsProfilesSupplierSectionsLocalCollection v-if="isTenant" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

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

const { pill, cell } = useSupplier()
const { isTenant } = useFireUXConfig()
const { hasProfile: userHasProfile } = useUser()
const hasProfile = computed(() => userHasProfile('supplier'))

const pageTitle = 'Suppliers'
const pageDescription =
  'Inspect your supplier profile and browse suppliers resolved for this runtime.'
const currentProfileTitle = 'Your supplier profile'

useHead({ title: pageTitle })
</script>
