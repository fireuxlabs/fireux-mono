<template>
  <div class="mx-auto w-full max-w-2xl space-y-6 py-8">
    <header class="space-y-2">
      <h1 class="text-2xl font-semibold text-highlighted">Set up ordering</h1>
      <p class="text-sm text-muted">Choose your Kitchen, configure its ordering, then test and install it on your website.</p>
    </header>
    <section v-if="signedIn" aria-label="Your Kitchens" class="space-y-3">
      <p v-if="myKitchens.outcome.value === 'pending'" role="status">
        Loading your Kitchens…
      </p>
      <UAlert
        v-else-if="myKitchens.outcome.value === 'error'"
        title="Your Kitchens could not be loaded"
        color="error"
      >
        <template #description
          ><MoleculesCopyError
            :message="
              String(
                myKitchens.error.value || 'Your Kitchens could not be loaded.'
              )
            "
        /></template>
      </UAlert>
      <template v-else-if="myKitchens.kitchens.value.length">
        <h2 class="font-semibold">Your Kitchens</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <WorkspaceSelectionRow
            v-for="kitchen in myKitchens.kitchens.value"
            :key="kitchen.id"
            :selected="selectedKitchenId === kitchen.id"
            @select="chooseKitchen(kitchen.id || '')"
          >
            <UAvatar
              :src="kitchen.display_image_url || undefined"
              :alt="kitchen.display_name"
              icon="i-lucide-chef-hat"
            />
            <span class="truncate">{{
              kitchen.display_name || kitchen.id
            }}</span>
            <UIcon
              v-if="selectedKitchenId === kitchen.id"
              name="i-lucide-check"
              class="ml-auto shrink-0 text-primary"
            />
          </WorkspaceSelectionRow>
        </div>
        <div v-if="selectedKitchen" class="space-y-3" role="status">
          <UAlert
            :title="`${selectedKitchen.display_name} selected`"
            color="success"
            icon="i-lucide-check-circle"
          />
          <UButton
            label="Use another Kitchen"
            color="neutral"
            variant="link"
            @click="chooseKitchen()"
          />
        </div>
      </template>
      <UAlert
        v-else-if="myKitchens.outcome.value === 'missing'"
        title="Your linked Kitchens are unavailable"
        color="warning"
      />
    </section>
    <div v-if="pendingKitchenId || (selectedKitchenId && !selectedKitchen)" class="space-y-2" role="status">
      <UAlert v-if="requestedKitchenUnavailable" title="This Kitchen is unavailable for this account" color="neutral" />
      <UAlert v-else-if="access.outcome.value === 'error' || myKitchens.outcome.value === 'error'" title="Kitchen access could not be checked" color="error" />
      <p v-else>Waiting for your Kitchen access to update…</p>
      <UButton label="Choose another Kitchen" variant="link" @click="chooseKitchen()" />
    </div>
    <KitchenOrderingSetup
      v-if="selectedKitchen"
      :key="selectedKitchenId"
      :kitchen-id="selectedKitchenId"
    />
    <KitchenOnboarding
      v-if="!selectedKitchen && !selectedKitchenId && !pendingKitchenId"
      :key="onboardingKey"
      mode="root"
      intent="directory"
      return-to="/services/ordering/setup"
      cancel-to="/services/ordering/setup"
      :select-workspace-on-complete="false"
      @created="onKitchenCreated"
    >
      <template #selected="{ preview }">
        <template v-if="preview.existing">
          <p v-if="access.outcome.value === 'pending'" role="status">
            Checking your Kitchen access…
          </p>
          <UAlert
            v-else-if="access.outcome.value === 'error'"
            title="Kitchen access could not be checked"
            color="error"
          >
            <template #description
              ><MoleculesCopyError
                :message="
                  String(
                    access.error.value || 'Kitchen access could not be checked.'
                  )
                "
            /></template>
          </UAlert>
          <UAlert
            v-else-if="access.outcome.value === 'idle'"
            title="Kitchen access is unavailable for this account"
            color="neutral"
          />
          <UAlert
            v-else
            :title="
              access.ids.value.includes(preview.kitchen_id)
                ? 'You can use this Kitchen'
                : 'You do not have management access to this Kitchen'
            "
            :color="
              access.ids.value.includes(preview.kitchen_id)
                ? 'success'
                : 'neutral'
            "
          />
          <p v-if="['ready', 'empty'].includes(access.outcome.value) && !access.ids.value.includes(preview.kitchen_id)" class="text-sm text-muted">
            Ask a Misebox administrator to review your access. Adding a listing does not authorize you to operate the venue.
          </p>
        </template>
      </template>
    </KitchenOnboarding>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useAppSession } from 'fireux-core/runtime/app/composables/useAppSession'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { KitchenOnboardingCompleteResult } from 'fireux-kitchens/runtime/kitchen/models/kitchen-onboarding.model'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import KitchenOrderingSetup from 'fireux-kitchens/runtime/kitchen/components/Ordering/Setup.vue'
import { useKitchenAccess } from 'fireux-kitchens/runtime/kitchen/composables/useKitchenAccess'
const { currentUser } = useAuth()
import { useKitchenWorkspaceKitchens } from 'fireux-kitchens/runtime/kitchen/composables/workspace/useKitchenWorkspaceKitchens'
const access = useKitchenAccess()
const signedIn = computed(() =>
  Boolean(currentUser.value && !currentUser.value.isAnonymous)
)
const myKitchens = useKitchenWorkspaceKitchens({ enabled: signedIn })
const route = useRoute()
const router = useRouter()
const selectedKitchenId = ref(typeof route.query.kitchen === 'string' ? route.query.kitchen : '')
const pendingKitchenId = ref('')
let initialScope = true
const session = useAppSession()
const config = useFireUXConfig()
const onKitchenCreated = computed(() => {
  const generation = onboardingKey.value
  const actor = currentUser.value
  return (result: KitchenOnboardingCompleteResult) => {
    if (generation !== onboardingKey.value || actor !== currentUser.value || !signedIn.value || result.owner_user_id !== actor?.uid || result.ok !== true) return
    pendingKitchenId.value = result.kitchen_id
  }
})
watch([pendingKitchenId, access.outcome, access.ids, myKitchens.outcome, myKitchens.kitchens], () => {
  const id = pendingKitchenId.value
  if (!id || access.outcome.value !== 'ready' || myKitchens.outcome.value !== 'ready') return
  if (!access.ids.value.includes(id) || !myKitchens.kitchens.value.some(kitchen => kitchen.id === id)) return
  chooseKitchen(id)
}, { flush: 'sync' })
const selectedKitchen = computed(() =>
  signedIn.value &&
  myKitchens.outcome.value === 'ready' &&
  access.outcome.value === 'ready' &&
  access.ids.value.includes(selectedKitchenId.value)
    ? myKitchens.kitchens.value.find(
        (kitchen) => kitchen.id === selectedKitchenId.value
      )
    : undefined
)
const requestedKitchenUnavailable = computed(() =>
  Boolean(selectedKitchenId.value) &&
  ['ready', 'empty'].includes(access.outcome.value) &&
  ['ready', 'empty', 'missing'].includes(myKitchens.outcome.value) &&
  (!access.ids.value.includes(selectedKitchenId.value) ||
    !myKitchens.kitchens.value.some(kitchen => kitchen.id === selectedKitchenId.value))
)
watch([myKitchens.outcome, access.outcome], ([outcome, accessOutcome]) => {
  if (signedIn.value && ['ready', 'empty'].includes(outcome) &&
    ['ready', 'empty'].includes(accessOutcome)) initialScope = false
}, { flush: 'sync' })
const onboardingKey = ref(0)
function chooseKitchen(id = '') {
  pendingKitchenId.value = ''
  onboardingKey.value += 1
  selectedKitchenId.value = id
  const query = { ...route.query }
  if (id) query.kitchen = id
  else delete query.kitchen
  void router.replace({ path: route.path, query, hash: route.hash })
}
watch(() => route.query.kitchen, (id) => {
  const next = typeof id === 'string' ? id : ''
  if (next === selectedKitchenId.value) return
  pendingKitchenId.value = ''
  onboardingKey.value += 1
  selectedKitchenId.value = next
}, { flush: 'sync' })
watch(
  [currentUser, () => config.appId, () => JSON.stringify(session.appUser.value?.created?.at ?? null)],
  ([actor, appId, membership], [previousActor, previousAppId, previousMembership]) => {
    // Initial credential hydration must not discard the URL's requested Kitchen.
    if (initialScope && appId === previousAppId &&
      (!previousActor || previousActor === actor) &&
      (previousMembership === 'null' || previousMembership === membership)) return
    initialScope = false
    chooseKitchen()
  },
  { flush: 'sync' }
)
</script>
