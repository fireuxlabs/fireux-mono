<template>
  <client-only>
    <UContainer v-if="appUser" class="profile-edit-component">
      <!-- Edit Toggle Button -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="profile-section-title">Account Password</h3>
        <UButton
          :icon="
            isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'
          "
          variant="ghost"
          size="sm"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? 'Hide' : 'Edit' }}
        </UButton>
      </div>

      <!-- Account Password Section -->
      <div v-show="isExpanded" class="profile-info-section">
        <div class="profile-fields-container">
          <div class="mb-4">
            <p class="profile-section-description">
              Update your account password to keep your account secure.
            </p>
          </div>

          <!-- Password Change Form -->
          <UFormGroup label="Current Password" class="form-group">
            <UInput
              v-model="passwordForm.currentPassword"
              type="password"
              placeholder="Enter your current password"
              :disabled="updating"
            />
          </UFormGroup>

          <UFormGroup label="New Password" class="form-group">
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="Enter new password"
              :disabled="updating"
            />
          </UFormGroup>

          <UFormGroup label="Confirm New Password" class="form-group">
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm new password"
              :disabled="updating"
            />
          </UFormGroup>

          <!-- Action Button -->
          <div class="flex justify-start mt-6">
            <UButton
              :loading="updating"
              :disabled="!isPasswordFormValid"
              @click="updatePassword"
              color="primary"
            >
              Update Password
            </UButton>
          </div>

          <!-- Security Notice -->
          <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start">
              <UIcon
                name="i-heroicons-shield-check"
                class="text-blue-600 mt-0.5 mr-2"
              />
              <div class="text-sm text-blue-800">
                <p class="font-medium">Password Requirements:</p>
                <ul class="mt-1 list-disc list-inside space-y-1">
                  <li>At least 8 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UContainer>
    <div v-else>
      <FireMoleculesLoading message="Loading account information..." />
    </div>
  </client-only>
</template>

<script setup>
const { appUser } = useAppUser()

// Toggle state for edit mode
const isExpanded = ref(false)
const updating = ref(false)

// Password form state
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Form validation
const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.currentPassword.length >= 1 &&
    passwordForm.value.newPassword.length >= 8 &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
  )
})

// Update password function
async function updatePassword() {
  if (!isPasswordFormValid.value) return

  updating.value = true
  try {
    // TODO: Implement password update logic with Firebase Auth
    console.log('Password update requested')

    // Reset form on success
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    // Close the form
    isExpanded.value = false
  } catch (error) {
    console.error('Failed to update password:', error)
  } finally {
    updating.value = false
  }
}
</script>

<style scoped>
/* Uses shared profile styles from main.css */
.form-group {
  margin-bottom: 1rem;
}
</style>
