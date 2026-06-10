<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading supplier…</p>
      </UPageCard>

      <UPageCard
        v-else-if="!supplierRecord"
        title="Supplier not found"
        description="This supplier is not available."
        variant="subtle"
      />

      <div v-else class="space-y-4">
        <!-- profile -->
        <SupplierCardsProfile v-if="profileCard" :card="profileCard" />

        <!-- main -->

        <!-- operator -->
        <SupplierPublicOperator />

        <!-- dev -->
        <DevJson
          :title="'Supplier (JSON)'"
          context="Supplier detail page · suppliers/[slug] · supplier doc"
          :data="supplierRecord"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { useSupplierFetch } from '../../composables/fireux/firestore/supplier/fetch/useSupplierFetch'
import { useSupplierSeo } from '../../composables/fireux/firestore/supplier/utils/useSupplierSeo'
import { useSupplierInterface } from '../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

definePageMeta({
  layout: 'default',
  title: 'Supplier',
  description: 'View a supplier.',
  name: 'SupplierDetailPage',
})

const route = useRoute()
const routeKey = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim()
})

const { supplier: supplierRecord, pending } = useSupplierFetch(routeKey, {
  key: 'slug',
})
const { profile } = useSupplierInterface()
const profileCard = computed(() => profile(supplierRecord.value))

const pageTitle = computed(() =>
  profileCard.value?.title || routeKey.value || 'Supplier'
)
const pageDescription = computed(() =>
  profileCard.value?.summary || 'Public supplier record.'
)

useSupplierSeo(supplierRecord)
</script>
