<template>
  <UCard class="profiles cards profile supplier-theme">
    <div class="header">
      <div class="avatar-section">
        <UAvatar
          :src="supplier?.avatarUrl || supplier?.profile_image?.url"
          :alt="supplier?.business_name || 'Supplier'"
          size="xl"
        />
        <div v-if="supplier?.certifications?.length" class="verification-badge">
          <UIcon name="i-lucide-shield-check" />
          <span>Certified</span>
        </div>
      </div>
      <div class="info">
        <h2 v-if="supplier?.business_name" class="title">
          {{ supplier.business_name }}
        </h2>
        <p v-if="supplier?.business_type" class="subtitle">
          {{ getBusinessTypeLabel(supplier.business_type) }}
        </p>
        <div class="meta-stats">
          <div v-if="supplier?.locations?.length" class="stat">
            <UIcon name="i-lucide-map-pin" />
            <span>{{ getLocationText(supplier.locations[0]) }}</span>
          </div>
          <div v-if="supplier?.years_in_business" class="stat">
            <UIcon name="i-lucide-calendar" />
            <span>{{ supplier.years_in_business }}+ years in business</span>
          </div>
        </div>
      </div>
      <div class="actions">
        <UButton size="lg" color="primary">
          <UIcon name="i-lucide-package" />
          View Products
        </UButton>
        <UButton variant="outline" size="lg">
          <UIcon name="i-lucide-message-circle" />
          Contact
        </UButton>
      </div>
    </div>

    <div v-if="supplier?.bio_long || supplier?.bio_short" class="description">
      {{ supplier.bio_long || supplier.bio_short }}
    </div>

    <div v-if="supplier?.specialties?.length" class="tags">
      <span
        v-for="specialty in supplier.specialties"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
    </div>

    <div v-if="supplier?.products_offered?.length" class="products-section">
      <h3>Featured Products</h3>
      <div
        v-for="product in supplier.products_offered.slice(0, 3)"
        :key="product.id"
        class="product-item"
      >
        <div class="product-header">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.name"
            class="product-image"
          />
          <div class="product-details">
            <h4 class="product-name">{{ product.name }}</h4>
            <p class="product-category">{{ product.category }}</p>
            <p class="product-price">
              {{ product.price_per_unit }}{{ product.currency }}/{{
                product.unit_type
              }}
            </p>
          </div>
        </div>
        <p v-if="product.description" class="product-description">
          {{ product.description }}
        </p>
      </div>
    </div>

    <div v-if="supplier?.certifications?.length" class="certifications-section">
      <h3>Certifications</h3>
      <div class="cert-list">
        <div
          v-for="cert in supplier.certifications.slice(0, 3)"
          :key="cert.name"
          class="cert-item"
        >
          <UIcon name="i-lucide-shield-check" />
          <span class="cert-name">{{ cert.name }}</span>
          <span class="cert-issuer">by {{ cert.issuer }}</span>
        </div>
      </div>
    </div>

    <div class="stats">
      <div v-if="supplier?.products_offered?.length" class="stat">
        <UIcon name="i-lucide-package" />
        <span>{{ supplier.products_offered.length }} products</span>
      </div>
      <div v-if="supplier?.employee_count" class="stat">
        <UIcon name="i-lucide-users" />
        <span>{{ supplier.employee_count }} employees</span>
      </div>
      <div v-if="supplier?.annual_capacity" class="stat">
        <UIcon name="i-lucide-trending-up" />
        <span>{{ supplier.annual_capacity }} annual capacity</span>
      </div>
    </div>
  </UCard>
</template>

<script setup>
const props = defineProps({
  supplier: {
    type: Object,
    required: false,
    default: () => null,
  },
})

const getLocationText = (location) => {
  if (location?.locations?.[0]?.formatted_address) {
    return location.locations[0].formatted_address.split(',')[0]
  }
  return 'Location not specified'
}

const getBusinessTypeLabel = (type) => {
  const labels = {
    farm: 'Farm',
    distributor: 'Distributor',
    manufacturer: 'Manufacturer',
    wholesaler: 'Wholesaler',
    producer: 'Producer',
    other: 'Supplier',
  }
  return labels[type] || 'Supplier'
}
</script>
