<template>
  <WorkspaceGreeting family="Kitchen" />
  <p v-if="!hasAuthState">Checking sign-in…</p>
  <p v-else-if="isAuthenticated">
    Signed in as
    {{ currentUser?.displayName || currentUser?.email || currentUser?.uid }}
  </p>
  <p v-else-if="lastBindError">Unable to check sign-in.</p>
  <UButton v-else :to="signInPath">Sign in</UButton>
</template>

<script setup lang="ts">
import WorkspaceGreeting from 'fireux-workspace/runtime/workspace/components/Greeting.vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { authRedirectPath } from 'fireux-core/runtime/user/utils/auth-redirect'

definePageMeta({ layout: 'workspace', requiresAuth: false })

const { currentUser, hasAuthState, isAuthenticated, lastBindError } = useAuth()
const signInPath = authRedirectPath('/workspace')
</script>
