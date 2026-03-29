<template>
  <ClientOnly>
    <div v-if="supplier" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <MoleculesFormsFirestoreSimpleField
            label="Headline"
            :firebase-value="headline"
            placeholder="Ex: Local Produce Supplier"
            :maxlength="60"
            :update-function="handleHeadline"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Summary"
            type="textarea"
            :rows="3"
            :maxlength="200"
            :firebase-value="summary"
            placeholder="Short listing summary"
            :update-function="handleSummary"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Bio"
            type="textarea"
            :rows="6"
            :maxlength="2000"
            :firebase-value="bio"
            placeholder="Long-form supplier bio"
            :update-function="handleBio"
          />

          <MoleculesFormsFirestoreSimpleField
            label="Supplier Image URL"
            :firebase-value="imageUrl"
            placeholder="Optional: image URL for this supplier record"
            :maxlength="400"
            :update-function="handleImage"
          />

          <MoleculesFormsFirestoreArrayOfStrings
            label="Product Categories"
            :firebase-value="categories"
            item-placeholder="Product category"
            new-item-placeholder="Add product category"
            :update-function="handleCategories"
          />

          <MoleculesFormsFirestoreArrayOfStrings
            label="Delivery Areas"
            :firebase-value="deliveryAreas"
            item-placeholder="Delivery area"
            new-item-placeholder="Add delivery area"
            :update-function="handleDeliveryAreas"
          />
        </div>
      </UCard>
    </div>

    <MoleculesStateCard v-else entity="supplier record" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import { useSupplierUpdate } from '../../../../composables/fireux/firestore/supplier/mutations/useSupplierUpdate'
import type { Supplier } from '../../../../models/supplier/Supplier.model'

const props = defineProps<{ supplier: Supplier | null }>()

const supplier = computed(() => props.supplier ?? null)
const {
  updateHeadline,
  updateSummary,
  updateBio,
  updateImage,
  updateProductCategories,
  updateDeliveryAreas,
} = useSupplierUpdate()

const toast = useToastify()

const headline = computed(() => supplier.value?.supplier_headline ?? '')
const summary = computed(() => supplier.value?.summary ?? '')
const bio = computed(() => supplier.value?.supplier_bio ?? '')
const imageUrl = computed(() => supplier.value?.supplier_image ?? '')

const categories = computed(() =>
  Array.isArray(supplier.value?.supplier_product_categories)
    ? supplier.value?.supplier_product_categories
    : []
)

const deliveryAreas = computed(() =>
  Array.isArray(supplier.value?.supplier_delivery_areas)
    ? supplier.value?.supplier_delivery_areas
    : []
)

const wrap = async (fn: () => Promise<void>, okTitle: string, failTitle: string) => {
  try {
    await fn()
    toast.add({ title: okTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleHeadline = async (value: string) =>
  wrap(() => updateHeadline(value), 'Headline updated', 'Failed to update headline')

const handleSummary = async (value: string) =>
  wrap(() => updateSummary(value), 'Summary updated', 'Failed to update summary')

const handleBio = async (value: string) =>
  wrap(() => updateBio(value), 'Bio updated', 'Failed to update bio')

const handleImage = async (value: string) =>
  wrap(() => updateImage(value), 'Supplier image updated', 'Failed to update supplier image')

const handleCategories = async (value: string[]) =>
  wrap(
    () => updateProductCategories(value),
    'Product categories updated',
    'Failed to update product categories'
  )

const handleDeliveryAreas = async (value: string[]) =>
  wrap(
    () => updateDeliveryAreas(value),
    'Delivery areas updated',
    'Failed to update delivery areas'
  )
</script>
