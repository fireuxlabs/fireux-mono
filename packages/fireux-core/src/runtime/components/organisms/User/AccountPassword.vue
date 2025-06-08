<template>
  <UCard>
    <template #default>
      <h2>Change Password</h2>
      <p class="description">Update your account password below.</p>

      <UForm class="form" @submit.prevent="handleChangePassword">
        <UFormGroup label="New Password" name="new-password">
          <UInput
            v-model="newPassword"
            type="password"
            placeholder="Enter new password"
            required
          />
        </UFormGroup>

        <UFormGroup label="Confirm Password" name="confirm-password">
          <UInput
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
          />
        </UFormGroup>

        <UButton type="submit" color="primary" block>Update Password</UButton>
      </UForm>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </template>
  </UCard>
</template>

<script setup>
import { ref } from 'vue'
import { updatePassword } from 'firebase/auth'
import { useCurrentUser } from 'vuefire'

const currentUser = useCurrentUser()

const newPassword = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')

async function handleChangePassword() {
  errorMessage.value = ''
  successMessage.value = ''

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (!currentUser.value) {
    errorMessage.value = 'No authenticated user found.'
    return
  }

  try {
    await updatePassword(currentUser.value, newPassword.value)
    successMessage.value = 'Password updated successfully.'
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.description {
  margin-top: var(--space-2);
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.error {
  color: var(--error-color);
  margin-top: var(--space-2);
  font-size: 0.9rem;
}

.success {
  color: var(--success-color);
  margin-top: var(--space-2);
  font-size: 0.9rem;
}
</style>
