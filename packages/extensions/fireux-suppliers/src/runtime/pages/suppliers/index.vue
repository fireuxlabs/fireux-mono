<!-- FILE: packages/extensions/fireux-suppliers/src/runtime/pages/suppliers/index.vue -->
<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <SupplierCTA />

      <UCard v-if="pending">
        <p>Loading suppliers…</p>
      </UCard>

      <SupplierCollectionManager
        v-else
        :collection="suppliers"
        :source-mode="sourceMode"
        :show-source-toggle="true"
        @update:source-mode="sourceMode = $event"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { ref } from 'vue'
import {
  useSupplierCollection,
  type SupplierCollectionSource,
} from '../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'

definePageMeta({
  tag: 'suppliers',
  nav: {
    key: 'suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    order: 50,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Suppliers',
  description: 'Browse supplier records.',
  layout: 'default',
  name: 'SuppliersIndexPage',
})

const pageTitle = 'Suppliers'
const pageDescription =
  'Choose a supplier surface for this runtime.'
const sourceMode = ref<SupplierCollectionSource>('live')

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

const { suppliers, pending } = useSupplierCollection({
  source: sourceMode,
})

</script>
