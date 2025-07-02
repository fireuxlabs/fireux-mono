<template>
  <div v-if="professional" class="profile-display-card">
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <UAvatar
          :src="professional.avatar || appUser?.avatar"
          :alt="getDisplayName"
          size="xl"
        />
      </div>
      <div class="profile-info-section">
        <h1 class="profile-name">
          {{ getDisplayName }}
        </h1>
        <p v-if="professional.title" class="profile-subtitle">
          {{ professional.title }}
        </p>
        <p v-if="appUser?.email" class="profile-contact">
          <UIcon name="i-heroicons-envelope" />
          {{ appUser.email }}
        </p>
      </div>
    </div>

    <!-- Bio Section -->
    <div
      v-if="professional.bio_short || professional.bio_long || professional.bio"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">About</h3>
      <p class="profile-content-text">
        {{
          professional.bio_long || professional.bio_short || professional.bio
        }}
      </p>
    </div>

    <!-- Languages Section -->
    <div
      v-if="professional.languages && professional.languages.length > 0"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Languages</h3>
      <div class="languages-grid">
        <div
          v-for="language in professional.languages"
          :key="language.language"
          class="language-item"
        >
          <span class="language-name">{{ language.language }}</span>
          <span class="language-level">{{ language.proficiency }}</span>
        </div>
      </div>
    </div>

    <!-- Kitchen Experience Section -->
    <div
      v-if="
        professional.kitchen_experience &&
        professional.kitchen_experience.length > 0
      "
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Professional Experience</h3>
      <div class="experience-list">
        <div
          v-for="experience in professional.kitchen_experience"
          :key="`${experience.name}-${experience.from_year}`"
          class="experience-item"
        >
          <div class="experience-header">
            <h4 class="experience-title">{{ experience.role }}</h4>
            <span class="experience-company">{{ experience.name }}</span>
            <span class="experience-period">
              {{ experience.from_year
              }}{{ experience.from_month ? `/${experience.from_month}` : '' }} -
              {{
                experience.ongoing
                  ? 'Present'
                  : `${experience.to_year}${experience.to_month ? `/${experience.to_month}` : ''}`
              }}
            </span>
          </div>
          <p v-if="experience.responsibilities" class="experience-description">
            {{ experience.responsibilities }}
          </p>
          <p v-if="experience.formatted_address" class="experience-location">
            <UIcon name="i-heroicons-map-pin" />
            {{ experience.formatted_address }}
          </p>
        </div>
      </div>
    </div>

    <!-- Education Section -->
    <div
      v-if="professional.education && professional.education.length > 0"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Education</h3>
      <div class="education-list">
        <div
          v-for="education in professional.education"
          :key="`${education.institution}-${education.start_year}`"
          class="education-item"
        >
          <div class="education-header">
            <h4 class="education-degree">{{ education.degree }}</h4>
            <span class="education-institution">{{
              education.institution
            }}</span>
            <span class="education-period">
              {{ education.start_year }} -
              {{ education.ongoing ? 'Present' : education.end_year }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Certifications Section -->
    <div
      v-if="
        professional.certifications && professional.certifications.length > 0
      "
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Certifications</h3>
      <div class="certifications-list">
        <div
          v-for="certification in professional.certifications"
          :key="`${certification.name}-${certification.year}`"
          class="certification-item"
        >
          <div class="certification-header">
            <h4 class="certification-name">{{ certification.name }}</h4>
            <span class="certification-issuer">{{
              certification.place_name
            }}</span>
            <span class="certification-year">{{ certification.year }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Other Employment Experience Section -->
    <div
      v-if="
        professional.other_employment_experience &&
        professional.other_employment_experience.length > 0
      "
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Other Experience</h3>
      <div class="experience-list">
        <div
          v-for="experience in professional.other_employment_experience"
          :key="`${experience.name}-${experience.from_year}`"
          class="experience-item"
        >
          <div class="experience-header">
            <h4 class="experience-title">{{ experience.role }}</h4>
            <span class="experience-company">{{ experience.name }}</span>
            <span class="experience-period">
              {{ experience.from_year }}/{{ experience.from_month }} -
              {{ experience.ongoing ? 'Present' : 'Ended' }}
            </span>
          </div>
          <p v-if="experience.responsibilities" class="experience-description">
            {{ experience.responsibilities }}
          </p>
        </div>
      </div>
    </div>

    <!-- Volunteering Section -->
    <div
      v-if="professional.volunteering && professional.volunteering.length > 0"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Volunteering</h3>
      <div class="experience-list">
        <div
          v-for="volunteer in professional.volunteering"
          :key="`${volunteer.organization}-${volunteer.from_year}`"
          class="experience-item"
        >
          <div class="experience-header">
            <h4 class="experience-title">{{ volunteer.role }}</h4>
            <span class="experience-company">{{ volunteer.organization }}</span>
            <span class="experience-period">
              {{ volunteer.from_year }} -
              {{ volunteer.ongoing ? 'Present' : volunteer.to_year }}
            </span>
          </div>
          <p v-if="volunteer.responsibilities" class="experience-description">
            {{ volunteer.responsibilities }}
          </p>
        </div>
      </div>
    </div>

    <!-- Projects Section -->
    <div
      v-if="professional.projects && professional.projects.length > 0"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Projects</h3>
      <div class="experience-list">
        <div
          v-for="project in professional.projects"
          :key="`${project.name}-${project.from_year}`"
          class="experience-item"
        >
          <div class="experience-header">
            <h4 class="experience-title">{{ project.role }}</h4>
            <span class="experience-company">{{ project.name }}</span>
            <span class="experience-period">
              {{ project.from_year }} -
              {{ project.ongoing ? 'Present' : project.to_year }}
            </span>
          </div>
          <p v-if="project.responsibilities" class="experience-description">
            {{ project.responsibilities }}
          </p>
        </div>
      </div>
    </div>

    <!-- Location Section -->
    <div
      v-if="professional.locations && professional.locations.length > 0"
      class="profile-content-section"
    >
      <h3 class="profile-content-title">Service Areas</h3>
      <div class="locations-list">
        <div
          v-for="locationGroup in professional.locations"
          :key="locationGroup.radius"
          class="location-group"
        >
          <p class="location-radius">
            Within {{ locationGroup.radius }} radius:
          </p>
          <div class="location-items">
            <span
              v-for="location in locationGroup.locations"
              :key="location.formatted_address"
              class="location-item"
            >
              <UIcon name="i-heroicons-map-pin" />
              {{ location.formatted_address }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="profile-loading-state">
      <div class="profile-loading-content">
        <UIcon name="i-heroicons-briefcase" class="profile-loading-icon" />
        <p>Loading professional profile...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Professional } from '../../../models/Professional.model'

interface Props {
  professional?: Professional | null
}

defineProps<Props>()

// Get AppUser data for names and identity
const { appUser } = useAppUser()

// Helper function to get display name from AppUser
const getDisplayName = computed(() => {
  if (!appUser.value) return 'Loading...'
  const { first_name, middle_name, last_name } = appUser.value
  return (
    [first_name, middle_name, last_name].filter(Boolean).join(' ') ||
    'Professional'
  )
})
</script>

<style scoped>
/* Professional Profile Display Component */

.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
}

.language-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-3);
  background-color: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
}

.language-name {
  font-weight: 500;
  color: var(--text-primary);
}

.language-level {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.experience-list,
.education-list,
.certifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.experience-item,
.education-item,
.certification-item {
  padding: var(--space-4);
  background-color: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-lg);
}

.experience-header,
.education-header,
.certification-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-2);
}

.experience-title,
.education-degree,
.certification-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.experience-company,
.education-institution,
.certification-issuer {
  font-weight: 500;
  color: var(--text-secondary);
}

.experience-period,
.education-period,
.certification-year {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.experience-description {
  color: var(--text-secondary);
  line-height: 1.5;
  margin: var(--space-2) 0 0 0;
}

.experience-location {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: var(--space-2);
}

.profile-contact {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.locations-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.location-group {
  padding: var(--space-3);
  background-color: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
}

.location-radius {
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.location-items {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.location-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
  color: var(--text-secondary);
  padding: var(--space-1) var(--space-2);
  background-color: var(--ui-bg);
  border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .languages-grid {
    grid-template-columns: 1fr;
  }

  .experience-item,
  .education-item,
  .certification-item {
    padding: var(--space-3);
  }

  .experience-title,
  .education-degree,
  .certification-name {
    font-size: 1rem;
  }
}

@media (max-width: 640px) {
  .location-items {
    flex-direction: column;
    align-items: stretch;
  }

  .location-item {
    justify-content: flex-start;
  }
}
</style>
