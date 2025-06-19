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
import { useRouter } from 'vue-router'

const router = useRouter()
const { signInWithEmailPassword, signUpWithEmailPassword } = useAuth()
const { ensureApp } = await useAppEnsure()

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
    console.log('[handleEmailAuth] ✅ Got UID:', user.uid)
    try {
      await ensureApp(user)
      router.push('/dashboard')
    } catch (error) {
      console.error('[handleEmailAuth] ❌ Error ensuring app:', error)
    }
  } else {
    console.warn('[handleEmailAuth] ❌ No UID returned from email auth')
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
