<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <UAlert
        v-if="pending"
        color="neutral"
        variant="soft"
        title="Loading supplier"
        description="Fetching this supplier."
      />

      <UAlert
        v-else-if="!supplierRecord"
        color="warning"
        variant="soft"
        title="Supplier not found"
        description="This supplier is not available."
      />

      <template v-else>
        <SupplierCardsProfile v-if="supplierCard" :card="supplierCard" />

        <EntityOperatorPanel
          entity-label="Supplier"
          :aligned="operatorAlignedBadges"
          :not-aligned="operatorNotAlignedBadges"
        />

        <DevJson
          v-if="isDev"
          :title="'Supplier (JSON)'"
          context="Supplier detail page · suppliers/[id] · supplier doc"
          :data="supplierRecord"
          :default-open="false"
        />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { useSupplierFetch } from '../../composables/fireux/firestore/supplier/fetch/useSupplierFetch'
import { useSupplierSeo } from '../../composables/fireux/firestore/supplier/utils/useSupplierSeo'
import { useSupplierInterface } from '../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const route = useRoute()
const docId = computed(() => {
  const raw = route.params.id
  return Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim()
})

const { supplier: supplierRecord, pending } = useSupplierFetch(docId)
const { profile: supplierToProfile } = useSupplierInterface()
const supplierCard = computed(() => supplierToProfile(supplierRecord.value))

const displayName = computed(() =>
  supplierCard.value?.title || docId.value || null
)
const pageTitle = computed(() => displayName.value ?? 'Supplier')
const pageDescription = computed(() =>
  displayName.value
    ? `Review the public supplier record for ${displayName.value}.`
    : 'Public supplier record.'
)
const operatorAlignedBadges = ['Identity']
const operatorNotAlignedBadges = ['Item', 'Catalogue', 'Ingredient']
const isDev = import.meta.dev

useSupplierSeo(supplierRecord)
</script>
