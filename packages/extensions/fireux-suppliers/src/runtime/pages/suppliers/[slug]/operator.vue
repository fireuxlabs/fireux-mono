<template>
  <EntityOperatorBridge
    entity-label="Supplier"
    :entity-title="supplierTitle"
    :public-to="publicTo"
    console-to="/console/supplier"
    :signed-in="Boolean(userId)"
    :has-authority="hasAuthority"
    :missing="!publicSupplier && !pending"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EntityOperatorBridge from 'fireux-core/runtime/components/entity/OperatorBridge.vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  useSupplierCollection,
  type SupplierCollectionFilter,
} from '../../../composables/fireux/firestore/supplier/fetch/useSupplierCollection'

definePageMeta({
  layout: 'default',
  name: 'SupplierOperatorBridgePage',
})

const route = useRoute()
const { uid } = useAuth()
const routeKey = computed(() => {
  const raw = route.params.slug
  return Array.isArray(raw) ? String(raw[0] || '').trim() : String(raw || '').trim()
})
const userId = computed(() => String(uid.value || '').trim())
const operatorFilter = computed<SupplierCollectionFilter>(() =>
  userId.value ? { operatorId: userId.value } : { ids: [] }
)
const { suppliers: publicSuppliers, pending } = useSupplierCollection()
const { suppliers: operatorSuppliers } = useSupplierCollection({
  filter: operatorFilter,
})

const publicSupplier = computed(() =>
  publicSuppliers.value.find(
    (supplier) => String(supplier.slug || '').trim() === routeKey.value
  ) ?? null
)
const supplierId = computed(() =>
  String(publicSupplier.value?.id || '').trim()
)
const hasAuthority = computed(() =>
  Boolean(
    supplierId.value &&
      operatorSuppliers.value.some((supplier) => supplier.id === supplierId.value)
  )
)
const supplierTitle = computed(() =>
  String(
      publicSupplier.value?.supplier_organization_name ||
      publicSupplier.value?.name ||
      routeKey.value ||
      'Supplier'
  ).trim()
)
const publicTo = computed(() =>
  routeKey.value ? `/suppliers/${encodeURIComponent(routeKey.value)}` : '/suppliers'
)
</script>
