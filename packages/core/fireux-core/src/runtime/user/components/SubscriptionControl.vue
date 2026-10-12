<template>
  <UButton
    v-if="showSubscription"
    :label="hasSubscription ? subscription.label : 'Subscription'"
    :icon="hasSubscription ? subscription.icon : 'i-lucide-badge'"
    :color="hasSubscription ? subscription.color : 'neutral'"
    variant="soft"
    size="xs"
    :to="hasSubscription && !canToggle ? '/pricing' : undefined"
    :disabled="saving || !hasSubscription"
    :loading="saving"
    class="rounded-full"
    :aria-label="
      !hasSubscription
        ? 'Subscription unavailable'
        : canToggle
          ? `Change ${subscription.label} subscription`
          : `View pricing for ${subscription.label}`
    "
    @click="toggle"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useToast } from '#imports'
import { useAppSession } from '../../app/composables/useAppSession'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useWorkspaceEntryState } from '../../composables/fireux/workspace/useWorkspaceEntryState'
import { useAppUserSubscriptions } from '../../app/composables/membership/useAppUserSubscriptions'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { resolveAppUserAccess } from '../../app/utils/app-user-access'
import { useCommandScope } from '../../composables/fireux/commands/useCommandScope'

const props = withDefaults(defineProps<{ alwaysVisible?: boolean }>(), {
  alwaysVisible: false,
})

const { currentUser, hasAuthState } = useAuth()
const { isGuest: guest } = useWorkspaceEntryState()
const session = useAppSession()
const config = useFireUXConfig()
const membership = computed(() => {
  const uid = currentUser.value?.uid
  return hasAuthState.value &&
    uid &&
    currentUser.value?.isAnonymous === false &&
    !session.pending.value &&
    !session.error.value &&
    session.uid.value === uid &&
    session.app.value?.id === config.appId &&
    session.appUser.value?.id === uid
    ? session.appUser.value
    : null
})
const access = computed(() => resolveAppUserAccess(membership.value))
const mounted = ref(false)
const showSubscription = computed(
  () =>
    mounted.value &&
    hasSubscription.value &&
    (props.alwaysVisible || access.value.hasMembership || guest.value)
)
const hasSubscription = computed(
  () => access.value.hasMembership || guest.value
)
const subscriptionId = computed(
  () =>
    (access.value.hasMembership ? access.value.subscription : undefined) ||
    (guest.value ? 'free' : undefined)
)
const { subscription, next, update } = useAppUserSubscriptions(subscriptionId)
const saving = ref(false)
const toast = useToast()
const canToggle = computed(() => access.value.hasAdminAuthority)
const captureIntent = useCommandScope([
  currentUser,
  hasAuthState,
  () => config.appId,
  session.uid,
  () => session.app.value?.id,
  () => session.appUser.value?.id,
  () => session.appUser.value?.role,
  () => session.appUser.value?.created?.at?.seconds,
  () => session.appUser.value?.created?.at?.nanoseconds,
  () => session.appUser.value?.created?.by,
  session.pending,
  session.error,
  canToggle,
])

onMounted(() => {
  mounted.value = true
})

async function toggle() {
  if (!hasSubscription.value || !canToggle.value || saving.value) return

  const isCurrent = captureIntent()
  const userId = session.uid.value
  const subscriptionId = next.value.id
  saving.value = true
  try {
    await update(subscriptionId, userId, isCurrent)
  } catch (error) {
    if (!isCurrent()) return
    toast.add({
      title: 'Subscription unchanged',
      description:
        error instanceof Error
          ? error.message
          : 'Your subscription could not be changed.',
      color: 'error',
    })
  } finally {
    // Busy follows this single in-flight command; no newer command can own it.
    saving.value = false
  }
}
</script>
