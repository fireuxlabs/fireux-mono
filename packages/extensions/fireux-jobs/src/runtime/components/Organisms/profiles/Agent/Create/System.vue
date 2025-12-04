<template>
  <div class="agent-create-container">
    <UCard class="agent-create-card">
      <template #header>
        <div class="create-header">
          <h2 class="create-title">Create Agent Profile</h2>
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
              <span class="field-value">{{ accountDisplayName }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">Agency Information</h3>
          <form @submit.prevent="onCreateAgent" class="create-form">
            <div class="form-grid">
              <UFormGroup
                label="Agency Name*"
                required
                class="form-group full-width"
              >
                <UInput
                  v-model="formData.companyName"
                  placeholder="Enter your agency name"
                  required
                />
              </UFormGroup>

              <UFormGroup label="Contact Email" class="form-group">
                <UInput
                  v-model="formData.contactEmail"
                  type="email"
                  placeholder="Company contact email"
                />
              </UFormGroup>

              <UFormGroup label="Website" class="form-group">
                <UInput
                  v-model="formData.website"
                  placeholder="yourcompany.com"
                />
              </UFormGroup>

              <UFormGroup
                label="Agency Description"
                class="form-group full-width"
              >
                <UTextarea
                  v-model="formData.description"
                  placeholder="Tell us about your agency..."
                  :rows="4"
                />
              </UFormGroup>
            </div>

            <div class="form-actions">
              <UButton
                type="submit"
                :loading="isSubmitting"
                :disabled="!isFormValid || isSubmitting"
                size="lg"
                color="primary"
                class="create-button"
              >
                Create Agent Profile
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Get current user data
const { appUser } = useAppUser()

const accountDisplayName = computed(() => {
  const user = appUser.value
  if (!user) return 'Your account'

  return (
    user.full_name ||
    user.displayName ||
    user.handle ||
    user.uid ||
    user.id ||
    'Your account'
  )
})

// Initialize agent composable helpers
const { createAgent } = useAgent()

// Form state
const formData = ref({
  companyName: '',
  contactEmail: '',
  website: '',
  description: '',
})

// Form validation
const isFormValid = computed(() => {
  return formData.value.companyName.trim()
})

const isSubmitting = ref(false)

async function onCreateAgent() {
  if (!isFormValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true
    await createAgent()

    // Success feedback
    console.log('Agent profile created successfully!')

    // The page should automatically refresh to show the new profile
    // thanks to the reactivity in the parent component
  } catch (err) {
    console.error('Failed to create agent profile:', err)
    // You might want to show a toast or error message here
  } finally {
    isSubmitting.value = false
  }
}

// Initialize form with user data
onMounted(() => {
  if (appUser.value) {
    formData.value.contactEmail = appUser.value.email || ''
  }
})
</script>

<style scoped>
/* FireUX Pattern-Compliant Agent Create System */

.agent-create-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-6);
}

.agent-create-card {
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
  .agent-create-container {
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
