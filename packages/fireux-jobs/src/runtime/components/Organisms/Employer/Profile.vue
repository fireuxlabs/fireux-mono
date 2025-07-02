<template>
  <div v-if="employer" class="profile-display-card">
    <!-- Company Header -->
    <div class="profile-header">
      <div class="profile-avatar-section">
        <UAvatar
          :src="employer.logoUrl"
          :alt="employer.companyName || 'Company Logo'"
          size="xl"
        />
      </div>
      <div class="profile-info-section">
        <h1 class="profile-name">
          {{ employer.companyName || 'Company' }}
        </h1>
        <p v-if="employer.website" class="profile-website">
          <UIcon name="i-heroicons-globe-alt" />
          <a
            :href="employer.website"
            target="_blank"
            rel="noopener noreferrer"
            class="website-link"
          >
            {{ employer.website }}
          </a>
        </p>
        <p v-if="employer.contactEmail" class="profile-contact">
          <UIcon name="i-heroicons-envelope" />
          {{ employer.contactEmail }}
        </p>
      </div>
    </div>

    <!-- Company Description -->
    <div v-if="employer.description" class="profile-content-section">
      <h3 class="profile-content-title">About Our Company</h3>
      <p class="profile-content-text">
        {{ employer.description }}
      </p>
    </div>

    <!-- Company Stats (if we add more fields later) -->
    <div class="profile-content-section">
      <h3 class="profile-content-title">Company Information</h3>
      <div class="company-stats">
        <div class="stat-item">
          <UIcon name="i-heroicons-calendar" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-label">Member Since</span>
            <span class="stat-value">
              {{ formatDate(employer.createdAt) }}
            </span>
          </div>
        </div>

        <div v-if="employer.website" class="stat-item">
          <UIcon name="i-heroicons-globe-alt" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-label">Website</span>
            <a
              :href="employer.website"
              target="_blank"
              rel="noopener noreferrer"
              class="stat-link"
            >
              {{ getWebsiteDomain(employer.website) }}
            </a>
          </div>
        </div>

        <div v-if="employer.industry" class="stat-item">
          <UIcon name="i-heroicons-building-storefront" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-label">Industry</span>
            <span class="stat-value">
              {{ employer.industry }}
            </span>
          </div>
        </div>

        <div v-if="employer.companySize" class="stat-item">
          <UIcon name="i-heroicons-users" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-label">Company Size</span>
            <span class="stat-value">
              {{ employer.companySize }}
            </span>
          </div>
        </div>

        <div v-if="employer.foundedYear" class="stat-item">
          <UIcon name="i-heroicons-calendar" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-label">Founded</span>
            <span class="stat-value">
              {{ employer.foundedYear }}
            </span>
          </div>
        </div>

        <div v-if="employer.address" class="stat-item">
          <UIcon name="i-heroicons-map-pin" class="stat-icon" />
          <div class="stat-content">
            <span class="stat-label">Address</span>
            <span class="stat-value">
              {{ employer.address }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Section -->
    <div class="profile-content-section">
      <h3 class="profile-content-title">Get In Touch</h3>
      <div class="contact-methods">
        <div v-if="employer.contactEmail" class="contact-item">
          <UIcon name="i-heroicons-envelope" class="contact-icon" />
          <div class="contact-content">
            <span class="contact-label">Email</span>
            <a :href="`mailto:${employer.contactEmail}`" class="contact-link">
              {{ employer.contactEmail }}
            </a>
          </div>
        </div>

        <div v-if="employer.website" class="contact-item">
          <UIcon name="i-heroicons-globe-alt" class="contact-icon" />
          <div class="contact-content">
            <span class="contact-label">Website</span>
            <a
              :href="employer.website"
              target="_blank"
              rel="noopener noreferrer"
              class="contact-link"
            >
              Visit Website
            </a>
          </div>
        </div>

        <div v-if="employer.phone" class="contact-item">
          <UIcon name="i-heroicons-phone" class="contact-icon" />
          <div class="contact-content">
            <span class="contact-label">Phone</span>
            <a :href="`tel:${employer.phone}`" class="contact-link">
              {{ employer.phone }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Person Section -->
    <div class="profile-content-section">
      <h3 class="profile-content-title">Contact Person</h3>
      <div class="contact-person-info">
        <div class="contact-person-avatar">
          <UAvatar :src="appUser?.avatar" :alt="getFullName" size="md" />
        </div>
        <div class="contact-person-details">
          <h4 class="contact-person-name">{{ getFullName }}</h4>
          <p v-if="appUser?.email" class="contact-person-email">
            <UIcon name="i-heroicons-envelope" />
            {{ appUser.email }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="profile-loading-state">
      <div class="profile-loading-content">
        <UIcon
          name="i-heroicons-building-office"
          class="profile-loading-icon"
        />
        <p>Loading company profile...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Employer } from '../../../models/Employer.model'

interface Props {
  employer?: Employer | null
}

defineProps<Props>()

// Get AppUser data for contact person info
const { appUser } = useAppUser()

// Helper to get full display name from AppUser
const getFullName = computed(() => {
  if (!appUser.value) return 'Loading...'
  const { first_name, middle_name, last_name } = appUser.value
  return (
    [first_name, middle_name, last_name].filter(Boolean).join(' ') ||
    'Contact Person'
  )
})

// Utility functions
const formatDate = (date: Date | string) => {
  if (!date) return 'Unknown'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })
}

const getWebsiteDomain = (url: string) => {
  try {
    const domain = new URL(url).hostname
    return domain.replace('www.', '')
  } catch {
    return url
  }
}
</script>

<style scoped>
/* Employer Profile Display Component */

.profile-website {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.website-link {
  color: var(--primary-600);
  text-decoration: none;
  transition: color 0.2s ease;
}

.website-link:hover {
  color: var(--primary-700);
  text-decoration: underline;
}

.profile-contact {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: var(--space-1);
}

.company-stats,
.contact-methods {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stat-item,
.contact-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
}

.stat-icon,
.contact-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-600);
  margin-top: 0.125rem;
}

.stat-content,
.contact-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  flex: 1;
}

.stat-label,
.contact-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.stat-value {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-link,
.contact-link {
  font-size: 0.875rem;
  color: var(--primary-600);
  text-decoration: none;
  transition: color 0.2s ease;
}

.stat-link:hover,
.contact-link:hover {
  color: var(--primary-700);
  text-decoration: underline;
}

.contact-person-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
}

.contact-person-avatar {
  flex-shrink: 0;
}

.contact-person-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.contact-person-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.contact-person-email {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .company-stats,
  .contact-methods {
    gap: var(--space-2);
  }

  .stat-item,
  .contact-item {
    padding: var(--space-2);
  }
}

@media (max-width: 640px) {
  .stat-item,
  .contact-item {
    align-items: center;
  }

  .stat-content,
  .contact-content {
    gap: 0;
  }

  .stat-label,
  .contact-label {
    font-size: 0.75rem;
    opacity: 0.8;
  }
}
</style>
