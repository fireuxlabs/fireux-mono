<template>
  <div class="professional-create-container">
    <UCard class="professional-create-card">
      <template #header>
        <div class="create-header">
          <h2 class="create-title">Create Professional Profile</h2>
          <p class="create-description">
            Set up your professional profile to showcase your skills and find
            job opportunities
          </p>
        </div>
      </template>

      <div class="create-content">
        <div class="user-info-section">
          <h3 class="section-title">Your Information</h3>
          <div class="user-details" v-if="appUser">
            <div class="user-field">
              <span class="field-label">Name:</span>
              <span class="field-value">{{
                appUser.displayName || appUser.email
              }}</span>
            </div>
            <div class="user-field">
              <span class="field-label">Email:</span>
              <span class="field-value">{{ appUser.email }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Professional Details</h3>
          <form @submit.prevent="onCreateProfile" class="create-form">
            <div class="form-grid">
              <!-- Basic Information -->
              <div class="form-group">
                <label for="name" class="form-label">Full Name*</label>
                <UInput
                  id="name"
                  v-model="formData.name"
                  placeholder="Enter your full name"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="title" class="form-label"
                  >Professional Title*</label
                >
                <UInput
                  id="title"
                  v-model="formData.title"
                  placeholder="e.g. Senior Chef, Cleaning Specialist"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="contactEmail" class="form-label"
                  >Contact Email</label
                >
                <UInput
                  id="contactEmail"
                  v-model="formData.contactEmail"
                  type="email"
                  placeholder="Your professional contact email"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="phone" class="form-label">Phone Number</label>
                <UInput
                  id="phone"
                  v-model="formData.phone"
                  placeholder="Your phone number"
                  class="form-input"
                />
              </div>

              <!-- Bio Section -->
              <div class="form-group full-width">
                <label for="bio" class="form-label">Professional Bio</label>
                <UTextarea
                  id="bio"
                  v-model="formData.bio"
                  placeholder="Tell potential employers about your experience and skills..."
                  rows="4"
                  class="form-input"
                />
              </div>

              <!-- Skills Section -->
              <div class="form-group full-width">
                <label for="skills" class="form-label">Skills</label>
                <UInput
                  id="skills"
                  v-model="formData.skills"
                  placeholder="Enter skills separated by commas (e.g. Cooking, Customer Service, Time Management)"
                  class="form-input"
                />
              </div>

              <!-- Experience Section -->
              <div class="form-group full-width">
                <label for="experience" class="form-label"
                  >Years of Experience</label
                >
                <USelect
                  id="experience"
                  v-model="formData.yearsOfExperience"
                  :options="experienceOptions"
                  placeholder="Select your experience level"
                  class="form-input"
                />
              </div>

              <!-- Location Section -->
              <div class="form-group">
                <label for="city" class="form-label">City</label>
                <UInput
                  id="city"
                  v-model="formData.location.city"
                  placeholder="Your city"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label for="state" class="form-label">State/Province</label>
                <UInput
                  id="state"
                  v-model="formData.location.state"
                  placeholder="Your state or province"
                  class="form-input"
                />
              </div>

              <!-- Availability -->
              <div class="form-group">
                <label for="availability" class="form-label"
                  >Availability</label
                >
                <USelect
                  id="availability"
                  v-model="formData.availability"
                  :options="availabilityOptions"
                  placeholder="Select your availability"
                  class="form-input"
                />
              </div>

              <!-- Work Preferences -->
              <div class="form-group">
                <label for="workType" class="form-label"
                  >Preferred Work Type</label
                >
                <USelect
                  id="workType"
                  v-model="formData.workType"
                  :options="workTypeOptions"
                  placeholder="Select preferred work type"
                  class="form-input"
                />
              </div>
            </div>

            <div class="form-actions">
              <UButton
                type="submit"
                :loading="creating"
                :disabled="!isFormValid"
                size="lg"
                class="create-button"
              >
                Create Professional Profile
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { useProfessionals } from '../../../composables/firestore/objects/Professional/useProfessionals'

// Get current user
const { appUser } = useAppUser()

// Initialize professionals composable
const { createProfessional } = useProfessionals()

// Form state
const creating = ref(false)
const formData = ref({
  name: '',
  title: '',
  contactEmail: '',
  phone: '',
  bio: '',
  skills: '',
  yearsOfExperience: '',
  location: {
    city: '',
    state: '',
  },
  availability: '',
  workType: '',
})

// Form options
const experienceOptions = [
  'Less than 1 year',
  '1-2 years',
  '3-5 years',
  '6-10 years',
  'More than 10 years',
]

const availabilityOptions = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Flexible',
]

const workTypeOptions = ['On-site', 'Remote', 'Hybrid', 'Travel required']

// Form validation
const isFormValid = computed(() => {
  return formData.value.name.trim() && formData.value.title.trim()
})

// Create professional profile
async function onCreateProfile() {
  if (!isFormValid.value || creating.value) return

  creating.value = true

  try {
    // Parse skills into array
    const skillsArray = formData.value.skills
      ? formData.value.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean)
      : []

    // Prepare professional data
    const professionalData = {
      ...formData.value,
      skills: skillsArray,
      contactEmail: formData.value.contactEmail || appUser.value?.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Create the professional profile
    await createProfessional(professionalData)

    // Success feedback
    console.log('Professional profile created successfully!')

    // The page should automatically refresh to show the new profile
    // thanks to the reactivity in the parent component
  } catch (error) {
    console.error('Failed to create professional profile:', error)
    // You might want to show a toast or error message here
  } finally {
    creating.value = false
  }
}

// Initialize form with user data
onMounted(() => {
  if (appUser.value) {
    formData.value.name = appUser.value.displayName || ''
    formData.value.contactEmail = appUser.value.email || ''
  }
})
</script>

<style scoped>
.professional-create-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.professional-create-card {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
}

.create-header {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.create-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.create-description {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.create-content {
  padding: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.user-info-section {
  margin-bottom: 2rem;
}

.user-details {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.user-field {
  display: flex;
  margin-bottom: 0.5rem;
}

.user-field:last-child {
  margin-bottom: 0;
}

.field-label {
  font-weight: 600;
  width: 100px;
  color: #6b7280;
}

.field-value {
  color: #374151;
}

.form-section {
  margin-top: 2rem;
}

.create-form {
  margin-top: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: block;
}

.form-input {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.create-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 0.75rem 2rem;
  font-weight: 600;
  min-width: 200px;
}

@media (max-width: 768px) {
  .professional-create-container {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .create-title {
    font-size: 1.5rem;
  }

  .create-description {
    font-size: 1rem;
  }
}
</style>
