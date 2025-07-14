<template>
  <client-only>
    <UContainer v-if="professional" class="profile-edit-component">
      <!-- Basic Information Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Basic Information</h3>
            <p class="profile-section-description">
              Your core professional details
            </p>
          </div>

          <!-- Name Info Banner -->
          <div class="name-info-banner">
            <div class="banner-content">
              <UIcon
                name="i-heroicons-information-circle"
                class="banner-icon"
              />
              <div class="banner-text">
                <p class="banner-title">
                  Your name is managed in your main profile
                </p>
                <p class="banner-description">
                  To update your name, go to
                  <NuxtLink to="/dashboard/profile" class="banner-link">
                    User Profile Settings
                  </NuxtLink>
                </p>
              </div>
            </div>
            <div class="current-name">
              <span class="name-label">Current Name:</span>
              <span class="name-display">{{ getFullName }}</span>
            </div>
          </div>

          <FireMoleculesFormsFirestoreSingleField
            label="Professional Title"
            :firebase-value="professional.title || ''"
            placeholder="e.g. Senior Chef, Cleaning Specialist, Event Coordinator"
            :update-function="updateTitle"
          />
        </div>
      </UCard>

      <!-- Bio Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">About You</h3>
            <p class="profile-section-description">
              Tell potential employers about yourself
            </p>
          </div>

          <FireMoleculesFormsFirestoreSingleField
            label="Short Bio"
            :firebase-value="professional.bio_short || professional.bio || ''"
            placeholder="A brief summary of your experience and skills (2-3 sentences)"
            field-type="textarea"
            :update-function="updateBioShort"
          />

          <FireMoleculesFormsFirestoreSingleField
            label="Detailed Bio"
            :firebase-value="professional.bio_long || ''"
            placeholder="A comprehensive description of your background, experience, and what makes you unique..."
            field-type="textarea"
            :update-function="updateBioLong"
          />
        </div>
      </UCard>

      <!-- Contact Information Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Contact Information</h3>
            <p class="profile-section-description">
              How employers can reach you
            </p>
          </div>

          <FireMoleculesFormsFirestoreSingleField
            label="Contact Email"
            :firebase-value="professional.email || ''"
            placeholder="your.professional@email.com"
            :update-function="updateEmail"
          />
        </div>
      </UCard>

      <!-- Skills & Languages Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Skills & Languages</h3>
            <p class="profile-section-description">
              Your capabilities and language proficiencies
            </p>
          </div>

          <!-- Languages Array Field -->
          <div class="array-field-section">
            <h4 class="array-field-title">Languages</h4>
            <div
              v-if="professional.languages && professional.languages.length > 0"
              class="array-items"
            >
              <div
                v-for="(language, index) in professional.languages"
                :key="index"
                class="array-item"
              >
                <div class="array-item-content">
                  <span class="array-item-label">{{ language.language }}</span>
                  <span class="array-item-detail">{{
                    language.proficiency
                  }}</span>
                </div>
                <UButton
                  icon="i-heroicons-trash"
                  size="xs"
                  color="red"
                  variant="ghost"
                  @click="removeLanguage(index)"
                />
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No languages added yet</p>
            </div>

            <!-- Add Language Form -->
            <div class="add-item-form">
              <div class="add-item-fields">
                <UInput
                  v-model="newLanguage.language"
                  placeholder="Language (e.g. Spanish, French)"
                  class="flex-1"
                />
                <USelect
                  v-model="newLanguage.proficiency"
                  :options="proficiencyOptions"
                  placeholder="Proficiency"
                  class="flex-1"
                />
              </div>
              <UButton
                @click="addLanguage"
                :disabled="!newLanguage.language || !newLanguage.proficiency"
                icon="i-heroicons-plus"
                size="sm"
              >
                Add Language
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Kitchen Experience Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Kitchen Experience</h3>
            <p class="profile-section-description">
              Your professional culinary experience
            </p>
          </div>

          <div class="array-field-section">
            <h4 class="array-field-title">Work Experience</h4>
            <div
              v-if="
                professional.kitchen_experience &&
                professional.kitchen_experience.length > 0
              "
              class="array-items"
            >
              <div
                v-for="(experience, index) in professional.kitchen_experience"
                :key="index"
                class="array-item experience-item"
              >
                <div class="array-item-content">
                  <span class="array-item-label">{{ experience.name }}</span>
                  <span class="array-item-detail">{{ experience.role }}</span>
                  <span class="array-item-meta">
                    {{ experience.from_year
                    }}{{
                      experience.from_month ? `/${experience.from_month}` : ''
                    }}
                    -
                    {{
                      experience.ongoing
                        ? 'Present'
                        : `${experience.to_year}${experience.to_month ? `/${experience.to_month}` : ''}`
                    }}
                  </span>
                  <p class="experience-description">
                    {{ experience.responsibilities }}
                  </p>
                </div>
                <UButton
                  icon="i-heroicons-trash"
                  size="xs"
                  color="red"
                  variant="ghost"
                  @click="removeKitchenExperience(index)"
                />
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No kitchen experience added yet</p>
            </div>

            <!-- Add Experience Form -->
            <div class="add-item-form experience-form">
              <div class="add-item-fields">
                <UInput
                  v-model="newKitchenExperience.name"
                  placeholder="Restaurant/Company Name"
                  class="flex-1"
                />
                <UInput
                  v-model="newKitchenExperience.role"
                  placeholder="Position/Role"
                  class="flex-1"
                />
              </div>

              <div class="date-fields">
                <div class="date-range">
                  <UInput
                    v-model="newKitchenExperience.from_year"
                    placeholder="From Year"
                    type="number"
                    class="year-input"
                  />
                  <USelect
                    v-model="newKitchenExperience.from_month"
                    :options="monthOptions"
                    placeholder="Month"
                    class="month-input"
                  />
                </div>

                <div class="date-range" v-if="!newKitchenExperience.ongoing">
                  <UInput
                    v-model="newKitchenExperience.to_year"
                    placeholder="To Year"
                    type="number"
                    class="year-input"
                  />
                  <USelect
                    v-model="newKitchenExperience.to_month"
                    :options="monthOptions"
                    placeholder="Month"
                    class="month-input"
                  />
                </div>

                <UCheckbox
                  v-model="newKitchenExperience.ongoing"
                  label="Currently working here"
                />
              </div>

              <UTextarea
                v-model="newKitchenExperience.responsibilities"
                placeholder="Describe your responsibilities and achievements..."
                rows="3"
              />

              <UButton
                @click="addKitchenExperience"
                :disabled="!isKitchenExperienceValid"
                icon="i-heroicons-plus"
                size="sm"
              >
                Add Experience
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Education Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Education</h3>
            <p class="profile-section-description">
              Your educational background
            </p>
          </div>

          <div class="array-field-section">
            <h4 class="array-field-title">Educational Background</h4>
            <div
              v-if="professional.education && professional.education.length > 0"
              class="array-items"
            >
              <div
                v-for="(education, index) in professional.education"
                :key="index"
                class="array-item"
              >
                <div class="array-item-content">
                  <span class="array-item-label">{{
                    education.institution
                  }}</span>
                  <span class="array-item-detail">{{ education.degree }}</span>
                  <span class="array-item-meta">
                    {{ education.start_year }} -
                    {{ education.ongoing ? 'Present' : education.end_year }}
                  </span>
                </div>
                <UButton
                  icon="i-heroicons-trash"
                  size="xs"
                  color="red"
                  variant="ghost"
                  @click="removeEducation(index)"
                />
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No education added yet</p>
            </div>

            <!-- Add Education Form -->
            <div class="add-item-form">
              <div class="add-item-fields">
                <UInput
                  v-model="newEducation.institution"
                  placeholder="Institution Name"
                  class="flex-1"
                />
                <UInput
                  v-model="newEducation.degree"
                  placeholder="Degree/Certificate"
                  class="flex-1"
                />
              </div>

              <div class="date-fields">
                <UInput
                  v-model="newEducation.start_year"
                  placeholder="Start Year"
                  type="number"
                  class="year-input"
                />
                <UInput
                  v-model="newEducation.end_year"
                  placeholder="End Year"
                  type="number"
                  class="year-input"
                  :disabled="newEducation.ongoing"
                />
                <UCheckbox
                  v-model="newEducation.ongoing"
                  label="Currently enrolled"
                />
              </div>

              <UButton
                @click="addEducation"
                :disabled="!isEducationValid"
                icon="i-heroicons-plus"
                size="sm"
              >
                Add Education
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Certifications Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Certifications</h3>
            <p class="profile-section-description">
              Your professional certifications and credentials
            </p>
          </div>

          <div class="array-field-section">
            <h4 class="array-field-title">Professional Certifications</h4>
            <div
              v-if="
                professional.certifications &&
                professional.certifications.length > 0
              "
              class="array-items"
            >
              <div
                v-for="(certification, index) in professional.certifications"
                :key="index"
                class="array-item"
              >
                <div class="array-item-content">
                  <span class="array-item-label">{{ certification.name }}</span>
                  <span class="array-item-detail">{{
                    certification.place_name
                  }}</span>
                  <span class="array-item-meta">{{ certification.year }}</span>
                </div>
                <UButton
                  icon="i-heroicons-trash"
                  size="xs"
                  color="red"
                  variant="ghost"
                  @click="removeCertification(index)"
                />
              </div>
            </div>
            <div v-else class="empty-state">
              <p>No certifications added yet</p>
            </div>

            <!-- Add Certification Form -->
            <div class="add-item-form">
              <div class="add-item-fields">
                <UInput
                  v-model="newCertification.name"
                  placeholder="Certification Name"
                  class="flex-1"
                />
                <UInput
                  v-model="newCertification.place_name"
                  placeholder="Issuing Organization"
                  class="flex-1"
                />
                <UInput
                  v-model="newCertification.year"
                  placeholder="Year"
                  type="number"
                  class="year-input"
                />
              </div>

              <UButton
                @click="addCertification"
                :disabled="!isCertificationValid"
                icon="i-heroicons-plus"
                size="sm"
              >
                Add Certification
              </UButton>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Professional Avatar Section -->
      <UCard>
        <div class="space-y-6">
          <div class="profile-section-header">
            <h3 class="profile-section-title">Professional Avatar</h3>
            <p class="profile-section-description">
              Upload a professional photo that represents you in your
              professional capacity
            </p>
          </div>

          <div class="avatar-upload-section">
            <div class="current-avatar">
              <UAvatar
                :src="professional.avatar || appUser?.avatar"
                :alt="getFullName"
                size="xl"
              />
            </div>
            <div class="avatar-info">
              <p class="avatar-description">
                This avatar will be shown on your professional profile. If not
                set, your main profile avatar will be used as fallback.
              </p>
              <!-- Avatar upload functionality can be added here -->
              <UButton
                icon="i-heroicons-camera"
                variant="outline"
                size="sm"
                disabled
              >
                Upload Professional Photo
              </UButton>
              <p class="upload-note">Avatar upload coming soon</p>
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
    <div v-else>
      <UCard>
        <div class="profile-loading-content">
          <UIcon name="i-heroicons-briefcase" class="profile-loading-icon" />
          <p>Loading professional profile...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const { professional, updateProfessional } = useProfessionals()

// Helper functions for name parsing
const getFirstName = (fullName: string): string => {
  if (!fullName) return ''
  const names = fullName.trim().split(' ')
  return names[0] || ''
}

const getLastName = (fullName: string): string => {
  if (!fullName) return ''
  const names = fullName.trim().split(' ')
  return names.length > 1 ? names.slice(1).join(' ') : ''
}

// Individual update functions for each field
const updateFirstName = async (value: string) => {
  await updateProfessional({ first_name: value })
  // Also update full_name for backward compatibility
  const lastName =
    professional.value?.last_name ||
    getLastName(professional.value?.full_name || professional.value?.name || '')
  if (lastName) {
    await updateProfessional({ full_name: `${value} ${lastName}` })
  }
}

const updateLastName = async (value: string) => {
  await updateProfessional({ last_name: value })
  // Also update full_name for backward compatibility
  const firstName =
    professional.value?.first_name ||
    getFirstName(
      professional.value?.full_name || professional.value?.name || ''
    )
  if (firstName) {
    await updateProfessional({ full_name: `${firstName} ${value}` })
  }
}

const updateFullName = async (value: string) => {
  await updateProfessional({ full_name: value })
}

const updateTitle = async (value: string) => {
  await updateProfessional({ title: value })
}

const updateBioShort = async (value: string) => {
  await updateProfessional({ bio_short: value })
}

const updateBioLong = async (value: string) => {
  await updateProfessional({ bio_long: value })
}

const updateEmail = async (value: string) => {
  await updateProfessional({ email: value })
}

// Language management
const newLanguage = ref({
  language: '',
  proficiency: '',
})

const proficiencyOptions = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Native/Fluent',
]

const monthOptions = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
]

const addLanguage = async () => {
  if (!newLanguage.value.language || !newLanguage.value.proficiency) return

  const currentLanguages = professional.value?.languages || []
  const updatedLanguages = [...currentLanguages, { ...newLanguage.value }]

  await updateProfessional({ languages: updatedLanguages })

  // Reset form
  newLanguage.value = {
    language: '',
    proficiency: '',
  }
}

const removeLanguage = async (index: number) => {
  const currentLanguages = professional.value?.languages || []
  const updatedLanguages = currentLanguages.filter(
    (_: any, i: number) => i !== index
  )

  await updateProfessional({ languages: updatedLanguages })
}

// Kitchen Experience management
const newKitchenExperience = ref({
  name: '',
  role: '',
  from_year: '',
  from_month: '',
  to_year: '',
  to_month: '',
  ongoing: false,
  responsibilities: '',
  image_url: '',
  place_id: '',
  formatted_address: '',
  short_address: '',
})

const isKitchenExperienceValid = computed(() => {
  return (
    newKitchenExperience.value.name &&
    newKitchenExperience.value.role &&
    newKitchenExperience.value.from_year &&
    newKitchenExperience.value.responsibilities
  )
})

const addKitchenExperience = async () => {
  if (!isKitchenExperienceValid.value) return

  const currentExperience = professional.value?.kitchen_experience || []
  const updatedExperience = [
    ...currentExperience,
    { ...newKitchenExperience.value },
  ]

  await updateProfessional({ kitchen_experience: updatedExperience })

  // Reset form
  newKitchenExperience.value = {
    name: '',
    role: '',
    from_year: '',
    from_month: '',
    to_year: '',
    to_month: '',
    ongoing: false,
    responsibilities: '',
    image_url: '',
    place_id: '',
    formatted_address: '',
    short_address: '',
  }
}

const removeKitchenExperience = async (index: number) => {
  const currentExperience = professional.value?.kitchen_experience || []
  const updatedExperience = currentExperience.filter(
    (_: any, i: number) => i !== index
  )

  await updateProfessional({ kitchen_experience: updatedExperience })
}

// Education management
const newEducation = ref({
  institution: '',
  degree: '',
  start_year: '',
  end_year: '',
  ongoing: false,
  image_url: '',
  document_url: '',
  formatted_address: '',
})

const isEducationValid = computed(() => {
  return (
    newEducation.value.institution &&
    newEducation.value.degree &&
    newEducation.value.start_year
  )
})

const addEducation = async () => {
  if (!isEducationValid.value) return

  const currentEducation = professional.value?.education || []
  const updatedEducation = [...currentEducation, { ...newEducation.value }]

  await updateProfessional({ education: updatedEducation })

  // Reset form
  newEducation.value = {
    institution: '',
    degree: '',
    start_year: '',
    end_year: '',
    ongoing: false,
    image_url: '',
    document_url: '',
    formatted_address: '',
  }
}

const removeEducation = async (index: number) => {
  const currentEducation = professional.value?.education || []
  const updatedEducation = currentEducation.filter(
    (_: any, i: number) => i !== index
  )

  await updateProfessional({ education: updatedEducation })
}

// Certification management
const newCertification = ref({
  name: '',
  year: '',
  place_name: '',
  image_url: '',
  document_url: '',
  formatted_address: '',
})

const isCertificationValid = computed(() => {
  return (
    newCertification.value.name &&
    newCertification.value.year &&
    newCertification.value.place_name
  )
})

const addCertification = async () => {
  if (!isCertificationValid.value) return

  const currentCertifications = professional.value?.certifications || []
  const updatedCertifications = [
    ...currentCertifications,
    { ...newCertification.value },
  ]

  await updateProfessional({ certifications: updatedCertifications })

  // Reset form
  newCertification.value = {
    name: '',
    year: '',
    place_name: '',
    image_url: '',
    document_url: '',
    formatted_address: '',
  }
}

const removeCertification = async (index: number) => {
  const currentCertifications = professional.value?.certifications || []
  const updatedCertifications = currentCertifications.filter(
    (_: any, i: number) => i !== index
  )

  await updateProfessional({ certifications: updatedCertifications })
}
</script>

<style scoped>
/* Name Info Banner */
.name-info-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background-color: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border-muted);
  border-radius: var(--radius-lg);
  gap: var(--space-4);
}

.banner-content {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 1;
}

.banner-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--primary-600);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.banner-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.banner-title {
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.banner-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.banner-link {
  color: var(--primary-600);
  text-decoration: none;
  font-weight: 500;
}

.banner-link:hover {
  color: var(--primary-700);
  text-decoration: underline;
}

.current-name {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.name-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.name-display {
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .name-info-banner {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .current-name {
    align-items: center;
  }
}

.name-fields-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.array-field-section {
  border: 1px solid var(--ui-border-muted);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  background-color: var(--ui-bg-elevated);
}

.array-field-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.array-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.array-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
  background-color: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: var(--radius-md);
}

.array-item-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.array-item-label {
  font-weight: 500;
  color: var(--text-primary);
}

.array-item-detail {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-secondary);
}

.add-item-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.add-item-fields {
  display: flex;
  gap: var(--space-3);
}

.date-fields {
  display: flex;
  gap: var(--space-3);
}

.date-range {
  display: flex;
  gap: var(--space-2);
}

.year-input {
  width: 120px;
}

.month-input {
  flex: 1;
}

@media (max-width: 640px) {
  .name-fields-container {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .add-item-fields {
    flex-direction: column;
  }

  .array-item {
    padding: var(--space-2);
  }

  .array-item-content {
    min-width: 0;
  }
}

/* Avatar Upload Section */
.avatar-upload-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.current-avatar {
  flex-shrink: 0;
}

.avatar-info {
  flex: 1;
}

.avatar-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 var(--space-3) 0;
}

.upload-note {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin: 0;
}
</style>
