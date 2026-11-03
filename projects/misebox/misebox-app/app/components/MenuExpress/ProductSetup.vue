<template>
  <section class="fx-page-stack" aria-label="Menu Hosting catalogue">
    <UButton to="/products/menu-express" variant="outline"
      >View Menu Hosting product</UButton
    >
    <FireState
      :outcome="outcome"
      entity="Menu Hosting Product"
      :error="readError"
      retryable
      @retry="refresh"
    />
    <UButton v-if="outcome === 'empty' && !saved" :loading="busy" @click="setup"
      >Set up Menu Hosting catalogue entry</UButton
    >
    <p class="fx-type-caption">
      Creates the Misebox Product without a Stripe price or charge. Existing
      Products are never overwritten.
    </p>
    <UAlert
      v-if="error"
      color="error"
      title="Product setup not confirmed"
      :description="error"
    />
    <p v-if="saved || product" role="status">
      Menu Hosting is in the Misebox catalogue.
    </p>
  </section>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useProductDetail } from 'fireux-products/runtime/product/composables/useProductDetail'
import { useProductCreate } from 'fireux-products/runtime/product/composables/firestore/mutations/useProductCreate'
import { menuExpressProduct } from '../../../shared/menu-express-product'
const { createProduct, captureIntent, scopeEpoch } = useProductCreate()
const {
  product,
  outcome,
  error: readError,
  refresh,
} = useProductDetail('menu-express')
const busy = ref(false),
  error = ref(''),
  saved = ref(false)
watch(
  scopeEpoch,
  () => {
    busy.value = false
    error.value = ''
    saved.value = false
  },
  { flush: 'sync' }
)
async function setup() {
  if (busy.value) return
  const isCurrent = captureIntent()
  busy.value = true
  error.value = ''
  try {
    const result = await createProduct({
      payload: menuExpressProduct,
      priceInputs: [],
    })
    if (!isCurrent()) return
    saved.value = result.success
    if (!result.success)
      error.value = result.error || 'Product setup could not be confirmed.'
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
