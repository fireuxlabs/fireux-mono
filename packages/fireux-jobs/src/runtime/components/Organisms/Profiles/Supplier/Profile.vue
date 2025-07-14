<template>
  <div v-if="supplier" class="profile-display-card">
    <!-- Supplier Header -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <UAvatar
          :src="supplier.avatarUrl"
          :alt="supplier.company_name || supplier.displayName"
          size="2xl"
          :text="getInitials(supplier.company_name || supplier.displayName)"
        />
        <div v-if="supplier.verified" class="profile-verified">
          <UIcon name="i-heroicons-check-badge" class="text-green-500" />
          <span class="text-sm text-green-600">Verified Supplier</span>
        </div>
      </div>

      <div class="profile-info-section">
        <h1 class="profile-name">
          {{ supplier.company_name || supplier.displayName }}
        </h1>
        <p v-if="supplier.business_type" class="profile-subtitle">
          {{ supplier.business_type }}
        </p>
        <p v-if="supplier.title" class="profile-contact-title">
          {{ supplier.title }}
        </p>

        <div class="profile-contact-info">
          <p v-if="supplier.email" class="profile-contact">
            <UIcon name="i-heroicons-envelope" />
            {{ supplier.email }}
          </p>
          <p v-if="supplier.website" class="profile-contact">
            <UIcon name="i-heroicons-globe-alt" />
            <a
              :href="supplier.website"
              target="_blank"
              class="text-blue-600 hover:underline"
            >
              {{ supplier.website }}
            </a>
          </p>
          <p v-if="supplier.phone" class="profile-contact">
            <UIcon name="i-heroicons-phone" />
            {{ supplier.phone }}
          </p>
        </div>

        <!-- Location Info -->
        <div v-if="supplier.service_areas?.length" class="profile-location">
          <UIcon name="i-heroicons-map-pin" />
          <span>Serving: {{ supplier.service_areas.join(', ') }}</span>
        </div>
      </div>
    </div>

    <!-- Business Description -->
    <div
      v-if="supplier.bio_short || supplier.bio_long"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">About Our Business</h3>
      <p class="profile-content-text">
        {{ supplier.bio_long || supplier.bio_short }}
      </p>
    </div>

    <!-- Business Stats -->
    <div v-if="hasBusinessStats" class="profile-content-section">
      <h3 class="profile-content-title">Business Overview</h3>
      <div class="stats-grid">
        <div v-if="supplier.years_in_business" class="stat-item">
          <UIcon name="i-heroicons-calendar" class="stat-icon" />
          <span class="stat-value">{{ supplier.years_in_business }}</span>
          <span class="stat-label">Years in Business</span>
        </div>
        <div v-if="supplier.products?.length" class="stat-item">
          <UIcon name="i-heroicons-cube" class="stat-icon" />
          <span class="stat-value">{{ supplier.products.length }}</span>
          <span class="stat-label">Products</span>
        </div>
        <div v-if="supplier.client_restaurants?.length" class="stat-item">
          <UIcon name="i-heroicons-building-storefront" class="stat-icon" />
          <span class="stat-value">{{
            supplier.client_restaurants.length
          }}</span>
          <span class="stat-label">Restaurant Clients</span>
        </div>
        <div v-if="supplier.minimum_order_value" class="stat-item">
          <UIcon name="i-heroicons-currency-dollar" class="stat-icon" />
          <span class="stat-value">${{ supplier.minimum_order_value }}</span>
          <span class="stat-label">Min Order</span>
        </div>
      </div>
    </div>

    <!-- Specialties & Product Types -->
    <div
      v-if="supplier.specialties?.length || supplier.product_categories?.length"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Specialties & Categories</h3>

      <div v-if="supplier.specialties?.length" class="specialties-section">
        <h4 class="specialties-subtitle">Business Specialties</h4>
        <div class="specialties-grid">
          <UBadge
            v-for="specialty in supplier.specialties"
            :key="specialty"
            variant="solid"
            size="md"
          >
            {{ specialty }}
          </UBadge>
        </div>
      </div>

      <div
        v-if="supplier.product_categories?.length"
        class="specialties-section"
      >
        <h4 class="specialties-subtitle">Product Categories</h4>
        <div class="specialties-grid">
          <UBadge
            v-for="category in supplier.product_categories"
            :key="category"
            variant="soft"
            size="md"
          >
            {{ category }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Products -->
    <div v-if="supplier.products?.length" class="profile-content-section">
      <h3 class="profile-content-title">Featured Products</h3>
      <div class="products-grid">
        <div
          v-for="product in supplier.products.slice(0, 8)"
          :key="product.name"
          class="product-item"
        >
          <div class="product-header">
            <h4 class="product-name">{{ product.name }}</h4>
            <div class="product-price">
              <span v-if="product.price_per_unit" class="price-value"
                >${{ product.price_per_unit }}</span
              >
              <span v-if="product.unit" class="price-unit"
                >/ {{ product.unit }}</span
              >
            </div>
          </div>
          <p v-if="product.description" class="product-description">
            {{ product.description }}
          </p>
          <div class="product-details">
            <span v-if="product.category" class="product-category">
              <UBadge variant="outline" size="sm">{{
                product.category
              }}</UBadge>
            </span>
            <span v-if="product.origin" class="product-origin">
              <UIcon name="i-heroicons-map-pin" />
              {{ product.origin }}
            </span>
          </div>
          <div
            v-if="product.certifications?.length"
            class="product-certifications"
          >
            <UBadge
              v-for="cert in product.certifications"
              :key="cert"
              variant="subtle"
              size="xs"
            >
              {{ cert }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Certifications -->
    <div v-if="supplier.certifications?.length" class="profile-content-section">
      <h3 class="profile-content-title">Business Certifications</h3>
      <div class="certifications-grid">
        <div
          v-for="cert in supplier.certifications"
          :key="cert.name"
          class="certification-item"
        >
          <h4 class="certification-name">{{ cert.name }}</h4>
          <p class="certification-issuer">{{ cert.issuing_organization }}</p>
          <p class="certification-year">Obtained: {{ cert.year_obtained }}</p>
          <p v-if="cert.expiry_date" class="certification-expiry">
            Expires: {{ formatDate(cert.expiry_date) }}
          </p>
          <p v-if="cert.description" class="certification-description">
            {{ cert.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Delivery Information -->
    <div v-if="hasDeliveryInfo" class="profile-content-section">
      <h3 class="profile-content-title">Delivery & Orders</h3>
      <div class="delivery-info-grid">
        <div v-if="supplier.delivery_schedule" class="delivery-item">
          <h4 class="delivery-title">
            <UIcon name="i-heroicons-truck" />
            Delivery Schedule
          </h4>
          <p class="delivery-detail">{{ supplier.delivery_schedule }}</p>
        </div>

        <div v-if="supplier.minimum_order_value" class="delivery-item">
          <h4 class="delivery-title">
            <UIcon name="i-heroicons-calculator" />
            Minimum Order
          </h4>
          <p class="delivery-detail">${{ supplier.minimum_order_value }}</p>
        </div>

        <div v-if="supplier.payment_terms" class="delivery-item">
          <h4 class="delivery-title">
            <UIcon name="i-heroicons-credit-card" />
            Payment Terms
          </h4>
          <p class="delivery-detail">{{ supplier.payment_terms }}</p>
        </div>

        <div v-if="supplier.lead_time" class="delivery-item">
          <h4 class="delivery-title">
            <UIcon name="i-heroicons-clock" />
            Lead Time
          </h4>
          <p class="delivery-detail">{{ supplier.lead_time }}</p>
        </div>
      </div>
    </div>

    <!-- Client Restaurants -->
    <div
      v-if="supplier.client_restaurants?.length"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Restaurant Partners</h3>
      <div class="clients-grid">
        <div
          v-for="client in supplier.client_restaurants.slice(0, 6)"
          :key="client.name"
          class="client-item"
        >
          <h4 class="client-name">{{ client.name }}</h4>
          <p v-if="client.location" class="client-location">
            {{ client.location }}
          </p>
          <p v-if="client.partnership_duration" class="client-duration">
            Partner since {{ client.partnership_duration }}
          </p>
          <p v-if="client.testimonial" class="client-testimonial">
            "{{ client.testimonial }}"
          </p>
        </div>
      </div>
    </div>

    <!-- Contact Information -->
    <div class="profile-content-section">
      <h3 class="profile-content-title">Get In Touch</h3>
      <div class="contact-info-grid">
        <div class="contact-section">
          <h4 class="contact-title">Business Hours</h4>
          <p v-if="supplier.business_hours" class="contact-detail">
            {{ supplier.business_hours }}
          </p>
          <p v-else class="contact-detail">Contact us for business hours</p>
        </div>

        <div class="contact-section">
          <h4 class="contact-title">Order Information</h4>
          <p class="contact-detail">
            <UIcon name="i-heroicons-envelope" />
            {{ supplier.email }}
          </p>
          <p v-if="supplier.phone" class="contact-detail">
            <UIcon name="i-heroicons-phone" />
            {{ supplier.phone }}
          </p>
        </div>
      </div>
    </div>

    <!-- Social Media -->
    <div
      v-if="supplier.social_media && hasSocialMedia"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Follow Us</h3>
      <div class="social-media-grid">
        <a
          v-if="supplier.social_media.linkedin"
          :href="supplier.social_media.linkedin"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-linkedin" />
          LinkedIn
        </a>
        <a
          v-if="supplier.social_media.facebook"
          :href="supplier.social_media.facebook"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-facebook" />
          Facebook
        </a>
        <a
          v-if="supplier.social_media.instagram"
          :href="supplier.social_media.instagram"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-instagram" />
          Instagram
        </a>
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

// Computed properties
const hasBusinessStats = computed(() => {
  return (
    supplier.value?.years_in_business ||
    supplier.value?.products?.length ||
    supplier.value?.client_restaurants?.length ||
    supplier.value?.minimum_order_value
  )
})

const hasDeliveryInfo = computed(() => {
  return (
    supplier.value?.delivery_schedule ||
    supplier.value?.minimum_order_value ||
    supplier.value?.payment_terms ||
    supplier.value?.lead_time
  )
})

const hasSocialMedia = computed(() => {
  const social = supplier.value?.social_media
  return social?.linkedin || social?.facebook || social?.instagram
})

// Helper functions
function getInitials(name) {
  if (!name) return 'S'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.profile-display-card {
  @apply max-w-4xl mx-auto space-y-8;
}

.profile-header {
  @apply flex flex-col sm:flex-row gap-6 items-start;
}

.profile-avatar-section {
  @apply flex-shrink-0 text-center;
}

.profile-verified {
  @apply flex items-center gap-1 mt-2;
}

.profile-info-section {
  @apply flex-1 space-y-3;
}

.profile-name {
  @apply text-3xl font-bold text-gray-900;
}

.profile-subtitle,
.profile-contact-title {
  @apply text-xl text-gray-600;
}

.profile-contact-info {
  @apply space-y-1;
}

.profile-contact,
.profile-location {
  @apply flex items-center gap-2 text-gray-500;
}

.profile-content-section {
  @apply space-y-4;
}

.profile-content-title {
  @apply text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2;
}

.profile-content-text {
  @apply text-gray-700 leading-relaxed;
}

.stats-grid {
  @apply grid grid-cols-2 md:grid-cols-4 gap-4;
}

.stat-item {
  @apply flex flex-col items-center p-4 bg-gray-50 rounded-lg;
}

.stat-icon {
  @apply w-6 h-6 text-gray-500 mb-2;
}

.stat-value {
  @apply text-2xl font-bold text-gray-900;
}

.stat-label {
  @apply text-sm text-gray-500;
}

.specialties-section {
  @apply space-y-2 mb-4;
}

.specialties-subtitle {
  @apply font-medium text-gray-700;
}

.specialties-grid {
  @apply flex flex-wrap gap-2;
}

.products-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4;
}

.product-item {
  @apply border border-gray-200 rounded-lg p-4 space-y-3;
}

.product-header {
  @apply flex justify-between items-start;
}

.product-name {
  @apply font-semibold text-gray-900;
}

.product-price {
  @apply text-right;
}

.price-value {
  @apply font-bold text-green-600;
}

.price-unit {
  @apply text-sm text-gray-500;
}

.product-description {
  @apply text-sm text-gray-600;
}

.product-details {
  @apply flex justify-between items-center;
}

.product-origin {
  @apply flex items-center gap-1 text-sm text-gray-500;
}

.product-certifications {
  @apply flex flex-wrap gap-1;
}

.certifications-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.certification-item {
  @apply border border-gray-200 rounded-lg p-4 space-y-2;
}

.certification-name {
  @apply font-semibold text-gray-900;
}

.certification-issuer,
.certification-year,
.certification-expiry {
  @apply text-sm text-gray-600;
}

.certification-description {
  @apply text-gray-700;
}

.delivery-info-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.delivery-item {
  @apply space-y-2;
}

.delivery-title {
  @apply flex items-center gap-2 font-medium text-gray-700;
}

.delivery-detail {
  @apply text-gray-600;
}

.clients-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.client-item {
  @apply border border-gray-200 rounded-lg p-4 space-y-2;
}

.client-name {
  @apply font-semibold text-gray-900;
}

.client-location,
.client-duration {
  @apply text-sm text-gray-600;
}

.client-testimonial {
  @apply text-gray-700 italic;
}

.contact-info-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.contact-section {
  @apply space-y-2;
}

.contact-title {
  @apply font-medium text-gray-700;
}

.contact-detail {
  @apply flex items-center gap-2 text-gray-600;
}

.social-media-grid {
  @apply flex flex-wrap gap-4;
}

.social-link {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors;
}
</style>
