<template>
  <div>
    <WorkspaceGreeting family="Kitchen" />
    <p v-if="!hasAuthState">Checking sign-in…</p>
    <template v-else-if="isAuthenticated">
      <p>
        Signed in as
        {{ currentUser?.displayName || currentUser?.email || currentUser?.uid }}
      </p>
      <section class="mt-4" aria-labelledby="workspace-kitchens">
        <h2 id="workspace-kitchens" class="font-semibold">Your Kitchens</h2>
        <p v-if="outcome === 'pending'" role="status">Loading Kitchens…</p>
        <p v-else-if="outcome === 'error'" role="alert">
          Unable to load your Kitchens.
        </p>
        <p v-else-if="outcome === 'empty'">You have no available Kitchens.</p>
        <ul v-else-if="outcome === 'ready'" class="list-disc ps-5">
          <li v-for="kitchen in kitchens" :key="kitchen.id">
            <NuxtLink
              :to="`/workspace/kitchens/${encodeURIComponent(kitchen.id)}`"
              class="underline"
            >
              {{ kitchen.name }}
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
    <p v-else-if="lastBindError">Unable to check sign-in.</p>
    <UButton v-else :to="signInPath">Sign in</UButton>
  </div>
</template>

<script setup lang="ts">
import WorkspaceGreeting from 'fireux-workspace/runtime/workspace/components/Greeting.vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { authRedirectPath } from 'fireux-core/runtime/user/utils/auth-redirect'
import { useKitchenCollection } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenCollection'

definePageMeta({ requiresAuth: false })

const { currentUser, hasAuthState, isAuthenticated, lastBindError } = useAuth()
const { kitchens, outcome } = useKitchenCollection({
  enabled: () => hasAuthState.value && isAuthenticated.value,
})
const signInPath = authRedirectPath('/workspace')
</script>
