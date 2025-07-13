<template>
  <UCard class="supplier-card" @click="handleClick">
    <!-- Supplier Header -->
    <div class="supplier-header">
      <!-- Avatar/Logo -->
      <div class="avatar-container">
        <UAvatar
          v-if="supplier.avatar"
          :src="supplier.avatar"
          :alt="supplierName"
          size="md"
        />
        <UAvatar
          v-else
          :text="getInitials(supplierName)"
          size="md"
          color="primary"
        />
      </div>

      <!-- Supplier Info -->
      <div class="supplier-info">
        <h3 class="supplier-name">{{ supplierName }}</h3>
        <p v-if="supplier.business_type" class="supplier-type">
          {{ formatBusinessType(supplier.business_type) }}
        </p>
        <p v-if="supplier.bio_short" class="supplier-bio">
          {{ supplier.bio_short }}
        </p>
      </div>
    </div>

    <!-- Supplier Stats -->
    <div class="supplier-stats">
      <div v-if="supplier.business_status" class="stat-item">
        <UIcon
          :name="getStatusIcon(supplier.business_status)"
          class="stat-icon"
        />
        <span class="stat-text">{{
          formatBusinessStatus(supplier.business_status)
        }}</span>
      </div>

      <div v-if="supplier.verification_status" class="stat-item">
        <UIcon
          :name="getVerificationIcon(supplier.verification_status)"
          class="stat-icon"
        />
        <span class="stat-text">{{
          formatVerificationStatus(supplier.verification_status)
        }}</span>
      </div>

      <div
        v-if="supplier.delivery_options?.minimum_order_value"
        class="stat-item"
      >
        <UIcon name="i-heroicons-currency-dollar" class="stat-icon" />
        <span class="stat-text"
          >${{ supplier.delivery_options.minimum_order_value }} min order</span
        >
      </div>
    </div>

    <!-- Product Categories -->
    <div v-if="supplier.product_categories?.length" class="supplier-categories">
      <div class="categories-label">Products:</div>
      <div class="categories-grid">
        <UBadge
          v-for="category in supplier.product_categories.slice(0, 3)"
          :key="category"
          variant="soft"
          size="sm"
        >
          {{ formatCategory(category) }}
        </UBadge>
        <UBadge
          v-if="supplier.product_categories.length > 3"
          variant="outline"
          size="sm"
        >
          +{{ supplier.product_categories.length - 3 }} more
        </UBadge>
      </div>
    </div>

    <!-- Specialties -->
    <div v-if="supplier.specialties?.length" class="supplier-specialties">
      <div class="specialties-label">Specialties:</div>
      <div class="specialties-grid">
        <UBadge
          v-for="specialty in supplier.specialties.slice(0, 3)"
          :key="specialty"
          variant="outline"
          size="sm"
        >
          {{ specialty }}
        </UBadge>
        <UBadge
          v-if="supplier.specialties.length > 3"
          variant="outline"
          size="sm"
        >
          +{{ supplier.specialties.length - 3 }} more
        </UBadge>
      </div>
    </div>

    <!-- Delivery Options -->
    <div v-if="deliveryOptions.length" class="delivery-options">
      <div class="delivery-label">Delivery:</div>
      <div class="delivery-list">
        <span
          v-for="option in deliveryOptions"
          :key="option"
          class="delivery-option"
        >
          {{ option }}
        </span>
      </div>
    </div>

    <!-- Location -->
    <div v-if="supplier.business_address?.city" class="supplier-location">
      <UIcon name="i-heroicons-map-pin" class="location-icon" />
      <span class="location-text">
        {{ supplier.business_address.city }},
        {{ supplier.business_address.state }}
      </span>
    </div>

    <!-- Footer Actions -->
    <div class="supplier-footer">
      <UButton variant="ghost" size="sm" @click.stop="handleContact">
        Contact Supplier
      </UButton>
      <UButton variant="outline" size="sm" @click.stop="handleViewProfile">
        View Profile
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Supplier } from '../models/Supplier.model'

interface Props {
  supplier: Supplier
}

const props = defineProps<Props>()

// Computed properties
const supplierName = computed(() => {
  return (
    props.supplier.display_name || props.supplier.business_name || 'Supplier'
  )
})

const deliveryOptions = computed(() => {
  const options: string[] = []
  if (props.supplier.delivery_options?.self_delivery)
    options.push('Self-delivery')
  if (props.supplier.delivery_options?.third_party_delivery)
    options.push('3rd party')
  if (props.supplier.delivery_options?.pickup_available) options.push('Pickup')
  return options
})

// Methods
function getInitials(name: string): string {
  if (!name) return 'S'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatBusinessType(type: string): string {
  const typeMap: Record<string, string> = {
    restaurant: 'Restaurant',
    catering: 'Catering Service',
    food_truck: 'Food Truck',
    grocery: 'Grocery Store',
    distributor: 'Food Distributor',
    farm: 'Farm',
    processor: 'Food Processor',
    wholesaler: 'Wholesale Supplier',
  }
  return typeMap[type] || type
}

function formatBusinessStatus(status: string): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'seasonal':
      return 'Seasonal'
    case 'temporarily_closed':
      return 'Temporarily Closed'
    case 'permanently_closed':
      return 'Permanently Closed'
    default:
      return 'Status Unknown'
  }
}

function formatVerificationStatus(status: string): string {
  switch (status) {
    case 'verified':
      return 'Verified'
    case 'pending':
      return 'Pending Verification'
    case 'rejected':
      return 'Verification Rejected'
    default:
      return 'Not Verified'
  }
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'active':
      return 'i-heroicons-check-circle'
    case 'seasonal':
      return 'i-heroicons-sun'
    case 'temporarily_closed':
      return 'i-heroicons-pause-circle'
    case 'permanently_closed':
      return 'i-heroicons-x-circle'
    default:
      return 'i-heroicons-question-mark-circle'
  }
}

function getVerificationIcon(status: string): string {
  switch (status) {
    case 'verified':
      return 'i-heroicons-shield-check'
    case 'pending':
      return 'i-heroicons-clock'
    case 'rejected':
      return 'i-heroicons-shield-exclamation'
    default:
      return 'i-heroicons-shield'
  }
}

function handleClick() {
  navigateTo(`/suppliers/${props.supplier.id}`)
}

function handleContact() {
  // Implement contact functionality
  console.log('Contact supplier:', props.supplier.id)
}

function handleViewProfile() {
  navigateTo(`/suppliers/${props.supplier.id}`)
}
</script>

<style scoped>
.supplier-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.supplier-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.supplier-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.avatar-container {
  flex-shrink: 0;
}

.supplier-info {
  flex: 1;
  min-width: 0;
}

.supplier-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--ui-text);
  margin: 0 0 var(--space-1) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.supplier-type {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
  font-weight: 500;
  margin: 0 0 var(--space-2) 0;
}

.supplier-bio {
  font-size: 0.875rem;
  color: var(--ui-text);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.supplier-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.stat-icon {
  width: var(--space-4);
  height: var(--space-4);
  color: var(--ui-text-muted);
  flex-shrink: 0;
}

.stat-text {
  font-size: 0.875rem;
  color: var(--ui-text);
}

.supplier-categories,
.supplier-specialties {
  margin-bottom: var(--space-4);
}

.categories-label,
.specialties-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.categories-grid,
.specialties-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.delivery-options {
  margin-bottom: var(--space-4);
}

.delivery-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.delivery-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.delivery-option {
  font-size: 0.875rem;
  color: var(--ui-text);
  padding: var(--space-1) var(--space-2);
  background-color: var(--ui-bg-elevated);
  border-radius: var(--radius-sm);
  border: 1px solid var(--ui-border);
}

.supplier-location {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.location-icon {
  width: var(--space-4);
  height: var(--space-4);
  color: var(--ui-text-muted);
}

.location-text {
  font-size: 0.875rem;
  color: var(--ui-text-muted);
}

.supplier-footer {
  display: flex;
  gap: var(--space-2);
  margin-top: auto;
  padding-top: var(--space-4);
}

.supplier-footer > * {
  flex: 1;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .supplier-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .supplier-footer {
    flex-direction: column;
  }

  .supplier-footer > * {
    flex: none;
  }
}
</style>
