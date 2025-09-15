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
        <!-- User Information Section -->
        <div class="user-info-section">
          <h3 class="section-title">Your Information</h3>
          <div class="user-details" v-if="appUser">
            <div class="user-field">
              <span class="field-label">Name:</span>
              <span class="field-value">{{
                appUser.full_name || appUser.displayName || appUser.email
              }}</span>
            </div>
            <div class="user-field">
              <span class="field-label">Email:</span>
              <span class="field-value">{{ appUser.email }}</span>
            </div>
          </div>
        </div>

        <!-- Professional Details Form -->
        <div class="form-section">
          <h3 class="section-title">Professional Details</h3>
          <form @submit.prevent="onCreateProfile" class="create-form">
            <div class="form-grid">
              <!-- Basic Information -->
              <UFormGroup label="Full Name*" required class="form-group">
                <UInput
                  v-model="formData.full_name"
                  placeholder="Enter your full name"
                  required
                />
              </UFormGroup>

              <UFormGroup
                label="Professional Title*"
                required
                class="form-group"
              >
                <UInput
                  v-model="formData.title"
                  placeholder="e.g. Senior Chef, Cleaning Specialist"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Contact Email" class="form-group">
                <UInput
                  v-model="formData.contactEmail"
                  type="email"
                  placeholder="Your professional contact email"
                />
              </UFormGroup>

              <UFormGroup label="Phone Number" class="form-group">
                <UInput
                  v-model="formData.phone"
                  placeholder="Your phone number"
                />
              </UFormGroup>

              <!-- Full Width Fields -->
              <UFormGroup
                label="Professional Bio"
                class="form-group full-width"
              >
                <UTextarea
                  v-model="formData.bio"
                  placeholder="Tell potential employers about your experience and skills..."
                  :rows="4"
                />
              </UFormGroup>

              <UFormGroup label="Skills" class="form-group full-width">
                <UInput
                  v-model="formData.skills"
                  placeholder="Enter skills separated by commas (e.g. Cooking, Customer Service, Time Management)"
                />
              </UFormGroup>

              <UFormGroup
                label="Years of Experience"
                class="form-group full-width"
              >
                <USelect
                  v-model="formData.yearsOfExperience"
                  :options="experienceOptions"
                  placeholder="Select your experience level"
                />
              </UFormGroup>

              <!-- Location Section -->
              <UFormGroup label="City" class="form-group">
                <UInput
                  v-model="formData.location.city"
                  placeholder="Your city"
                />
              </UFormGroup>

              <UFormGroup label="State/Province" class="form-group">
                <UInput
                  v-model="formData.location.state"
                  placeholder="Your state or province"
                />
              </UFormGroup>

              <!-- Work Preferences -->
              <UFormGroup label="Availability" class="form-group">
                <USelect
                  v-model="formData.availability"
                  :options="availabilityOptions"
                  placeholder="Select your availability"
                />
              </UFormGroup>

              <UFormGroup label="Preferred Work Type" class="form-group">
                <USelect
                  v-model="formData.workType"
                  :options="workTypeOptions"
                  placeholder="Select preferred work type"
                />
              </UFormGroup>
            </div>

            <div class="form-actions">
              <UButton
                type="submit"
                :loading="creating"
                :disabled="!isFormValid"
                size="lg"
                color="primary"
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
// Get current user
const { appUser } = useAppUser()

// Initialize professional create composable
const { createProfessional, creating, error } = useProfessionalCreate()

// Form state
const formData = ref({
  full_name: '',
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
  return formData.value.full_name.trim() && formData.value.title.trim()
})

// Create professional profile
async function onCreateProfile() {
  if (!isFormValid.value || creating.value) return

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
    }

    // Create the professional profile with all form data
    await createProfessional(professionalData)

    // Success feedback
    console.log('Professional profile created successfully!')

    // The page should automatically refresh to show the new profile
    // thanks to the reactivity in the parent component
  } catch (err) {
    console.error('Failed to create professional profile:', err)
    // You might want to show a toast or error message here
  }
}

// Initialize form with user data
onMounted(() => {
  if (appUser.value) {
    formData.value.full_name =
      appUser.value.full_name || appUser.value.displayName || ''
    formData.value.contactEmail = appUser.value.email || ''
  }
})
</script>

<style scoped>
/* FireUX Pattern-Compliant Professional Create System */

.professional-create-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6);
}

.professional-create-card {
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.create-header {
  text-align: center;
  padding: var(--space-4);
}

.create-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.create-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}

.create-content {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-title {
  font-size: var(--text-lg);
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--text-primary);
  border-bottom: 1px solid var(--ui-border);
  padding-bottom: var(--space-2);
}

.user-info-section {
  padding: var(--space-4);
  background-color: var(--ui-bg-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--ui-border);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.user-field {
  display: flex;
  gap: var(--space-2);
}

.field-label {
  font-weight: 500;
  min-width: 60px;
  color: var(--text-secondary);
}

.field-value {
  color: var(--text-primary);
}

.form-section {
  display: flex;
  flex-direction: column;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--ui-border);
}

.create-button {
  min-width: 200px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .professional-create-container {
    padding: var(--space-4);
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .create-title {
    font-size: var(--text-xl);
  }

  .create-description {
    font-size: var(--text-sm);
  }
}
</style>
