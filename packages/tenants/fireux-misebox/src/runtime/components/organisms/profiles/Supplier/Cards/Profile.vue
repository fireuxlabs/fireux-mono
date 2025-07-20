<template>
  <div class="supplier-profile-card">
    <div class="card-header">
      <img
        v-if="supplier.profile_image"
        :src="supplier.profile_image.url"
        :alt="`${supplier.business_name} profile`"
        class="profile-image large"
      />
      <div class="supplier-details">
        <h2>{{ supplier.business_name }}</h2>
        <h3 v-if="supplier.title">{{ supplier.title }}</h3>
        <p v-if="supplier.bio_short" class="bio">{{ supplier.bio_short }}</p>

        <div class="badges">
          <span class="badge business-type">
            {{ formatBusinessType(supplier.business_type) }}
          </span>
          <span v-if="supplier.years_in_business" class="badge experience">
            {{ supplier.years_in_business }} years in business
          </span>
          <span v-if="supplier.verified" class="badge verified">
            ✓ Verified
          </span>
          <span v-if="supplier.featured" class="badge featured">
            ★ Featured
          </span>
        </div>
      </div>
    </div>

    <div v-if="supplier.specialties?.length" class="specialties-section">
      <h4>Specialties</h4>
      <div class="tags">
        <span
          v-for="specialty in supplier.specialties"
          :key="specialty"
          class="tag"
        >
          {{ specialty }}
        </span>
      </div>
    </div>

    <div v-if="supplier.quality_standards?.length" class="quality-section">
      <h4>Quality Standards</h4>
      <div class="tags">
        <span
          v-for="standard in supplier.quality_standards"
          :key="standard"
          class="tag quality"
        >
          {{ standard }}
        </span>
      </div>
    </div>

    <div class="stats-section">
      <div class="stats-grid">
        <div v-if="supplier.total_items" class="stat">
          <span class="stat-number">{{ supplier.total_items }}</span>
          <span class="stat-label">Products</span>
        </div>
        <div v-if="supplier.total_connections" class="stat">
          <span class="stat-number">{{ supplier.total_connections }}</span>
          <span class="stat-label">Connections</span>
        </div>
        <div v-if="supplier.employee_count" class="stat">
          <span class="stat-number">{{ supplier.employee_count }}</span>
          <span class="stat-label">Employees</span>
        </div>
        <div v-if="supplier.annual_capacity" class="stat">
          <span class="stat-text">{{ supplier.annual_capacity }}</span>
          <span class="stat-label">Annual Capacity</span>
        </div>
      </div>
    </div>

    <div v-if="supplier.delivery_methods?.length" class="delivery-section">
      <h4>Delivery Options</h4>
      <div class="delivery-methods">
        <span
          v-for="method in supplier.delivery_methods.slice(0, 3)"
          :key="method"
          class="delivery-method"
        >
          {{ method }}
        </span>
        <span v-if="supplier.delivery_methods.length > 3" class="more-count">
          +{{ supplier.delivery_methods.length - 3 }} more
        </span>
      </div>
    </div>

    <div class="features-section">
      <div class="features">
        <span v-if="supplier.bulk_discounts" class="feature"
          >💰 Bulk Discounts</span
        >
        <span v-if="supplier.seasonal_pricing" class="feature"
          >📅 Seasonal Pricing</span
        >
        <span v-if="supplier.sustainability_practices?.length" class="feature"
          >🌱 Sustainable</span
        >
      </div>
    </div>

    <div class="action-section">
      <button
        class="btn-primary full-width"
        @click="$emit('view-full-profile', supplier)"
      >
        View Full Profile
      </button>

      <div class="secondary-actions">
        <button
          class="btn-secondary"
          @click="$emit('contact-supplier', supplier)"
        >
          Contact
        </button>
        <button class="btn-secondary" @click="$emit('view-products', supplier)">
          View Products
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

const emit = defineEmits([
  'view-full-profile',
  'contact-supplier',
  'view-products',
])

const formatBusinessType = (type) => {
  const types = {
    farm: 'Farm',
    distributor: 'Distributor',
    manufacturer: 'Manufacturer',
    wholesaler: 'Wholesaler',
    producer: 'Producer',
    other: 'Other',
  }
  return types[type] || type
}
</script>

<style scoped>
.supplier-profile-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  max-width: 400px;
}

.card-header {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.supplier-details h2 {
  margin: 0 0 5px 0;
  font-size: 1.5rem;
  color: #111827;
}

.supplier-details h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  color: #6b7280;
  font-weight: 500;
}

.bio {
  color: #4b5563;
  margin-bottom: 12px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge.business-type {
  background: #f3f4f6;
  color: #374151;
}

.badge.experience {
  background: #f0f9ff;
  color: #0369a1;
}

.badge.verified {
  background: #dcfce7;
  color: #166534;
}

.badge.featured {
  background: #fef3c7;
  color: #92400e;
}

.specialties-section,
.quality-section,
.delivery-section {
  margin-bottom: 20px;
}

.specialties-section h4,
.quality-section h4,
.delivery-section h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #374151;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #f9fafb;
  color: #374151;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  border: 1px solid #e5e7eb;
}

.tag.quality {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #3b82f6;
}

.delivery-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.delivery-method {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.85rem;
}

.more-count {
  color: #6b7280;
  font-size: 0.8rem;
  padding: 4px 8px;
}

.stats-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.stat-text {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  word-break: break-word;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 2px;
}

.features-section {
  margin-bottom: 24px;
}

.features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature {
  background: #f0f9ff;
  color: #0369a1;
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.secondary-actions {
  display: flex;
  gap: 8px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary.full-width {
  width: 100%;
}

.btn-secondary {
  background: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
  flex: 1;
}

.btn-secondary:hover {
  background: #f0f9ff;
}
</style>
