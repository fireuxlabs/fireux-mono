<template>
  <section class="space-y-4 py-4" aria-label="Your Kitchen">
    <p v-if="reading || saving" role="status">Opening your Kitchen…</p>
    <template v-else-if="kitchen">
      <h2 class="text-xl font-semibold">{{ name }}</h2>
      <UButton
        @click="continueWithAccount"
        label="Continue with an account"
        icon="i-lucide-arrow-right"
      />
    </template>
    <UButton
      v-else-if="!readError"
      :disabled="!currentUser?.isAnonymous || !canCreate"
      label="Start your Kitchen"
      icon="i-lucide-plus"
      @click="void start()"
    />
    <UAlert
      v-if="error || readError"
      color="error"
      title="Your Kitchen could not be opened"
      :description="error || 'Try again in a moment.'"
    >
      <template #actions
        ><MoleculesCopyError
          :message="error || 'Your Kitchen could not be opened.'"
      /></template>
    </UAlert>
  </section>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { navigateTo } from '#imports'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  readGuestKitchenClaim,
  rememberGuestKitchenClaim,
} from '../../../utils/guest-kitchen-claim'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/utils/workspace-policy'
const { currentUser } = useAuth()
const config = useFireUXConfig()
const claim = ref(readGuestKitchenClaim(config.appId))
const id = computed(() =>
  currentUser.value?.isAnonymous
    ? claim.value?.kitchenId || currentUser.value.uid
    : null
)
const canCreate = computed(() =>
  resolveWorkspaceCanCreate(config.role, config.workspaceConfig, 'kitchen')
)
const { firestoreFetchDoc } = useFirestoreRead()
const source = firestoreFetchDoc<{
  id: string
  created?: { by?: string; app_id?: string }
}>('kitchens', id)
const place = firestoreFetchDoc<{ name?: string }>('places', id)
const reading = computed(() => source.pending.value || place.pending.value)
const readError = computed(() => source.error.value || place.error.value)
const kitchen = computed(() =>
  !reading.value &&
  !readError.value &&
  source.value?.created?.by === id.value &&
  source.value?.created?.app_id === config.appId
    ? source.value
    : null
)
const name = computed(
  () => place.value?.name || `kitchen-${id.value?.slice(0, 6)}`
)
const saving = ref(false)
const error = ref('')
async function start() {
  const user = currentUser.value
  if (!user?.isAnonymous || saving.value) return
  saving.value = true
  error.value = ''
  try {
    claim.value = await rememberGuestKitchenClaim(config.appId, user.uid)
    const token = await user.getIdToken()
    await $fetch<{ kitchen_id: string }>('/api/kitchens/onboarding/guest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { claim_secret: claim.value.secret },
    })
    return currentUser.value?.uid === user.uid
  } catch {
    error.value = 'Your Kitchen could not be opened. Please try again.'
  } finally {
    saving.value = false
  }
}
async function continueWithAccount() {
  // An intact anonymous session can prepare/retry creation; a retained recovery
  // key also survives a browser restart that replaced the anonymous identity.
  if (claim.value && claim.value.kitchenId !== currentUser.value?.uid) {
    await navigateTo('/auth')
  } else if (await start()) await navigateTo('/auth')
}
</script>
