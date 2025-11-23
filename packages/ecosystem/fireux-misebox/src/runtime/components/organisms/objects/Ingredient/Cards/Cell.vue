<template>
  <UCard class="objects cards cell">
    <div class="header">
      <div class="icon">🥬</div>
      <div class="info">
        <h3 v-if="ingredient?.name" class="title">
          {{ ingredient.name }}
        </h3>
        <p v-if="ingredient?.category" class="subtitle">
          {{ ingredient.category }}
        </p>
      </div>
    </div>

    <div v-if="ingredient?.supplierInfo" class="supplier-badge">
      <span class="supplier-label">Supplied by:</span>
      <span class="supplier-name">{{
        ingredient.supplierInfo.business_name
      }}</span>
      <span v-if="ingredient.supplierInfo.verified" class="verified-badge"
        >✓</span
      >
    </div>

    <div v-if="ingredient?.tags?.length" class="tags">
      <template v-for="(tag, index) in ingredient.tags.slice(0, 3)" :key="tag">
        <span class="tag">{{ tag }}</span>
      </template>
      <span v-if="ingredient.tags.length > 3" class="tag-more">
        +{{ ingredient.tags.length - 3 }} more
      </span>
    </div>

    <div v-if="ingredient?.createdAt || ingredient?.updatedAt" class="meta">
      <span v-if="ingredient.createdAt" class="meta-item">
        Created: {{ formatDate(ingredient.createdAt) }}
      </span>
      <span v-if="ingredient.updatedAt" class="meta-item">
        Updated: {{ formatDate(ingredient.updatedAt) }}
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Ingredient } from '../../../../../models/objects/Ingredient.model'

defineProps<{
  ingredient?: Partial<Ingredient>
}>()

// Consistent date formatting to prevent hydration mismatches
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>
