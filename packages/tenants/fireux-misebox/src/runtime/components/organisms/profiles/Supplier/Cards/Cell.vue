<template>
  <UCard class="cell-card">
    <div class="cell-header">
      <UAvatar
        :src="supplier?.avatarUrl || supplier?.profile_image?.url"
        :alt="supplier?.business_name || 'Supplier'"
        size="md"
      />
      <div class="cell-info">
        <h4 v-if="supplier?.business_name" class="cell-title">
          {{ supplier.business_name }}
        </h4>
        <p v-if="supplier?.business_type" class="cell-subtitle">
          {{ supplier.business_type }}
        </p>
      </div>
    </div>

    <div class="cell-content">
      <p v-if="supplier?.bio_short" class="cell-description">
        {{ supplier.bio_short }}
      </p>

      <div class="cell-tags" v-if="supplier?.specialties?.length">
        <span
          v-for="specialty in supplier?.specialties?.slice(0, 3)"
          :key="specialty"
          class="cell-tag"
        >
          {{ specialty }}
        </span>
      </div>

      <div
        class="cell-stats"
        v-if="supplier?.years_in_business || supplier?.products_offered?.length"
      >
        <span v-if="supplier?.years_in_business" class="cell-stat">
          🏢 {{ supplier.years_in_business }} years in business
        </span>
        <span v-if="supplier?.products_offered?.length" class="cell-stat">
          📦 {{ supplier.products_offered.length }} products
        </span>
      </div>

      <div
        class="cell-badges"
        v-if="
          supplier?.certifications?.length ||
          supplier?.quality_standards?.length
        "
      >
        <span
          v-if="supplier?.certifications?.length"
          class="cell-badge certified"
        >
          🏆 {{ supplier.certifications.length }} certifications
        </span>
        <span
          v-if="supplier?.quality_standards?.length"
          class="cell-badge quality"
        >
          ✓ Quality standards
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  supplier?: Partial<Supplier>
}>()
</script>
