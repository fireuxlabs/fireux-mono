<template>
  <div class="core-user-create-system">
    <UCard>
      <template #header>
        <div class="header-content">
          <UIcon name="i-heroicons-user-plus" class="header-icon" />
          <div>
            <h3>Create Core User Profile</h3>
            <p class="header-description">Set up your global FireUX profile</p>
          </div>
        </div>
      </template>

      <div class="system-info">
        <UAlert
          color="blue"
          variant="soft"
          title="Core User Profile"
          description="This creates your global FireUX identity that works across all apps in the ecosystem."
        />
      </div>

      <UForm
        :schema="schema"
        :state="formData"
        @submit="handleSubmit"
        @error="handleError"
      >
        <div class="form-section">
          <h4 class="section-title">
            <UIcon name="i-heroicons-identification" class="section-icon" />
            Personal Information
          </h4>

          <UFormGroup label="Display Name *" name="displayName" required>
            <UInput
              v-model="formData.displayName"
              placeholder="How should others see your name?"
              :disabled="loading"
            />
          </UFormGroup>

          <UFormGroup label="Email *" name="email" required>
            <UInput
              v-model="formData.email"
              type="email"
              placeholder="Your email address"
              :disabled="true"
            />
            <template #help>
              <span class="help-text"
                >Using your Firebase authentication email</span
              >
            </template>
          </UFormGroup>

          <UFormGroup label="Bio" name="bio">
            <UTextarea
              v-model="formData.bio"
              placeholder="Tell us about yourself (optional)"
              :rows="3"
              :disabled="loading"
            />
          </UFormGroup>
        </div>

        <div class="form-section">
          <h4 class="section-title">
            <UIcon name="i-heroicons-photo" class="section-icon" />
            Profile Picture
          </h4>

          <UFormGroup label="Avatar URL" name="avatarUrl">
            <UInput
              v-model="formData.avatarUrl"
              placeholder="Enter image URL (optional)"
              :disabled="loading"
            />
          </UFormGroup>

          <div v-if="formData.avatarUrl" class="avatar-preview">
            <UAvatar
              :src="formData.avatarUrl"
              :alt="formData.displayName || 'Preview'"
              size="lg"
            />
            <div class="preview-info">
              <span class="preview-label">Preview</span>
              <UButton
                color="gray"
                variant="ghost"
                size="xs"
                @click="formData.avatarUrl = ''"
              >
                Remove
              </UButton>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">
            <UIcon name="i-heroicons-cog-6-tooth" class="section-icon" />
            System Information
          </h4>

          <div class="system-fields">
            <UFormGroup label="User ID" name="uid">
              <UInput
                :model-value="currentUser?.uid || 'Not available'"
                disabled
              />
              <template #help>
                <span class="help-text"
                  >Your unique Firebase user identifier</span
                >
              </template>
            </UFormGroup>

            <div class="profiles-info">
              <div class="info-item">
                <span class="info-label">Initial Profiles:</span>
                <span class="info-value">Empty (add profiles later)</span>
              </div>
              <div class="info-item">
                <span class="info-label">Created:</span>
                <span class="info-value">{{
                  new Date().toLocaleString()
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            :loading="loading"
            :disabled="!isFormValid"
          >
            <template #leading>
              <UIcon name="i-heroicons-check" />
            </template>
            Create Core User Profile
          </UButton>

          <UButton
            color="gray"
            variant="soft"
            @click="$emit('cancel')"
            :disabled="loading"
          >
            Cancel
          </UButton>
        </div>

        <div class="creation-note">
          <UIcon name="i-heroicons-information-circle" class="note-icon" />
          <p>
            After creating your core profile, you can add specific profiles like
            Chef, Supplier, Employer, or Professional based on your needs.
          </p>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
import { z } from 'zod'

const { currentUser } = useCurrentUser()

const emit = defineEmits(['submit', 'cancel'])

// Form schema
const schema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
})

// Form state
const formData = reactive({
  displayName: '',
  email: currentUser.value?.email || '',
  bio: '',
  avatarUrl: '',
})

const loading = ref(false)

const isFormValid = computed(() => {
  return formData.displayName.length >= 2 && formData.email.includes('@')
})

const handleSubmit = async () => {
  if (!currentUser.value) {
    console.error('No current user available')
    return
  }

  loading.value = true
  try {
    const coreUserData = {
      uid: currentUser.value.uid,
      displayName: formData.displayName.trim(),
      email: formData.email.trim(),
      bio: formData.bio.trim() || null,
      avatarUrl: formData.avatarUrl.trim() || null,
      profiles: [], // Start with empty profiles array
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await emit('submit', coreUserData)
  } catch (error) {
    console.error('Error creating core user:', error)
  } finally {
    loading.value = false
  }
}

const handleError = (event) => {
  console.error('Form validation error:', event)
}

// Auto-populate email when user changes
watch(
  () => currentUser.value?.email,
  (newEmail) => {
    if (newEmail && !formData.email) {
      formData.email = newEmail
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.core-user-create-system {
  max-width: 600px;

  .header-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .header-icon {
      width: 1.5rem;
      height: 1.5rem;
      color: rgb(59 130 246);
    }

    h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .header-description {
      margin: 0;
      color: rgb(107 114 128);
      font-size: 0.875rem;
    }
  }

  .system-info {
    margin-bottom: 1.5rem;
  }

  .form-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgb(243 244 246);

    &:last-of-type {
      border-bottom: none;
      padding-bottom: 0;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: rgb(17 24 39);

    .section-icon {
      width: 1rem;
      height: 1rem;
      color: rgb(59 130 246);
    }
  }

  .help-text {
    color: rgb(107 114 128);
    font-size: 0.875rem;
  }

  .avatar-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
    padding: 1rem;
    background: rgb(249 250 251);
    border-radius: 0.5rem;
    border: 1px solid rgb(229 231 235);

    .preview-info {
      flex: 1;

      .preview-label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.5rem;
      }
    }
  }

  .system-fields {
    .profiles-info {
      margin-top: 1rem;
      padding: 1rem;
      background: rgb(249 250 251);
      border-radius: 0.5rem;
      border: 1px solid rgb(229 231 235);
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;

      &:last-child {
        margin-bottom: 0;
      }

      .info-label {
        font-weight: 500;
        color: rgb(75 85 99);
      }

      .info-value {
        color: rgb(107 114 128);
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
      }
    }
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgb(243 244 246);
    flex-wrap: wrap;
  }

  .creation-note {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    margin-top: 1.5rem;
    padding: 1rem;
    background: rgb(239 246 255);
    border-radius: 0.5rem;
    border-left: 4px solid rgb(59 130 246);

    .note-icon {
      width: 1.25rem;
      height: 1.25rem;
      color: rgb(59 130 246);
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    p {
      margin: 0;
      color: rgb(30 64 175);
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }
}
</style>
