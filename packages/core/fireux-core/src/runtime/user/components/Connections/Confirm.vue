<template>
  <div class="space-y-4 rounded-xl border border-default p-4">
    <div>
      <h2 class="font-semibold">{{ title }}</h2>
      <p class="text-sm text-muted">
        {{
          currentUser?.email ||
          currentUser?.displayName ||
          'Your current account'
        }}
      </p>
    </div>
    <p v-if="description" class="text-sm">{{ description }}</p>
    <form
      v-if="hasPassword"
      class="space-y-3"
      @submit.prevent="confirm('password')"
    >
      <UFormField label="Confirm your password">
        <UInput
          v-model="password"
          type="password"
          autocomplete="current-password"
          class="w-full"
          :disabled="busy"
        />
      </UFormField>
      <UButton
        type="submit"
        :loading="busy"
        :disabled="!password || busy"
        :label="buttonLabel"
      />
    </form>
    <UButton
      v-if="hasGoogle"
      icon="i-logos-google-icon"
      :loading="busy"
      :disabled="busy"
      :label="`${buttonLabel} with Google`"
      @click="confirm('google')"
    />
    <p v-if="!hasGoogle && !hasPassword" class="text-sm text-muted">
      Use your usual Google or password sign-in to confirm this account.
    </p>
    <NuxtLink
      v-if="!hasGoogle && !hasPassword"
      :to="`/auth?redirect=${encodeURIComponent(route.fullPath)}`"
      class="text-primary"
      >Sign in again</NuxtLink
    >
    <div v-if="error" role="alert" class="space-y-2">
      <UAlert
        variant="subtle"
        color="error"
        title="Account confirmation failed"
        :description="error"
      />
      <MoleculesCopyError :message="error" />
    </div>
    <UButton
      v-if="cancelable"
      variant="ghost"
      color="neutral"
      label="Cancel"
      :disabled="busy"
      @click="emit('cancel')"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useCommandScope } from '../../../composables/fireux/commands/useCommandScope'
import type { ConfirmedAccount } from '../../composables/connections/useAccountConnectionAction'
defineProps<{
  title: string
  description?: string
  buttonLabel: string
  cancelable?: boolean
}>()
const emit = defineEmits<{
  confirmed: [account: ConfirmedAccount]
  cancel: []
}>()
const { currentUser } = useAuth()
const route = useRoute()
const capture = useCommandScope([
  () => currentUser.value?.uid,
  () => route.fullPath,
])
const hasGoogle = computed(() =>
  currentUser.value?.providerData.some((p) => p.providerId === 'google.com')
)
const hasPassword = computed(() =>
  currentUser.value?.providerData.some((p) => p.providerId === 'password')
)
const password = ref('')
const busy = ref(false)
const error = ref('')
watch(
  () => currentUser.value?.uid,
  () => {
    password.value = ''
    busy.value = false
    error.value = ''
  },
  { flush: 'sync' }
)
async function confirm(provider: 'google' | 'password') {
  const user = currentUser.value
  if (!user || busy.value) return
  const isCurrent = capture()
  busy.value = true
  error.value = ''
  try {
    if (provider === 'google') {
      const google = new GoogleAuthProvider()
      google.setCustomParameters({ prompt: 'select_account' })
      await reauthenticateWithPopup(user, google)
    } else {
      if (!user.email) throw new Error()
      await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, password.value)
      )
    }
    password.value = ''
    if (!isCurrent()) return
    const token = await user.getIdToken(true)
    if (isCurrent()) emit('confirmed', { uid: user.uid, token })
  } catch (failure) {
    if (isCurrent()) {
      const code = String((failure as { code?: string })?.code || '')
      error.value =
        code === 'auth/popup-closed-by-user'
          ? 'Confirmation cancelled. Try again when you are ready.'
          : code === 'auth/user-mismatch'
            ? 'Choose the same account shown above.'
            : 'Your account could not be confirmed. Check your sign-in and try again.'
    }
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
