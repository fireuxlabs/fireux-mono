<template>
  <client-only>
    <UContainer v-if="employer" class="profile-edit-component">
      <!-- Company Information Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Company Information</h3>
            <p class="profile-section-description">
              Basic details about your company
            </p>
          </div>

          <!-- Contact Person Info Banner -->
          <div class="name-info-banner">
            <div class="banner-content">
              <UIcon
                name="i-heroicons-information-circle"
                class="banner-icon"
              />
              <div class="banner-text">
                <p class="banner-title">
                  Contact person info is managed in your main profile
                </p>
                <p class="banner-description">
                  Your personal name and details are shown from your
                  <NuxtLink to="/dashboard/profile" class="banner-link">
                    User Profile Settings
                  </NuxtLink>
                </p>
              </div>
            </div>
            <div class="current-name">
              <span class="name-label">Contact Person:</span>
              <span class="name-display">{{ getFullName }}</span>
            </div>
          </div>

          <FireMoleculesFormsFirestoreSingleField
            label="Company Name"
            :firebase-value="employer.companyName || ''"
            placeholder="Enter your company name"
            :update-function="updateCompanyName"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Website"
            :firebase-value="employer.website || ''"
            placeholder="https://www.yourcompany.com"
            :update-function="updateWebsite"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Company Description"
            :firebase-value="employer.description || ''"
            placeholder="Describe your company, what you do, and your values..."
            field-type="textarea"
            :update-function="updateDescription"
          />
        </div>
      </UCard>

      <!-- Contact Information Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Contact Information</h3>
            <p class="profile-section-description">
              How professionals can reach you
            </p>
          </div>

          <FireMoleculesFormsFirestoreSingleField
            label="Contact Email"
            :firebase-value="employer.contactEmail || ''"
            placeholder="contact@yourcompany.com"
            :update-function="updateContactEmail"
          />
        </div>
      </UCard>

      <!-- Company Logo Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Company Logo</h3>
            <p class="profile-section-description">Upload your company logo</p>
          </div>

          <div class="logo-upload-section">
            <div class="current-logo">
              <UAvatar
                :src="employer.logoUrl"
                :alt="employer.companyName || 'Company Logo'"
                size="xl"
              />
            </div>
            <div class="logo-info">
              <p class="logo-description">
                Upload your company logo to be displayed on your employer
                profile and job postings.
              </p>
              <!-- Logo upload functionality can be added here -->
              <UButton
                icon="i-heroicons-building-office"
                variant="outline"
                size="sm"
                disabled
              >
                Upload Company Logo
              </UButton>
              <p class="upload-note">Logo upload coming soon</p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Company Details Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Additional Details</h3>
            <p class="profile-section-description">
              Optional company information
            </p>
          </div>

          <FireMoleculesFormsFirestoreSingleField
            label="Industry"
            :firebase-value="employer.industry || ''"
            placeholder="e.g. Hospitality, Cleaning Services, Event Planning"
            :update-function="updateIndustry"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Company Size"
            :firebase-value="employer.companySize || ''"
            placeholder="e.g. 1-10 employees, 50-100 employees"
            :update-function="updateCompanySize"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Founded Year"
            :firebase-value="employer.foundedYear || ''"
            placeholder="e.g. 2020"
            :update-function="updateFoundedYear"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Address"
            :firebase-value="employer.address || ''"
            placeholder="Company address"
            field-type="textarea"
            :update-function="updateAddress"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Phone Number"
            :firebase-value="employer.phone || ''"
            placeholder="Company phone number"
            :update-function="updatePhone"
          />
        </div>
      </UCard>
    </UContainer>
    <div v-else>
      <UCard>
        <div class="profile-loading-content">
          <UIcon
            name="i-heroicons-building-office"
            class="profile-loading-icon"
          />
          <p>Loading employer profile...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { employer, updateEmployer } = useEmployers()
const { appUser } = useAppUser()

// Helper to get full display name from AppUser
const getFullName = computed(() => {
  if (!appUser.value) return 'Loading...'
  const { first_name, middle_name, last_name } = appUser.value
  return (
    [first_name, middle_name, last_name].filter(Boolean).join(' ') ||
    'No name set'
  )
})

// Individual update functions for each field
const updateCompanyName = async (value: string) => {
  await updateEmployer({ companyName: value })
}

const updateContactEmail = async (value: string) => {
  await updateEmployer({ contactEmail: value })
}

const updateWebsite = async (value: string) => {
  await updateEmployer({ website: value })
}

const updateDescription = async (value: string) => {
  await updateEmployer({ description: value })
}

const updateIndustry = async (value: string) => {
  await updateEmployer({ industry: value })
}

const updateCompanySize = async (value: string) => {
  await updateEmployer({ companySize: value })
}

const updateFoundedYear = async (value: string) => {
  await updateEmployer({ foundedYear: value })
}

const updateAddress = async (value: string) => {
  await updateEmployer({ address: value })
}

const updatePhone = async (value: string) => {
  await updateEmployer({ phone: value })
}
</script>

<style scoped>
/* Employer Edit Component - Uses shared profile styles from profile.scss */

.logo-upload-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--ui-border-muted);
  border-radius: var(--radius-lg);
  background-color: var(--ui-bg-elevated);
}

.current-logo {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .logo-upload-section {
    flex-direction: column;
    text-align: center;
  }
}
</style>
