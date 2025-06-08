<template>
  <div class="account-email">
    <h3>Update Email</h3>
    <UInput
      v-model="newEmail"
      placeholder="Enter new email"
      type="email"
      class="input"
    />
    <UButton
      @click="handleUpdateEmail"
      :disabled="!newEmail"
      color="primary"
      class="button"
    >
      Update Email
    </UButton>
    <UButton
      @click="handleSendVerification"
      :disabled="!currentUser?.email"
      color="secondary"
      class="button"
    >
      Send Verification Email
    </UButton>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCurrentUser } from 'vuefire'
import { updateEmail, sendEmailVerification } from 'firebase/auth'

const newEmail = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const currentUser = useCurrentUser()

async function handleUpdateEmail() {
  successMessage.value = ''
  errorMessage.value = ''
  try {
    if (!currentUser.value) throw new Error('No user signed in')
    await updateEmail(currentUser.value, newEmail.value)
    successMessage.value = '✅ Email updated successfully.'
  } catch (error) {
    errorMessage.value = `❌ ${error.message}`
  }
}

async function handleSendVerification() {
  successMessage.value = ''
  errorMessage.value = ''
  try {
    if (!currentUser.value) throw new Error('No user signed in')
    await sendEmailVerification(currentUser.value)
    successMessage.value = '✅ Verification email sent.'
  } catch (error) {
    errorMessage.value = `❌ ${error.message}`
  }
}
</script>

<style scoped>
.account-email {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.input {
  width: 100%;
}
.button {
  width: fit-content;
}
.success {
  color: var(--success);
}
.error {
  color: var(--error);
}
</style>
