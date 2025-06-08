<template>
  <UCard>
    <template #header v-if="variant === 'cell'">
      <h3 class="cell-title">{{ display(product?.name) || 'Unnamed Product' }}</h3>
    </template>

    <template #default>

      <div v-if="variant === 'cell'" class="product-cell">
        <div v-if="product?.main_image" class="cell-image">
          <img :src="product.main_image" alt="Product image" />
        </div>
        <div class="cell-text">
          <p class="cell-description">{{ display(product?.description) }}</p>
          <p v-if="product?.default_price" class="cell-price">
            €{{ product.default_price.unit_amount }}<span v-if="product.default_price.interval">/{{ product.default_price.interval }}</span>
          </p>
          <div class="purchace-buttons">
            <UButton :disabled="props.mode === 'preview'" color="primary">Buy Now</UButton>
            <UButton :disabled="props.mode === 'preview'" variant="outline">Add to Basket</UButton>
          </div>
        </div>
      </div>

      <div v-else-if="variant === 'customer'">
        <p><strong>{{ display(product?.name) }}</strong></p>
        <p>{{ display(product?.description) }}</p>
        <p v-if="product?.default_price">
          €{{ product.default_price.unit_amount }}
        </p>
        <div class="purchace-buttons">
          <UButton :disabled="props.mode === 'preview'" color="primary">Buy Now</UButton>
          <UButton :disabled="props.mode === 'preview'" variant="outline">Add to Basket</UButton>
        </div>
      </div>

      <div v-else-if="variant === 'info'">
        <ul>
          <li v-if="product?.id"><strong>ID:</strong> {{ product.id }}</li>
          <li><strong>Name:</strong> {{ display(product?.name) }}</li>
          <li><strong>Slug:</strong> {{ display(product?.slug) }}</li>
          <li><strong>Created:</strong> {{ display(product?.created_at) }}</li>
          <li><strong>Updated:</strong> {{ display(product?.updated_at) }}</li>
          <li><strong>Tenant:</strong> {{ display(product?.tenant_id) }}</li>
          <li><strong>Creator:</strong> {{ display(product?.creator_id) }}</li>
          <li><strong>Image Supplied:</strong> {{ product?.main_image ? 'Yes' : 'No' }}</li>
          <li><strong>Type:</strong> {{ display(product?.product_type) }}</li>
          <li><strong>Stock:</strong>
            <span :style="{ color: product?.stock == null ? 'red' : 'inherit' }">{{ product?.stock ?? '!' }}</span>
          </li>
          <li><strong>Track Stock:</strong> {{ display(product?.track_stock ? 'Yes' : 'No') }}</li>
          <li><strong>Content:</strong> {{ display(product?.content) }}</li>
          <li><strong>Default Price:</strong>
            <span :style="{ color: product?.default_price?.unit_amount == null ? 'red' : 'inherit' }">{{ product?.default_price?.unit_amount ?? '!' }}</span>
          </li>
        </ul>
      </div>

      <div v-else-if="variant === 'page'">
        <h1>{{ display(product?.name) }}</h1>
        <p>{{ display(product?.description) }}</p>
        <div v-html="product?.content" v-if="product?.content" />
        <p v-else class="missing">!</p>
        <div class="purchace-buttons">
          <UButton :disabled="props.mode === 'preview'" color="primary">Buy Now</UButton>
          <UButton :disabled="props.mode === 'preview'" variant="outline">Add to Basket</UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  product?: Partial<FirebaseProduct>
  variant?: 'customer' | 'info' | 'cell' | 'page'
  mode?: 'preview' | 'fetch'
}>()

function display(value: unknown): string {
  return typeof value === 'string' && value.trim() !== '' ? value : '!'
}

console.log('🔍 ProductCard Props:', props)
</script>

<style scoped>
.missing {
  color: red;
  font-weight: bold;
}
.image-wrapper {
  margin-bottom: 1rem;
  text-align: center;
}
.image-wrapper img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.product-cell {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  text-align: left;
}

.cell-image {
  max-width: 80px;
}

.cell-image img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-xs);
  object-fit: cover;
}

.cell-text {
  flex: 1;
}

.cell-title {
  margin: 0;
  font-weight: 600;
  text-align: left;
}

.cell-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.cell-price {
  margin-top: 0.5rem;
  font-weight: bold;
}
.purchace-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
}
</style>
