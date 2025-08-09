<template>
  <UCard class="profile-card profile-variant">
    <div class="profile-header">
      <UAvatar
        :src="supplier?.avatarUrl || supplier?.profile_image?.url"
        :alt="supplier?.business_name || 'Supplier'"
        size="lg"
        class="profile-avatar-large"
      />
      <h3 v-if="supplier?.business_name" class="profile-title">
        {{ supplier.business_name }}
      </h3>
      <p v-if="supplier?.business_type" class="profile-subtitle-main">
        {{ supplier.business_type }}
      </p>
      <div v-if="supplier?.locations?.[0]" class="profile-location">
        📍 {{ supplier.locations[0].short_address || supplier.locations[0].formatted_address }}
      </div>
    </div>

    <div class="profile-body">
      <p v-if="supplier?.bio_short" class="profile-description-main">
        {{ supplier.bio_short }}
      </p>

      <div class="profile-highlights" v-if="supplier?.years_in_business || supplier?.products_offered?.length">
        <div v-if="supplier?.years_in_business" class="profile-highlight">
          <span class="highlight-value">{{ supplier.years_in_business }}</span>
          <span class="highlight-label">Years in Business</span>
        </div>
        <div v-if="supplier?.products_offered?.length" class="profile-highlight">
          <span class="highlight-value">{{ supplier.products_offered.length }}</span>
          <span class="highlight-label">Products</span>
        </div>
        <div v-if="supplier?.employee_count" class="profile-highlight">
          <span class="highlight-value">{{ supplier.employee_count }}</span>
          <span class="highlight-label">Employees</span>
        </div>
        <div v-if="supplier?.certifications?.length" class="profile-highlight">
          <span class="highlight-value">{{ supplier.certifications.length }}</span>
          <span class="highlight-label">Certifications</span>
        </div>
      </div>

      <div class="profile-tags-main" v-if="supplier?.specialties?.length">
        <span 
          v-for="specialty in supplier?.specialties?.slice(0, 4)" 
          :key="specialty"
          class="profile-tag-main featured"
        >
          {{ specialty }}
        </span>
      </div>
    </div>

    <div class="profile-footer">
      <div class="profile-badges-main">
        <span v-if="supplier?.quality_standards?.length" class="profile-badge-main quality">
          🏆 Quality Standards
        </span>
        <span v-if="supplier?.sustainability_practices?.length" class="profile-badge-main verified">
          🌱 Sustainable
        </span>
      </div>
      
      <div class="profile-contact">
        <button class="profile-action-btn">View Catalog</button>
        <button class="profile-action-btn primary">Request Quote</button>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  supplier?: Partial<Supplier>
}>()
</script>
