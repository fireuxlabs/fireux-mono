<template>
  <div style="padding: 2rem; max-width: 600px; margin: 0 auto">
    <h1>Product API Test</h1>

    <form @submit.prevent="testCreateProduct">
      <div style="margin-bottom: 1rem">
        <label>Product Name:</label>
        <input
          v-model="testProduct.name"
          type="text"
          style="width: 100%; padding: 0.5rem; margin-top: 0.25rem"
          placeholder="Test Product"
        />
      </div>

      <div style="margin-bottom: 1rem">
        <label>Description:</label>
        <textarea
          v-model="testProduct.description"
          style="
            width: 100%;
            padding: 0.5rem;
            margin-top: 0.25rem;
            height: 80px;
          "
          placeholder="Product description"
        />
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        style="
          padding: 0.75rem 1.5rem;
          background: #007acc;
          color: white;
          border: none;
          border-radius: 4px;
        "
      >
        {{ isLoading ? 'Creating...' : 'Test Create Product' }}
      </button>
    </form>

    <div
      v-if="result"
      style="
        margin-top: 2rem;
        padding: 1rem;
        background: #f5f5f5;
        border-radius: 4px;
      "
    >
      <h3>Result:</h3>
      <pre style="white-space: pre-wrap">{{
        JSON.stringify(result, null, 2)
      }}</pre>
    </div>
  </div>
</template>

<script setup>
const testProduct = ref({
  name: 'Test Product',
  description: 'A test product for verification',
  appId: 'test-app',
  slug: 'test-product',
})

const isLoading = ref(false)
const result = ref(null)

async function testCreateProduct() {
  isLoading.value = true
  result.value = null

  try {
    console.log('🧪 Testing product creation API...')

    const response = await $fetch('/api/stripe/create-product', {
      method: 'POST',
      body: {
        product: testProduct.value,
      },
    })

    console.log('✅ API Response:', response)
    result.value = response
  } catch (error) {
    console.error('❌ API Error:', error)
    result.value = {
      success: false,
      error: error.message || 'Unknown error',
      details: error,
    }
  } finally {
    isLoading.value = false
  }
}
</script>
