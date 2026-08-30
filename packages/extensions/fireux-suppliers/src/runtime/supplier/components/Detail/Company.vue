<template>
  <PlaceHeader v-if="place" :place="place" />
  <UCard v-else>
    <template #header>Company</template>
    {{ supplier.company_id }}
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCompanyDetail } from 'fireux-companies/runtime/place/composables/company/useCompanyDetail'
import type { Supplier } from '../../models/Supplier.model'
import { useSupplierSeo } from '../../composables/useSupplierSeo'

const props = defineProps<{ supplier: Supplier }>()
const companyId = computed(() => props.supplier.company_id)
const { place } = useCompanyDetail(companyId)
useSupplierSeo(computed(() => props.supplier), place)
</script>
