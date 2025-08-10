<template>
  <UCard class="profiles cards card supplier-theme">
    <div class="header">
      <UAvatar
        :src="supplier?.avatarUrl || supplier?.profile_image?.url"
        :alt="supplier?.business_name || 'Supplier'"
        size="lg"
      />
      <div class="info">
        <h4 v-if="supplier?.business_name" class="title">
          {{ supplier.business_name }}
        </h4>
        <p v-if="supplier?.business_type" class="subtitle">
          {{ getBusinessTypeLabel(supplier.business_type) }}
        </p>
        <div v-if="supplier?.locations?.length" class="stat">
          <UIcon name="i-lucide-map-pin" />
          <span>{{ getLocationText(supplier.locations[0]) }}</span>
        </div>
      </div>
    </div>

    <p v-if="supplier?.bio_short" class="description">
      {{ supplier.bio_short }}
    </p>

    <div v-if="supplier?.specialties?.length" class="tags">
      <span
        v-for="specialty in supplier.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="supplier.specialties.length > 3" class="tag">
        +{{ supplier.specialties.length - 3 }} more
      </span>
    </div>

    <div class="stats">
      <div v-if="supplier?.years_in_business" class="stat">
        <UIcon name="i-lucide-calendar" />
        <span>{{ supplier.years_in_business }}+ years in business</span>
      </div>
      <div v-if="supplier?.products_offered?.length" class="stat">
        <UIcon name="i-lucide-package" />
        <span>{{ supplier.products_offered.length }} products</span>
      </div>
      <div v-if="supplier?.certifications?.length" class="stat">
        <UIcon name="i-lucide-shield-check" />
        <span>{{ supplier.certifications.length }} certifications</span>
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
