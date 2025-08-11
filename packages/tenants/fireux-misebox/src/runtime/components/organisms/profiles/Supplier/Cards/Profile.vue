<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="supplier?.avatarUrl || supplier?.profile_image?.url"
        :alt="supplier?.company_name || 'Supplier'"
        size="lg"
      />
      <div class="profile-info">
        <h4 v-if="supplier?.company_name" class="profile-name">
          {{ supplier.company_name }}
        </h4>
        <p v-if="supplier?.business_type" class="profile-subtitle">
          {{ supplier.business_type }}
        </p>
        <div v-if="supplier?.locations?.length" class="profile-location">
          <UIcon name="i-lucide-map-pin" />
          <span>{{ getLocationText(supplier.locations[0]) }}</span>
        </div>
        <div v-if="supplier?.years_in_business" class="profile-meta">
          {{ supplier.years_in_business }}+ years in business
        </div>
      </div>
    </div>
    <p v-if="supplier?.bio_long || supplier?.bio_short" class="profile-bio">
      {{ supplier.bio_long || supplier.bio_short }}
    </p>

    <div v-if="supplier?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in supplier.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="supplier.specialties.length > 3" class="tag-more">
        +{{ supplier.specialties.length - 3 }} more
      </span>
    </div>

    <div v-if="supplier?.products_offered?.length" class="profile-section">
      <strong class="section-label">Products:</strong>
      <span
        v-for="product in supplier.products_offered.slice(0, 2)"
        :key="product"
        class="tag"
      >
        {{ product }}
      </span>
      <span v-if="supplier.products_offered.length > 2" class="tag-more">
        +{{ supplier.products_offered.length - 2 }} more
      </span>
    </div>

    <div class="profile-stats">
      <div v-if="supplier?.employee_count" class="profile-stat">
        <UIcon name="i-lucide-users" />
        <span>{{ supplier.employee_count }} employees</span>
      </div>
      <div v-if="supplier?.certifications?.length" class="profile-stat">
        <UIcon name="i-lucide-shield-check" />
        <span>{{ supplier.certifications.length }} certifications</span>
      </div>
      <div v-if="supplier?.delivery_range" class="profile-stat">
        <UIcon name="i-lucide-truck" />
        <span>{{ supplier.delivery_range }}km delivery</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import type { Supplier } from '../../../../../models/profiles/Supplier.model'

defineProps<{
  supplier?: Partial<Supplier>
}>()
</script>
