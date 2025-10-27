<template>
  <div class="auth-authenticated">
    <div class="button-group">
      <UButton block @click="handlePrimary">
        {{ primaryLabel }}
      </UButton>
      <UButton block @click="handleSignOut">Sign Out</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useUserEnsure } from 'fireux-core/runtime/composables/firestore/core/user/useUserEnsure.ts'
import { useUser } from 'fireux-core/runtime/composables/firestore/core/user/useUser.ts'

const router = useRouter()
const { signOutUser } = useAuth()
const { ensureUser } = useUserEnsure()
const { hasCoreProfile } = useUser()

const primaryLabel = computed(() =>
  hasCoreProfile.value ? 'Go to Dashboard' : 'Create Core User'
)

const handlePrimary = async () => {
  if (hasCoreProfile.value) {
    await router.push('/dashboard')
    return
  }

  await ensureUser()
}

const handleSignOut = async () => {
  await signOutUser()
  router.push('/auth')
}
</script>

<style scoped>
.auth-authenticated {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}
.button-group {
  flex-direction: column;
  margin: 0;
}
</style>
