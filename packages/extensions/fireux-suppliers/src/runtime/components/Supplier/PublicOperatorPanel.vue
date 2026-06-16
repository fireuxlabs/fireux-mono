<template>
  <EntityOperatorPanel
    entity-label="Supplier"
    title="Supplier Operations"
    :description="panelDescription"
    :aligned="aligned"
    :not-aligned="notAligned"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SupplierSurface } from '../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const props = defineProps<{
  supplier?: SupplierSurface | null
}>()

const aligned = ['Identity', 'Item', 'Catalogue', 'Ingredient']
const notAligned: string[] = []
const supplierName = computed(() =>
  String(
    props.supplier?.supplier_organization_name ||
      props.supplier?.tagline ||
      props.supplier?.slug ||
      ''
  ).trim()
)
const panelDescription = computed(() =>
  supplierName.value
    ? `Supplier operators manage catalogue items, ingredients, and supplier work for ${supplierName.value}.`
    : 'Supplier operators manage catalogue items, ingredients, and supplier work from the supplier console.'
)
</script>
