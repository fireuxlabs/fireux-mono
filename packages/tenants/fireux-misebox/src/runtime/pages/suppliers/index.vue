<!-- FILE: packages/tenants/fireux-misebox/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader
      title="Suppliers"
      description="Inspect your supplier profile and browse suppliers resolved for this runtime."
    />

    <UPageBody class="space-y-6">
      <template v-if="hasProfile">
        <OrganismsProfilesSupplierSectionsSingle
          :core-profile="coreProfile"
          :app-profile="appProfile"
          :pill="pill"
        />
      </template>

      <UPageCTA
        v-else
        title="Create your supplier profile"
        description="Introduce your products to chefs and venues across the FireUX network."
        variant="naked"
        :links="supplierCtaLinks"
      />

      <OrganismsProfilesSupplierSectionsGlobalCollection />
      <OrganismsProfilesSupplierSectionsLocalCollection v-if="isTenant" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useSupplier } from '../../composables/firestore/profiles/Supplier/useSupplier.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import OrganismsProfilesSupplierSectionsSingle from '../../components/organisms/profiles/Supplier/Sections/Single.vue'
import OrganismsProfilesSupplierSectionsGlobalCollection from '../../components/organisms/profiles/Supplier/Sections/GlobalCollection.vue'
import OrganismsProfilesSupplierSectionsLocalCollection from '../../components/organisms/profiles/Supplier/Sections/LocalCollection.vue'

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

const { coreProfile, appProfile, pill } = useSupplier()
const supplierCtaLinks = [
  {
    label: 'Get started',
    color: 'neutral',
    to: '/dashboard/supplier-profile',
  },
  {
    label: 'Learn more',
    color: 'neutral',
    variant: 'subtle',
    trailingIcon: 'i-lucide-arrow-right',
    to: '/suppliers/learn-more',
  },
]
const hasProfile = computed(() => Boolean(coreProfile.value))
const { isTenant } = useFireUXConfig()

useHead({ title: 'Suppliers' })
</script>
