<template>
  <PlaceHeader v-if="place" :place="place" />
  <UCard v-else>
    <template #header>Company</template>
    {{ supplier.company_id }}
  </UCard>
  <DevDebugPanel
    title="Supplier Company relation"
    context="Company Place fetched by Supplier Detail and the relationship key used to resolve it."
    object-origin="fetched"
    :objects="{ place }"
    :derived="{ companyId }"
    launcher
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompanyDetail } from 'fireux-companies/runtime/place/composables/company/useCompanyDetail'
import type { Supplier } from '../../models/Supplier.model'
import { useSupplierSeo } from '../../composables/useSupplierSeo'

const props = defineProps<{ supplier: Supplier }>()
const companyId = computed(() => props.supplier.company_id)
const { place } = useCompanyDetail(companyId)
useSupplierSeo(
  computed(() => props.supplier),
  place
)
</script>
