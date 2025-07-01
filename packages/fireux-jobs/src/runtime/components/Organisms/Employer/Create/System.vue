<template>
  <div class="employer-create-container">
    <UCard class="employer-create-card">
      <template #header>
        <div class="create-header">
          <h2 class="create-title">Create Employer Profile</h2>
          <p class="create-description">
            Set up your company profile to start posting jobs and connecting
            with professionals
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

        <div class="company-info-section">
          <h3 class="section-title">Company Information</h3>
          <UForm
            :state="employerForm"
            @submit="onCreateEmployer"
            class="employer-form"
          >
            <UFormGroup label="Company Name" name="companyName" required>
              <UInput
                v-model="employerForm.companyName"
                placeholder="Enter your company name"
              />
            </UFormGroup>

            <UFormGroup label="Contact Email" name="contactEmail">
              <UInput
                v-model="employerForm.contactEmail"
                type="email"
                placeholder="Company contact email"
              />
            </UFormGroup>

            <UFormGroup label="Website" name="website">
              <UInput
                v-model="employerForm.website"
                placeholder="yourcompany.com"
              />
            </UFormGroup>

            <UFormGroup label="Company Description" name="description">
              <UTextarea
                v-model="employerForm.description"
                placeholder="Tell us about your company..."
                rows="4"
              />
            </UFormGroup>

            <div class="form-actions">
              <UButton
                type="submit"
                color="primary"
                size="lg"
                :loading="creating"
              >
                Create Employer Profile
              </UButton>
            </div>
          </UForm>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { useEmployerCreate } from '../../../../composables/firestore/objects/Employer/useEmployerCreate'

// Get current user data
const { appUser } = useAppUser()

// Form state
const employerForm = reactive({
  companyName: '',
  contactEmail: computed(() => appUser.value?.email || ''),
  website: '',
  description: '',
})

// Create employer composable
const { createEmployer, creating, error } = useEmployerCreate()

async function onCreateEmployer() {
  if (!appUser.value) {
    console.error('No user logged in')
    return
  }

  try {
    // Prepare employer data
    const employerData = {
      uid: appUser.value.uid,
      company_name: employerForm.companyName,
      contact_email: employerForm.contactEmail,
      website: employerForm.website,
      description: employerForm.description,
      created_at: new Date(),
      updated_at: new Date(),
    }

    console.log('Creating employer profile:', employerData)

    const result = await createEmployer(employerData)

    if (result === 'success') {
      console.log('Employer profile created successfully!')
      // The employer profile will be automatically detected by the reactive composable
    }
  } catch (err) {
    console.error('Failed to create employer profile:', err)
  }
}
</script>

<style scoped>
.employer-create-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6);
}

.employer-create-card {
  width: 100%;
}

.create-header {
  text-align: center;
  margin-bottom: var(--space-4);
}

.create-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.create-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.create-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: var(--space-3);
  color: var(--text-primary);
}

.user-info-section {
  padding: var(--space-4);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius);
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
}

.field-value {
  color: var(--text-secondary);
}

.employer-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: var(--space-4);
}

@media (max-width: 640px) {
  .employer-create-container {
    padding: var(--space-4);
  }
}
</style>
