<template>
  <div class="email-auth">
    <UForm :state="state" class="form" @submit="handleEmailAuth">
      <UInput v-model="state.email" placeholder="Email" block />
      <div class="input-spacing" />
      <UInput
        v-model="state.password"
        type="password"
        placeholder="Password"
        block
      />
      <div class="switch-container">
        <USwitch
          v-model="isSignUp"
          :label="isSignUp ? 'Signing Up' : 'Signing In'"
        />
      </div>
      <UButton type="submit" block>
        {{ isSignUp ? 'Create Account' : 'Continue' }}
      </UButton>
    </UForm>
  </div>
</template>

<script setup>
const { signInWithEmailPassword, signUpWithEmailPassword } = useAuth()
const { ensureAppUser } = useAppUserEnsure()
const { isInitialized } = useApp()
const router = useRouter()

const isSignUp = ref(true)
const state = reactive({
  email: '',
  password: '',
})

const handleEmailAuth = async () => {
  const authMethod = isSignUp.value
    ? signUpWithEmailPassword
    : signInWithEmailPassword

  const user = await authMethod(state.email, state.password)

  if (user?.uid) {
    if (isInitialized.value) {
      await ensureAppUser(() => router.push('/dashboard')) // ✅ Ensure app user after authentication and redirect
    }
  }
}
</script>
<style scoped>
.switch-container {
  margin: var(--space-4) 0;
}
.input-spacing {
  margin-bottom: var(--space-3);
}
</style>
