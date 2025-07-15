<template>
  <div class="supplier-card">
    <div class="card-header">
      <FireAtomsImagesProfileImage
        v-if="supplier.profile_image"
        :src="supplier.profile_image.url"
        :alt="`${supplier.business_name} profile`"
        size="medium"
      />
      <div class="supplier-info">
        <h3>{{ supplier.business_name }}</h3>
        <p v-if="supplier.title" class="title">{{ supplier.title }}</p>
        <div class="business-type">
          {{ formatBusinessType(supplier.business_type) }}
        </div>
        <div v-if="supplier.years_in_business" class="experience">
          {{ supplier.years_in_business }} years in business
        </div>
      </div>
    </div>

    <p v-if="supplier.bio_short" class="bio">{{ supplier.bio_short }}</p>

    <div v-if="supplier.specialties?.length" class="specialties">
      <span 
        v-for="specialty in supplier.specialties.slice(0, 3)" 
        :key="specialty" 
        class="specialty-tag"
      >
        {{ specialty }}
      </span>
      <span v-if="supplier.specialties.length > 3" class="more-count">
        +{{ supplier.specialties.length - 3 }} more
      </span>
    </div>

    <div class="badges">
      <span v-if="supplier.verified" class="badge verified">✓ Verified</span>
      <span v-if="supplier.featured" class="badge featured">★ Featured</span>
      <span v-if="supplier.bulk_discounts" class="badge discount">Bulk Discounts</span>
    </div>

    <div class="card-footer">
      <div class="stats">
        <span v-if="supplier.total_items" class="stat">
          {{ supplier.total_items }} products
        </span>
        <span v-if="supplier.total_connections" class="stat">
          {{ supplier.total_connections }} connections
        </span>
      </div>
      
      <div class="actions">
        <button class="btn-primary" @click="$emit('view-profile', supplier)">
          View Profile
        </button>
        <button class="btn-secondary" @click="$emit('contact-supplier', supplier)">
          Contact
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['view-profile', 'contact-supplier'])

const formatBusinessType = (type) => {
  const types = {
    farm: 'Farm',
    distributor: 'Distributor',
    manufacturer: 'Manufacturer',
    wholesaler: 'Wholesaler',
    producer: 'Producer',
    other: 'Other'
  }
  return types[type] || type
}
</script>

<style scoped>
.supplier-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.2s ease;
  cursor: pointer;
}

.supplier-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  gap: 15px;
  align-items: flex-start;
  margin-bottom: 15px;
}

.supplier-info h3 {
  margin: 0 0 5px 0;
  font-size: 1.25rem;
  color: #111827;
}

.title {
  color: #6b7280;
  margin: 0 0 5px 0;
  font-size: 0.9rem;
}

.business-type {
  background: #f3f4f6;
  color: #374151;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: inline-block;
  margin-bottom: 5px;
}

.experience {
  background: #f0f9ff;
  color: #0369a1;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  display: inline-block;
}

.bio {
  color: #4b5563;
  margin-bottom: 15px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 15px;
}

.specialty-tag {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
}

.more-count {
  color: #6b7280;
  font-size: 0.8rem;
  padding: 4px 8px;
}

.badges {
  display: flex;
  gap: 6px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.verified {
  background: #dcfce7;
  color: #166534;
}

.badge.featured {
  background: #fef3c7;
  color: #92400e;
}

.badge.discount {
  background: #dbeafe;
  color: #1d4ed8;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.stats {
  display: flex;
  gap: 15px;
}

.stat {
  color: #6b7280;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-primary, .btn-secondary {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-secondary:hover {
  background: #3b82f6;
  color: white;
}
</style>
