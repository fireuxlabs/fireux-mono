<template>
  <UContainer class="mx-auto max-w-lg py-12"
    ><UCard
      ><div class="space-y-5">
        <h1 class="text-2xl font-semibold">
          Open your connected Misebox account
        </h1>

        <p v-if="pending" role="status">Checking the connected account…</p>
        <template v-else-if="data">
          <p>Sign in as {{ data.localLabel }}.</p>
          <p
            v-if="
              currentUser &&
              !currentUser.isAnonymous &&
              currentUser.uid !== data.localUid
            "
            class="text-sm text-muted"
          >
            This will switch from
            {{
              currentUser.email ||
              currentUser.displayName ||
              'your current account'
            }}.
          </p>
        </template>
        <UButton
          :loading="busy"
          :disabled="busy || !hasAuthState || pending || !data"
          :label="busy ? 'Opening your account…' : 'Open connected account'"
          @click="finish"
        />
        <div v-if="error || readError" role="alert" class="space-y-2">
          <UAlert
            variant="subtle"
            color="error"
            title="Shared sign-in could not finish"
            :description="error || connectionFeedback(readError)"
          /><FireCopyError
            :message="error || connectionFeedback(readError)"
          /><UButton :to="startPath" label="Start again" variant="outline" />
        </div>
        <UButton
          :to="authPath"
          color="neutral"
          variant="ghost"
          label="Use usual Misebox sign-in"
          :disabled="busy"
        /></div></UCard
  ></UContainer>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { getAuth, signInWithCustomToken } from 'firebase/auth'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { connectionFeedback } from 'fireux-core/runtime/user/composables/connections/useAccountConnectionAction'
import { resolvePostAuthDestination } from 'fireux-core/runtime/utils/onboarding-route'
definePageMeta({ layout: 'auth' })
useHead({
  title: 'Open Misebox',
  meta: [
    { name: 'robots', content: 'noindex,nofollow' },
    { name: 'referrer', content: 'no-referrer' },
  ],
})
const route = useRoute()
const { currentUser, hasAuthState } = useAuth()
const busy = ref(false)
const error = ref('')
const {
  data,
  pending,
  error: readError,
} = useAsyncData(
  () => `shared-signin:${route.query.state}:${route.query.code}`,
  () =>
    $fetch<{ localUid: string; localLabel: string; returnTo: string }>(
      '/api/account/fireux',
      {
        query: { state: route.query.state, code: route.query.code },
      }
    ),
  { server: false }
)
const returnTo = computed(() =>
  resolvePostAuthDestination(data.value?.returnTo || route.query.redirect)
)
const authPath = computed(
  () => `/auth?redirect=${encodeURIComponent(returnTo.value)}`
)
const startPath = computed(
  () => `/account/fireux/start?redirect=${encodeURIComponent(returnTo.value)}`
)
const captureRoute = useCommandScope([() => route.fullPath])
const capture = useCommandScope([
  () => currentUser.value?.uid,
  () => route.fullPath,
])
async function finish() {
  if (busy.value) return
  const isCurrent = capture()
  const isRouteCurrent = captureRoute()
  busy.value = true
  error.value = ''
  try {
    const result = await $fetch<{
      customToken: string
      uid: string
      returnTo: string
    }>('/api/account/fireux', {
      method: 'POST',
      body: {
        action: 'signin',
        state: route.query.state,
        code: route.query.code,
      },
    })
    if (!isCurrent()) return
    const credential = await signInWithCustomToken(
      getAuth(),
      result.customToken
    )
    // The Auth System settles the existing User read before navigating onward.
    if (credential.user.uid !== result.uid)
      throw new Error('The connected account could not be verified.')
    if (isRouteCurrent() && getAuth().currentUser?.uid === result.uid)
      await navigateTo(
        `/auth?redirect=${encodeURIComponent(resolvePostAuthDestination(result.returnTo))}`,
        { replace: true }
      )
  } catch (failure) {
    if (isCurrent()) error.value = connectionFeedback(failure)
  } finally {
    busy.value = false
  }
}
</script>
