<template>
  <ClientOnly>
    <UModal
      :open="open"
      :dismissible="false"
      prevent-close
      title="Willkomme bi Interlaken Essen"
      description="No churz dini Registrierig abschliesse."
    >
      <template #body>
        <UAlert
          v-if="completed"
          color="success"
          variant="subtle"
          title="Merci fürs Registriere!"
          description="Du bisch jetzt bi Interlaken Essen debi."
        />

        <AuthOnboarding
          v-else
          title="Mach dini Registrierig fertig"
          description="So chasch du Interlaken Essen als lokali Marktplatz nutze."
          complete-label="Registrierig abschliesse"
          skip-label="Für itz überspringe"
          :loading="loading"
          :error="error"
          @submit="handleOnboarding"
        />
      </template>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

const { authState } = useAuth()
const {
  appUser,
  appPending,
  appOutcome,
  app: appUpdates,
} = useUser()
const { membership } = appUpdates

const loading = ref<'' | 'completed' | 'skipped'>('')
const error = ref('')
const completed = ref(false)
const dismissed = ref(false)

const open = computed(
  () =>
    !dismissed.value &&
    authState.value === 'AUTHENTICATED' &&
    !appPending.value &&
    appOutcome.value === 'ready' &&
    (appUser.value?.onboarding_status ?? 'pending') === 'pending'
)

async function handleOnboarding(status: 'completed' | 'skipped') {
  if (loading.value) return

  error.value = ''
  loading.value = status

  try {
    await membership.setOnboardingStatus(status)

    if (status === 'completed') {
      completed.value = true
      window.setTimeout(() => {
        dismissed.value = true
      }, 1800)
      return
    }

    dismissed.value = true
  } catch (cause) {
    error.value =
      cause instanceof Error && cause.message.trim()
        ? cause.message
        : 'D Registrierig het nid chönne gspeicheret wärde.'
  } finally {
    loading.value = ''
  }
}
</script>
