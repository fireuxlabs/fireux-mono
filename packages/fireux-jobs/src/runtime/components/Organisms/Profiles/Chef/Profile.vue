<template>
  <div v-if="chef" class="profile-display-card">
    <!-- Chef Header -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <UAvatar
          :src="chef.avatarUrl"
          :alt="chef.displayName"
          size="2xl"
          :text="getInitials(chef.displayName)"
        />
        <div v-if="chef.verified" class="profile-verified">
          <UIcon name="i-heroicons-check-badge" class="text-green-500" />
          <span class="text-sm text-green-600">Verified Chef</span>
        </div>
      </div>

      <div class="profile-info-section">
        <h1 class="profile-name">{{ chef.displayName }}</h1>
        <p v-if="chef.chef_title" class="profile-subtitle">
          {{ chef.chef_title }}
        </p>
        <p v-if="chef.cuisine_specialization" class="profile-specialization">
          Specializing in {{ chef.cuisine_specialization }}
        </p>

        <div class="profile-contact-info">
          <p v-if="chef.email" class="profile-contact">
            <UIcon name="i-heroicons-envelope" />
            {{ chef.email }}
          </p>
          <p v-if="chef.website" class="profile-contact">
            <UIcon name="i-heroicons-globe-alt" />
            <a
              :href="chef.website"
              target="_blank"
              class="text-blue-600 hover:underline"
            >
              {{ chef.website }}
            </a>
          </p>
        </div>

        <!-- Location Info -->
        <div v-if="chef.availability_location?.length" class="profile-location">
          <UIcon name="i-heroicons-map-pin" />
          <span>{{ chef.availability_location.join(', ') }}</span>
        </div>
      </div>
    </div>

    <!-- Chef Bio -->
    <div v-if="chef.bio_short || chef.bio_long" class="profile-content-section">
      <h3 class="profile-content-title">
        About Chef {{ chef.displayName?.split(' ')[0] }}
      </h3>
      <p class="profile-content-text">
        {{ chef.bio_long || chef.bio_short }}
      </p>
    </div>

    <!-- Chef Stats -->
    <div v-if="hasChefStats" class="profile-content-section">
      <h3 class="profile-content-title">Chef Profile</h3>
      <div class="stats-grid">
        <div v-if="chef.years_experience" class="stat-item">
          <UIcon name="i-heroicons-star" class="stat-icon" />
          <span class="stat-value">{{ chef.years_experience }}</span>
          <span class="stat-label">Years Experience</span>
        </div>
        <div v-if="chef.signature_dishes?.length" class="stat-item">
          <UIcon name="i-heroicons-sparkles" class="stat-icon" />
          <span class="stat-value">{{ chef.signature_dishes.length }}</span>
          <span class="stat-label">Signature Dishes</span>
        </div>
        <div v-if="chef.recipes?.length" class="stat-item">
          <UIcon name="i-heroicons-book-open" class="stat-icon" />
          <span class="stat-value">{{ chef.recipes.length }}</span>
          <span class="stat-label">Recipes</span>
        </div>
        <div v-if="chef.hourly_rate" class="stat-item">
          <UIcon name="i-heroicons-currency-dollar" class="stat-icon" />
          <span class="stat-value">${{ chef.hourly_rate }}</span>
          <span class="stat-label">Hourly Rate</span>
        </div>
      </div>
    </div>

    <!-- Service Types & Specialties -->
    <div
      v-if="
        chef.service_types?.length ||
        chef.specialties?.length ||
        chef.cuisine_types?.length
      "
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Services & Specialties</h3>

      <div v-if="chef.service_types?.length" class="specialties-section">
        <h4 class="specialties-subtitle">Service Types</h4>
        <div class="specialties-grid">
          <UBadge
            v-for="service in chef.service_types"
            :key="service"
            variant="solid"
            size="md"
          >
            {{ service }}
          </UBadge>
        </div>
      </div>

      <div v-if="chef.specialties?.length" class="specialties-section">
        <h4 class="specialties-subtitle">Culinary Specialties</h4>
        <div class="specialties-grid">
          <UBadge
            v-for="specialty in chef.specialties"
            :key="specialty"
            variant="soft"
            size="md"
          >
            {{ specialty }}
          </UBadge>
        </div>
      </div>

      <div v-if="chef.cuisine_types?.length" class="specialties-section">
        <h4 class="specialties-subtitle">Cuisine Types</h4>
        <div class="specialties-grid">
          <UBadge
            v-for="cuisine in chef.cuisine_types"
            :key="cuisine"
            variant="outline"
            size="md"
          >
            {{ cuisine }}
          </UBadge>
        </div>
      </div>

      <div v-if="chef.signature_dishes?.length" class="specialties-section">
        <h4 class="specialties-subtitle">Signature Dishes</h4>
        <div class="specialties-grid">
          <UBadge
            v-for="dish in chef.signature_dishes"
            :key="dish"
            variant="subtle"
            size="md"
          >
            {{ dish }}
          </UBadge>
        </div>
      </div>
    </div>

    <!-- Culinary Experience -->
    <div v-if="chef.experience?.length" class="profile-content-section">
      <h3 class="profile-content-title">Culinary Experience</h3>
      <div class="experience-timeline">
        <div
          v-for="exp in chef.experience"
          :key="exp.restaurant"
          class="experience-item"
        >
          <div class="experience-header">
            <h4 class="experience-title">{{ exp.position }}</h4>
            <span class="experience-duration">{{
              formatDateRange(exp.start_date, exp.end_date)
            }}</span>
          </div>
          <p class="experience-restaurant">{{ exp.restaurant }}</p>
          <p v-if="exp.location" class="experience-location">
            {{ exp.location }}
          </p>
          <p v-if="exp.description" class="experience-description">
            {{ exp.description }}
          </p>
          <div v-if="exp.achievements?.length" class="experience-achievements">
            <h5 class="achievements-title">Key Achievements:</h5>
            <ul class="achievements-list">
              <li v-for="achievement in exp.achievements" :key="achievement">
                {{ achievement }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Education & Certifications -->
    <div
      v-if="chef.education?.length || chef.certifications?.length"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Education & Certifications</h3>

      <div v-if="chef.education?.length" class="education-section">
        <h4 class="section-subtitle">Culinary Education</h4>
        <div class="education-grid">
          <div
            v-for="edu in chef.education"
            :key="edu.school"
            class="education-item"
          >
            <h5 class="education-degree">{{ edu.degree }}</h5>
            <p class="education-school">{{ edu.school }}</p>
            <p class="education-year">{{ edu.graduation_year }}</p>
            <p v-if="edu.honors" class="education-honors">{{ edu.honors }}</p>
          </div>
        </div>
      </div>

      <div v-if="chef.certifications?.length" class="certifications-section">
        <h4 class="section-subtitle">Professional Certifications</h4>
        <div class="certifications-grid">
          <div
            v-for="cert in chef.certifications"
            :key="cert.name"
            class="certification-item"
          >
            <h5 class="certification-name">{{ cert.name }}</h5>
            <p class="certification-issuer">{{ cert.issuing_organization }}</p>
            <p class="certification-year">{{ cert.year_obtained }}</p>
            <p v-if="cert.expiry_date" class="certification-expiry">
              Expires: {{ formatDate(cert.expiry_date) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recipes -->
    <div v-if="chef.recipes?.length" class="profile-content-section">
      <h3 class="profile-content-title">Featured Recipes</h3>
      <div class="recipes-grid">
        <div
          v-for="recipe in chef.recipes.slice(0, 6)"
          :key="recipe.name"
          class="recipe-item"
        >
          <div class="recipe-header">
            <h4 class="recipe-name">{{ recipe.name }}</h4>
            <div class="recipe-meta">
              <span v-if="recipe.prep_time" class="recipe-time">
                <UIcon name="i-heroicons-clock" />
                {{ recipe.prep_time + recipe.cook_time }} min
              </span>
              <span v-if="recipe.difficulty" class="recipe-difficulty">
                {{ recipe.difficulty }}
              </span>
            </div>
          </div>
          <p v-if="recipe.description" class="recipe-description">
            {{ recipe.description }}
          </p>
          <div v-if="recipe.cuisine_type" class="recipe-cuisine">
            <UBadge variant="outline" size="sm">{{
              recipe.cuisine_type
            }}</UBadge>
          </div>
        </div>
      </div>
    </div>

    <!-- Availability -->
    <div v-if="chef.availability_schedule" class="profile-content-section">
      <h3 class="profile-content-title">Availability</h3>
      <div class="availability-info">
        <p class="availability-note">{{ chef.availability_schedule }}</p>
        <div v-if="chef.minimum_notice" class="availability-notice">
          <UIcon name="i-heroicons-information-circle" />
          <span>Minimum {{ chef.minimum_notice }} notice required</span>
        </div>
      </div>
    </div>

    <!-- Social Media -->
    <div
      v-if="chef.social_media && hasSocialMedia"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">
        Follow Chef {{ chef.displayName?.split(' ')[0] }}
      </h3>
      <div class="social-media-grid">
        <a
          v-if="chef.social_media.instagram"
          :href="chef.social_media.instagram"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-instagram" />
          Instagram
        </a>
        <a
          v-if="chef.social_media.youtube"
          :href="chef.social_media.youtube"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-youtube" />
          YouTube
        </a>
        <a
          v-if="chef.social_media.tiktok"
          :href="chef.social_media.tiktok"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-tiktok" />
          TikTok
        </a>
        <a
          v-if="chef.social_media.facebook"
          :href="chef.social_media.facebook"
          target="_blank"
          class="social-link"
        >
          <UIcon name="i-simple-icons-facebook" />
          Facebook
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  chef: {
    type: Object,
    required: true,
  },
})

// Computed properties
const hasChefStats = computed(() => {
  return (
    chef.value?.years_experience ||
    chef.value?.signature_dishes?.length ||
    chef.value?.recipes?.length ||
    chef.value?.hourly_rate
  )
})

const hasSocialMedia = computed(() => {
  const social = chef.value?.social_media
  return (
    social?.instagram || social?.youtube || social?.tiktok || social?.facebook
  )
})

// Helper functions
function getInitials(name) {
  if (!name) return 'C'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatDateRange(startDate, endDate) {
  if (!startDate) return ''
  const start = new Date(startDate).getFullYear()
  const end = endDate ? new Date(endDate).getFullYear() : 'Present'
  return `${start} - ${end}`
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.profile-display-card {
  max-width: 56rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-start;
}

@media (min-width: 640px) {
  .profile-header {
    flex-direction: row;
  }
}

.profile-avatar-section {
  flex-shrink: 0;
  text-align: center;
}

.profile-verified {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.profile-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.profile-name {
  font-size: 1.875rem;
  font-weight: 700;
  color: rgb(17 24 39);
}

.profile-subtitle,
.profile-specialization {
  font-size: 1.25rem;
  color: rgb(75 85 99);
}

.profile-contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-contact,
.profile-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(107 114 128);
}

.profile-content-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-content-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(17 24 39);
  border-bottom: 1px solid rgb(229 231 235);
  padding-bottom: 0.5rem;
}

.profile-content-text {
  color: rgb(55 65 81);
  line-height: 1.625;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: rgb(249 250 251);
  border-radius: 0.5rem;
}

.stat-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: rgb(107 114 128);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: rgb(17 24 39);
}

.stat-label {
  font-size: 0.875rem;
  color: rgb(107 114 128);
}

.specialties-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.specialties-subtitle,
.section-subtitle {
  font-weight: 500;
  color: rgb(55 65 81);
}

.specialties-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.experience-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.experience-item {
  border-left: 4px solid rgb(191 219 254);
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.experience-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.experience-title {
  font-weight: 600;
  font-size: 1.125rem;
  color: rgb(17 24 39);
}

.experience-duration {
  font-size: 0.875rem;
  color: rgb(107 114 128);
  font-weight: 500;
}

.experience-restaurant {
  font-weight: 500;
  color: rgb(55 65 81);
}

.experience-location,
.experience-description {
  color: rgb(75 85 99);
}

.experience-achievements {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.achievements-title {
  font-weight: 500;
  color: rgb(55 65 81);
}

.achievements-list {
  list-style-type: disc;
  list-style-position: inside;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: rgb(75 85 99);
}

.education-section,
.certifications-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.education-grid,
.certifications-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .education-grid,
  .certifications-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.education-item,
.certification-item {
  padding: 1rem;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.5rem;
}

.education-degree,
.certification-name {
  font-weight: 600;
  color: rgb(17 24 39);
}

.education-school,
.certification-issuer {
  color: rgb(55 65 81);
}

.education-year,
.certification-year,
.certification-expiry {
  font-size: 0.875rem;
  color: rgb(107 114 128);
}

.education-honors {
  font-size: 0.875rem;
  color: rgb(34 197 94);
  font-weight: 500;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;
}

@media (min-width: 768px) {
  .recipes-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .recipes-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.recipe-item {
  border: 1px solid rgb(229 231 235);
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recipe-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipe-name {
  font-weight: 600;
  color: rgb(17 24 39);
}

.recipe-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: rgb(107 114 128);
}

.recipe-time {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.recipe-description {
  color: rgb(55 65 81);
  font-size: 0.875rem;
}

.availability-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.availability-note {
  color: rgb(55 65 81);
}

.availability-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgb(37 99 235);
}

.social-media-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgb(243 244 246);
  border-radius: 0.5rem;
  transition: background-color 0.15s ease-in-out;
}

.social-link:hover {
  background-color: rgb(229 231 235);
}
</style>
