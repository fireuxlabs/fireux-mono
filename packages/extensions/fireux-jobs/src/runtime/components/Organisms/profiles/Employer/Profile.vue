<template>
  <div v-if="employer" class="profile-card profile-variant">
    <!-- Company Header -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <UAvatar
          :src="employer.avatarUrl"
          :alt="employer.company_name || employer.displayName"
          size="2xl"
          :text="getInitials(employer.company_name || employer.displayName)"
          class="profile-avatar"
        />
        <div v-if="employer.verified" class="profile-badge verified">
          <UIcon name="i-heroicons-check-badge" />
          <span>Verified Business</span>
        </div>
      </div>

      <div class="profile-info-section">
        <h1 class="profile-title">
          {{ employer.company_name || employer.displayName }}
        </h1>
        <p v-if="employer.business_type" class="profile-subtitle">
          {{ employer.business_type }}
        </p>
        <p v-if="employer.title" class="profile-contact-title">
          {{ employer.title }}
        </p>

        <div class="profile-contact-info">
          <div v-if="employer.email" class="profile-contact">
            <UIcon name="i-heroicons-envelope" />
            {{ employer.email }}
          </div>
          <div v-if="employer.website" class="profile-contact">
            <UIcon name="i-heroicons-globe-alt" />
            <a
              :href="employer.website"
              target="_blank"
              class="profile-link"
            >
              {{ employer.website }}
            </a>
          </div>
        </div>

        <!-- Location Info -->
        <div v-if="employer.locations?.length" class="profile-location">
          <UIcon name="i-heroicons-map-pin" />
          <span>{{ formatLocation(employer.locations[0]) }}</span>
        </div>
      </div>
    </div>

    <!-- Company Description -->
    <div
      v-if="employer.bio_short || employer.bio_long"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">About Our Company</h3>
      <p class="profile-content-text">
        {{ employer.bio_long || employer.bio_short }}
      </p>
    </div>

    <!-- Business Stats -->
    <div v-if="hasBusinessStats" class="profile-content-section">
      <h3 class="profile-content-title">Company Overview</h3>
      <div class="stats-grid">
        <div v-if="employer.employee_count" class="stat-item">
          <UIcon name="i-heroicons-users" class="stat-icon" />
          <span class="stat-value">{{ employer.employee_count }}</span>
          <span class="stat-label">Employees</span>
        </div>
        <div v-if="employer.years_established" class="stat-item">
          <UIcon name="i-heroicons-calendar" class="stat-icon" />
          <span class="stat-value">{{ employer.years_established }}</span>
          <span class="stat-label">Years Established</span>
        </div>
        <div v-if="employer.covers_per_service" class="stat-item">
          <UIcon name="i-heroicons-chart-bar" class="stat-icon" />
          <span class="stat-value">{{ employer.covers_per_service }}</span>
          <span class="stat-label">Covers/Service</span>
        </div>
        <div v-if="employer.total_jobs_posted" class="stat-item">
          <UIcon name="i-heroicons-briefcase" class="stat-icon" />
          <span class="stat-value">{{ employer.total_jobs_posted }}</span>
          <span class="stat-label">Jobs Posted</span>
        </div>
      </div>
    </div>

    <!-- Specialties & Cuisine Types -->
    <div
      v-if="employer.specialties?.length || employer.cuisine_types?.length"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Specialties & Cuisine</h3>

      <div v-if="employer.specialties?.length" class="specialties-section">
        <h4 class="specialties-subtitle">Business Specialties</h4>
        <div class="specialties-grid">
          <UBadge
            v-for="specialty in employer.specialties"
            :key="specialty"
            variant="soft"
            size="md"
          >
            {{ specialty }}
          </UBadge>
        </div>
      </div>

      <div v-if="employer.cuisine_types?.length" class="specialties-section">
        <h4 class="specialties-subtitle">Cuisine Types</h4>
        <div class="specialties-grid">
          <UBadge
            v-for="cuisine in employer.cuisine_types"
            :key="cuisine"
            variant="outline"
            size="md"
          >
            {{ cuisine }}
          </UBadge>
        </div>
      </div>

      <div
        v-if="employer.establishment_type?.length"
        class="specialties-section"
      >
        <h4 class="specialties-subtitle">Establishment Type</h4>
        <div class="specialties-grid">
          <UBadge
            v-for="type in employer.establishment_type"
            :key="type"
            variant="subtle"
            size="md"
          >
            {{ type }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Active Jobs -->
    <div v-if="employer.active_jobs?.length" class="profile-content-section">
      <h3 class="profile-content-title">Current Job Openings</h3>
      <div class="jobs-grid">
        <div v-for="job in employer.active_jobs" :key="job.id" class="job-item">
          <div class="job-header">
            <h4 class="job-title">{{ job.title }}</h4>
            <UBadge :variant="getJobTypeVariant(job.type)" size="sm">{{
              job.type
            }}</UBadge>
          </div>
          <p class="job-location">{{ job.location }}</p>
          <p v-if="job.salary_range" class="job-salary">
            {{ job.salary_range }}
          </p>
          <p class="job-description">{{ job.description }}</p>
          <div v-if="job.requirements?.length" class="job-requirements">
            <h5 class="requirements-title">Requirements:</h5>
            <ul class="requirements-list">
              <li v-for="req in job.requirements" :key="req">{{ req }}</li>
            </ul>
          </div>
          <p class="job-posted">Posted: {{ formatDate(job.posted_at) }}</p>
        </div>
      </div>
    </div>

    <!-- Operating Hours -->
    <div v-if="employer.operating_hours" class="profile-content-section">
      <h3 class="profile-content-title">Operating Hours</h3>
      <div class="hours-grid">
        <div
          v-for="(hours, day) in employer.operating_hours"
          :key="day"
          class="hours-item"
        >
          <span class="day-name">{{ formatDayName(day) }}</span>
          <span v-if="hours.closed" class="hours-closed">Closed</span>
          <span v-else class="hours-time"
            >{{ hours.open }} - {{ hours.close }}</span
          >
        </div>
      </div>
    </div>

    <!-- Contact Information -->
    <div v-if="employer.contacts?.length" class="profile-content-section">
      <h3 class="profile-content-title">Contact Information</h3>
      <div class="contacts-grid">
        <div
          v-for="contact in employer.contacts"
          :key="contact.email"
          class="contact-item"
        >
          <h4 class="contact-name">{{ contact.name }}</h4>
          <p class="contact-title">{{ contact.title }}</p>
          <p class="contact-email">{{ contact.email }}</p>
          <p v-if="contact.phone" class="contact-phone">{{ contact.phone }}</p>
        </div>
      </div>
    </div>

    <!-- Social Media -->
    <div
      v-if="employer.social_media && hasSocialMedia"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Follow Us</h3>
      <div class="social-media-grid">
        <a
          v-if="employer.social_media.instagram"
          :href="employer.social_media.instagram"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-instagram" />
          Instagram
        </a>
        <a
          v-if="employer.social_media.facebook"
          :href="employer.social_media.facebook"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-facebook" />
          Facebook
        </a>
        <a
          v-if="employer.social_media.linkedin"
          :href="employer.social_media.linkedin"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-linkedin" />
          LinkedIn
        </a>
        <a
          v-if="employer.social_media.twitter"
          :href="employer.social_media.twitter"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-twitter" />
          Twitter
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  employer: {
    type: Object,
    required: true,
  },
})

// Computed properties
const hasBusinessStats = computed(() => {
  return (
    employer.value?.employee_count ||
    employer.value?.years_established ||
    employer.value?.covers_per_service ||
    employer.value?.total_jobs_posted
  )
})

const hasSocialMedia = computed(() => {
  const social = employer.value?.social_media
  return (
    social?.instagram || social?.facebook || social?.linkedin || social?.twitter
  )
})

// Helper functions
function getInitials(name) {
  if (!name) return 'E'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatLocation(location) {
  if (!location?.locations?.length) return ''
  return location.locations[0].formatted_address
}

function getJobTypeVariant(type) {
  const variants = {
    'full-time': 'solid',
    'part-time': 'soft',
    contract: 'outline',
    temporary: 'subtle',
  }
  return variants[type] || 'outline'
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}

function formatDayName(day) {
  const days = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  }
  return days[day.toLowerCase()] || day
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
  @apply space-y-2;
}

.specialties-subtitle {
  @apply font-medium text-gray-700;
}

.specialties-grid {
  @apply flex flex-wrap gap-2;
}

.jobs-grid {
  @apply space-y-6;
}

.job-item {
  @apply border border-gray-200 rounded-lg p-4 space-y-3;
}

.job-header {
  @apply flex justify-between items-start;
}

.job-title {
  @apply font-semibold text-lg text-gray-900;
}

.job-location,
.job-salary {
  @apply text-gray-600;
}

.job-description {
  @apply text-gray-700;
}

.job-requirements {
  @apply space-y-2;
}

.requirements-title {
  @apply font-medium text-gray-700;
}

.requirements-list {
  @apply list-disc list-inside space-y-1 text-gray-600;
}

.job-posted {
  @apply text-sm text-gray-500;
}

.hours-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-2;
}

.hours-item {
  @apply flex justify-between py-2 border-b border-gray-100;
}

.day-name {
  @apply font-medium text-gray-700;
}

.hours-closed {
  @apply text-gray-500;
}

.hours-time {
  @apply text-gray-600;
}

.contacts-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.contact-item {
  @apply space-y-1;
}

.contact-name {
  @apply font-semibold text-gray-900;
}

.contact-title,
.contact-email,
.contact-phone {
  @apply text-gray-600;
}

.social-media-grid {
  @apply flex flex-wrap gap-4;
}

.social-link {
  @apply flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors;
}
</style>
